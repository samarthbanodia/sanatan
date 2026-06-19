import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import FadeIn from '../components/FadeIn';
import PressableScale from '../components/PressableScale';
import { colors, fonts, gradients, radii, sp, type } from '../theme/theme';
import { ritualStepLabels } from '../data/taxonomy';
import { trackById } from '../data/content';
import { todayGuide } from '../data/festivals';
import { usePlayback } from '../state/playback';
import { useGuideSession, GuideLanguage, PoojaPlan } from '../voice/useGuideSession';

const LANGS: { code: GuideLanguage; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'ta', label: 'த' },
  { code: 'te', label: 'తె' },
  { code: 'bn', label: 'বাং' },
  { code: 'mr', label: 'मरा' },
];

const QUICK: { label: string; kind: 'ask' | 'plan' }[] = [
  { label: 'How to do Satyanarayan Puja?', kind: 'plan' },
  { label: 'Plan a Diwali Lakshmi puja', kind: 'plan' },
  { label: 'Why do we light a diya?', kind: 'ask' },
  { label: 'What is the meaning of Om?', kind: 'ask' },
];

function PlanCard({ plan }: { plan: PoojaPlan }) {
  return (
    <FadeIn rise={10} style={styles.planWrap}>
      <GlassCard style={styles.planCard}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        {!!(plan.deity || plan.occasion) && (
          <Text style={styles.planMeta}>{[plan.deity, plan.occasion].filter(Boolean).join(' · ')}</Text>
        )}
        {!!plan.summary && <Text style={styles.planSummary}>{plan.summary}</Text>}

        {plan.materials?.length > 0 && (
          <View style={styles.matBox}>
            <Text style={styles.matHead}>You’ll need</Text>
            <Text style={styles.matText}>{plan.materials.join('  ·  ')}</Text>
          </View>
        )}

        {plan.steps?.map((s, i) => {
          const label = (ritualStepLabels as Record<string, string>)[s.ritualStep];
          return (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                {!!label && <Text style={styles.stepKind}>{label}</Text>}
                {!!s.mantra && <Text style={styles.mantra}>{s.mantra}</Text>}
                {!!s.transliteration && <Text style={styles.translit}>{s.transliteration}</Text>}
                {!!s.note && <Text style={styles.stepNote}>{s.note}</Text>}
                {!!(s.materials && s.materials.length) && (
                  <Text style={styles.stepMat}>{s.materials.join('  ·  ')}</Text>
                )}
              </View>
            </View>
          );
        })}

        {!!plan.closing && <Text style={styles.closing}>{plan.closing}</Text>}
        {!!plan.disclaimer && <Text style={styles.disclaimer}>{plan.disclaimer}</Text>}
      </GlassCard>
    </FadeIn>
  );
}

export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState<GuideLanguage>('en');
  const { turns, state, sendText, requestPlan } = useGuideSession(language);
  const [input, setInput] = useState('');
  const pb = usePlayback();
  const scrollRef = useRef<ScrollView>(null);
  const today = todayGuide();
  const cardTitle = today.festival ? today.festival.name : today.weekday.title;
  const cardBlurb = today.festival ? today.festival.blurb : today.weekday.blurb;
  const firstTrackId = (today.festival?.trackIds ?? today.weekday.trackIds)[0];

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [turns, state]);

  const onSend = () => {
    const t = input.trim();
    if (!t || state === 'thinking') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput('');
    sendText(t);
  };

  const playTrack = (id?: string) => {
    const tr = id ? trackById(id) : undefined;
    if (!tr) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pb.play(tr);
    pb.expand();
  };

  const planToday = () => {
    Haptics.selectionAsync();
    const name = today.festival?.name ?? today.weekday.deityName;
    requestPlan(`A simple home pooja for ${name} today`, { deity: today.weekday.deityName });
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        {/* Header */}
        <View className="px-5" style={{ paddingTop: insets.top + sp(2) }}>
          <Text style={type.title}>Sanatan Guide</Text>
          <Text className="font-body text-[14px] text-textMid mt-1">
            Ask about festivals, mantras and poojas — or plan your worship.
          </Text>
        </View>

        {/* Language selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langRow}>
          {LANGS.map((l) => {
            const on = l.code === language;
            return (
              <Pressable
                key={l.code}
                onPress={() => {
                  Haptics.selectionAsync();
                  setLanguage(l.code);
                }}
                style={[styles.langPill, on && styles.langPillOn]}
              >
                <Text style={[styles.langText, on && styles.langTextOn]}>{l.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Transcript (Today card + quick prompts + conversation) */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 mt-2 px-5"
          contentContainerStyle={{ paddingBottom: sp(4) }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Today */}
          <FadeIn style={{ marginBottom: sp(4) }}>
            <GlassCard style={styles.todayCard}>
              <Text style={styles.todayLabel}>TODAY</Text>
              <Text style={styles.todayTitle}>{cardTitle}</Text>
              <Text style={styles.todayBlurb}>{cardBlurb}</Text>
              <View style={styles.todayActions}>
                {!!firstTrackId && (
                  <PressableScale haptic="none" onPress={() => playTrack(firstTrackId)}>
                    <LinearGradient colors={gradients.divine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.todayBtn}>
                      <Ionicons name="play" size={14} color="#3A1205" />
                      <Text style={styles.todayBtnText}>Play</Text>
                    </LinearGradient>
                  </PressableScale>
                )}
                <PressableScale haptic="none" onPress={planToday} style={styles.todayBtnGhost}>
                  <Ionicons name="sparkles" size={14} color={colors.gold} />
                  <Text style={styles.todayBtnGhostText}>Plan today’s pooja</Text>
                </PressableScale>
              </View>
            </GlassCard>
          </FadeIn>

          {/* Quick prompts */}
          <View style={styles.chips}>
            {QUICK.map((q) => (
              <Pressable
                key={q.label}
                style={styles.chip}
                onPress={() => {
                  Haptics.selectionAsync();
                  q.kind === 'plan' ? requestPlan(q.label) : sendText(q.label);
                }}
              >
                <Text style={styles.chipText}>{q.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Conversation */}
          {turns.map((t) =>
            t.plan ? (
              <PlanCard key={t.id} plan={t.plan} />
            ) : t.role === 'guide' ? (
              <FadeIn key={t.id} rise={10} style={styles.guideBubbleWrap}>
                <View style={styles.guideBubble}>
                  <Text className="font-body text-[15px] leading-[22px] text-textHi">{t.text}</Text>
                </View>
              </FadeIn>
            ) : (
              <FadeIn key={t.id} rise={10} style={styles.userBubble}>
                <Text className="font-body text-[15px] leading-[22px] text-[#2A1005]">{t.text}</Text>
              </FadeIn>
            ),
          )}

          {state === 'thinking' && (
            <Text className="font-body text-[12px] text-textLow mt-1">Consulting the texts…</Text>
          )}
        </ScrollView>

        {/* Input dock */}
        <View style={[styles.dock, { paddingBottom: insets.bottom + sp(2) }]}>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask the guide…"
              placeholderTextColor={colors.textLow}
              style={styles.input}
              multiline
              onSubmitEditing={onSend}
              returnKeyType="send"
              editable={state !== 'thinking'}
            />
            <PressableScale haptic="none" onPress={onSend} disabled={!input.trim() || state === 'thinking'}>
              <LinearGradient
                colors={input.trim() && state !== 'thinking' ? (['#F6C84C', '#FF7A1A'] as const) : (['#2A2A2E', '#1C1C1F'] as const)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendBtn}
              >
                <Ionicons name="arrow-up" size={22} color={input.trim() && state !== 'thinking' ? '#3A1205' : colors.textMid} />
              </LinearGradient>
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  langRow: { gap: 8, paddingHorizontal: sp(5), paddingTop: sp(3), alignItems: 'center' },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
  langPillOn: { backgroundColor: 'rgba(246,200,76,0.14)', borderColor: colors.gold },
  langText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textMid },
  langTextOn: { color: colors.gold },

  // Today card
  todayCard: { padding: 16 },
  todayLabel: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 2, color: colors.textLow },
  todayTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.textHi, marginTop: 4 },
  todayBlurb: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMid, marginTop: 6 },
  todayActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  todayBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: radii.pill },
  todayBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#3A1205' },
  todayBtnGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  todayBtnGhostText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.gold },

  // Quick prompts
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: sp(4) },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
  chipText: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.textMid },

  // Bubbles
  guideBubbleWrap: { alignItems: 'flex-start', marginBottom: sp(3) },
  guideBubble: {
    maxWidth: '90%',
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    borderTopLeftRadius: 6,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    backgroundColor: colors.amber,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    borderTopRightRadius: 6,
    marginBottom: sp(3),
  },

  // Plan card
  planWrap: { marginBottom: sp(3) },
  planCard: { padding: 18 },
  planTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.textHi },
  planMeta: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 0.3, color: colors.gold, marginTop: 3 },
  planSummary: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMid, marginTop: 8 },
  matBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
  matHead: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 1.5, color: colors.textLow },
  matText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.textMid, marginTop: 4 },
  step: { flexDirection: 'row', gap: 12, marginTop: 16 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(246,200,76,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,76,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold },
  stepTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.textHi },
  stepKind: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.5, color: colors.textLow, marginTop: 1 },
  mantra: { fontFamily: fonts.display, fontSize: 17, lineHeight: 26, color: colors.gold, marginTop: 6 },
  translit: { fontFamily: fonts.body, fontSize: 13, fontStyle: 'italic', color: colors.textMid, marginTop: 2 },
  stepNote: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMid, marginTop: 6 },
  stepMat: { fontFamily: fonts.body, fontSize: 12, color: colors.textLow, marginTop: 4 },
  closing: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMid, marginTop: 16 },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textLow,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorderSoft,
  },

  // Dock
  dock: { paddingHorizontal: sp(4), paddingTop: sp(2) },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    color: colors.textHi,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
