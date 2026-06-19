"""Sanatan streaming voice bot — Pipecat cascaded pipeline over a FastAPI WebSocket.

Per connection:  mic PCM  →  Sarvam STT (streaming, auto-detect language + VAD)  →
Anthropic Haiku (streaming, persona)  →  Sarvam TTS (streaming, the deity's voice)  →
audio back to the app, with VAD turn-taking and barge-in.

The client opens:  wss://<host>/ws?mode=deity&deity=krishna&lang=hi
                   wss://<host>/ws?mode=guide&lang=en

Targets Pipecat 1.x (verified against the 1.4.0 source: universal LLMContext, the
`pipecat.transports.websocket.fastapi` transport, and the Sarvam STT/TTS services).
"""

from __future__ import annotations

import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Query, WebSocket
from loguru import logger

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.serializers.protobuf import ProtobufFrameSerializer
from pipecat.services.anthropic.llm import AnthropicLLMService
from pipecat.services.sarvam.stt import SarvamSTTService
from pipecat.services.sarvam.tts import SarvamTTSService
from pipecat.transports.websocket.fastapi import (
    FastAPIWebsocketParams,
    FastAPIWebsocketTransport,
)

from personas import (
    DEFAULT_LANG,
    DEITIES,
    GUIDE_VOICE,
    LANGUAGES,
    deity_system_prompt,
    guide_system_prompt,
    is_deity_id,
    is_language,
)

load_dotenv()

SARVAM_API_KEY = os.environ["SARVAM_API_KEY"]
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
STT_SAMPLE_RATE = 16000  # mic input / Silero VAD
TTS_SAMPLE_RATE = 22050  # bulbul:v2 default

app = FastAPI()


@app.get("/health")
async def health():
    return {"ok": True, "service": "sanatan-voicebot"}


@app.websocket("/ws")
async def ws_endpoint(
    websocket: WebSocket,
    mode: str = Query("deity"),
    deity: str = Query("ganesha"),
    lang: str = Query(DEFAULT_LANG),
):
    await websocket.accept()

    # ── Resolve persona, voice, and language from the connection params ──
    if not is_language(lang):
        lang = DEFAULT_LANG
    _lang_name, pipecat_lang, _bcp47 = LANGUAGES[lang]

    if mode == "guide":
        system = guide_system_prompt(lang)
        speaker = GUIDE_VOICE["speaker"]
        pitch, pace = GUIDE_VOICE["pitch"], GUIDE_VOICE["pace"]
        kickoff = (
            "The devotee has just arrived. Greet them in one short warm sentence as the "
            "Sanatan guide and invite their question."
        )
    else:
        if not is_deity_id(deity):
            deity = "ganesha"
        system = deity_system_prompt(deity, lang)
        d = DEITIES[deity]
        speaker, pitch, pace = d.speaker, d.pitch, d.pace
        kickoff = "The devotee has just arrived for darshan. Greet them warmly in one short sentence."

    logger.info(f"voice session: mode={mode} deity={deity} lang={lang} speaker={speaker}")

    # ── Transport: audio in/out over the FastAPI WebSocket, Silero VAD for turn-taking ──
    transport = FastAPIWebsocketTransport(
        websocket,
        FastAPIWebsocketParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            add_wav_header=False,
            vad_analyzer=SileroVADAnalyzer(),
            serializer=ProtobufFrameSerializer(),
        ),
    )

    # ── Services ──
    # STT: streaming Sarvam. saaras:v3 auto-detects the spoken language (default
    # "unknown"), so the devotee can speak any supported language naturally.
    stt = SarvamSTTService(
        api_key=SARVAM_API_KEY,
        model="saaras:v3",
        mode="transcribe",
        sample_rate=STT_SAMPLE_RATE,
    )

    # LLM: Haiku, the same brain as the text agent. Short replies → spoken-friendly.
    llm = AnthropicLLMService(
        api_key=ANTHROPIC_API_KEY,
        model="claude-haiku-4-5",
        params=AnthropicLLMService.InputParams(max_tokens=300),
    )

    # TTS: streaming Sarvam in the deity's own voice (distinct speaker + pitch + pace).
    # InputParams carries pitch/pace/loudness (bulbul:v2 only); voice_id is the speaker.
    tts = SarvamTTSService(
        api_key=SARVAM_API_KEY,
        model="bulbul:v2",
        voice_id=speaker,
        sample_rate=TTS_SAMPLE_RATE,
        params=SarvamTTSService.InputParams(
            language=pipecat_lang,
            pitch=pitch,
            pace=pace,
        ),
    )

    # ── Context: universal LLMContext (1.x) seeded with the persona system prompt ──
    context = LLMContext(messages=[{"role": "system", "content": system}])
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(context)

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            user_aggregator,
            llm,
            tts,
            transport.output(),
            assistant_aggregator,
        ]
    )

    # Interruptions/barge-in are on by default in 1.x when a VAD analyzer is present.
    task = PipelineTask(pipeline, params=PipelineParams(enable_metrics=True))

    # Speak first: the deity/guide opens the conversation in the chosen language.
    @transport.event_handler("on_client_connected")
    async def on_client_connected(_transport, _client):
        context.add_message({"role": "user", "content": kickoff})
        await task.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(_transport, _client):
        await task.cancel()

    runner = PipelineRunner(handle_sigint=False)
    await runner.run(task)


if __name__ == "__main__":
    # Render injects PORT; default to 7860 for local dev. Never hardcode PORT.
    port = int(os.getenv("PORT", "7860"))
    uvicorn.run(app, host="0.0.0.0", port=port)
