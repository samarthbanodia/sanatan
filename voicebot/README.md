# Sanatan voice bot (Pipecat)

Real-time streaming voice agent for the deity conversations **and** the Sanatan knowledge
Guide. Cascaded pipeline, all keys server-side:

```
app mic (PCM)  →  Sarvam STT (saaras:v3 codemix, streaming + VAD)
               →  Anthropic Haiku (claude-haiku-4-5, streaming, persona)
               →  Sarvam TTS (bulbul:v2, the deity's voice, streaming)
               →  audio back to the app     (+ barge-in / interruptions)
```

This service is **separate** from the Node backend in `../server` (which keeps `/chat`,
`/voice`, `/guide`, `/guide/plan`). It does the realtime voice only.

## Endpoints

- `GET /health` → `{ ok: true }`
- `WS  /ws?mode=deity&deity=<id>&lang=<code>` — talk to a deity
- `WS  /ws?mode=guide&lang=<code>` — talk to the knowledge guide

`deity` ∈ ganesha · krishna · shiva · durga · hanuman · lakshmi
`lang`  ∈ hi · en · ta · te · bn · mr  (matches the app's selector)

The client must speak Pipecat's WebSocket protocol (`ProtobufFrameSerializer`). The React
Native client lands in the dev-build phase via `@pipecat-ai/react-native-*` +
`react-native-webrtc` audio.

## Run locally

```bash
cd voicebot
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env        # fill SARVAM_API_KEY + ANTHROPIC_API_KEY
python bot.py              # serves on http://localhost:7860
```

## Deploy on Render (must be a non-sleeping instance)

Realtime voice cannot tolerate free-tier cold starts — use a **Starter** instance (~$7/mo)
so the WebSocket stays warm.

- **New Web Service** → repo `samarthbanodia/sanatan`, branch `main`
- **Root Directory:** `voicebot`
- **Runtime:** Python
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python bot.py`  (reads Render's injected `$PORT`)
- **Env vars:** `SARVAM_API_KEY`, `ANTHROPIC_API_KEY`
- **Instance type:** Starter (not Free)

> ⚠️ Same auto-deploy caveat as the Node service: the GitHub→Render webhook isn't firing,
> so deploys currently need a Manual Deploy from the dashboard.

## Status / caveats (read before first deploy)

- **Not yet run end-to-end.** Pipeline shape, Sarvam STT/TTS settings, and Anthropic wiring
  follow the current Pipecat + Sarvam docs, but no live smoke test has happened (needs keys).
- **Verify imports at first run.** Pipecat occasionally moves modules between releases —
  most likely `pipecat.transports.network.fastapi_websocket`. After it runs, **pin
  `pipecat-ai`** to the working version in `requirements.txt`.
- **Sarvam streaming must be enabled** on the account/key (sometimes gated separately from
  the batch API).
- **Per-deity voices** come from `personas.py`, the Python mirror of
  `server/src/personas.ts` — keep the two in sync.
