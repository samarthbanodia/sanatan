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
import DivineOrb from '../components/DivineOrb';
import PressableScale from '../components/PressableScale';
import FadeIn from '../components/FadeIn';
import { colors, fonts, radii, sp } from '../theme/theme';
import { deityById } from '../data/content';
import { deityImage } from '../data/assets';
import { useChatSession, ChatLanguage } from '../voice/useChatSession';
import type { RootScreenProps } from '../navigation/types';

const LANGS: { code: ChatLanguage; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'ta', label: 'த' },
  { code: 'te', label: 'తె' },
  { code: 'bn', label: 'বাং' },
  { code: 'mr', label: 'मरा' },
];

export default function ConversationScreen({ route, navigation }: RootScreenProps<'Conversation'>) {
  const insets = useSafeAreaInsets();
  const deity = deityById(route.params.deityId)!;
  const [language, setLanguage] = useState<ChatLanguage>('en');
  const { turns, state, sendText } = useChatSession(deity, language);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [turns, state]);

  const orbState = state === 'thinking' ? 'listening' : 'idle';
  const status = state === 'thinking' ? 'Reflecting…' : 'Speak your heart';

  const onSend = () => {
    const t = input.trim();
    if (!t || state === 'thinking') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput('');
    sendText(t);
  };

  return (
    <ScreenBackground sanctuary>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4" style={{ paddingTop: insets.top + sp(2) }}>
          <PressableScale haptic="selection" onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textHi} />
          </PressableScale>
          <View className="flex-1">
            <Text className="font-display text-[24px] text-textHi">{deity.name}</Text>
            <Text className="font-body text-[12px] text-textLow">{deity.epithet}</Text>
          </View>
        </View>

        {/* Language selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.langRow}
        >
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

        {/* Orb */}
        <View className="items-center mt-2">
          <DivineOrb size={120} glyph={deity.glyph} gradient={deity.gradient} image={deityImage(deity.id)} state={orbState} />
          <Text className="font-bodyMed text-[12px] tracking-[1px] text-textMid mt-1">{status}</Text>
        </View>

        {/* Transcript */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 mt-2 px-5"
          contentContainerStyle={{ paddingBottom: sp(4) }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {turns.map((t) =>
            t.role === 'deity' ? (
              <FadeIn key={t.id} rise={10} style={styles.deityBubbleWrap}>
                <LinearGradient
                  colors={deity.gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.deityBubble}
                >
                  <Text className="font-body text-[15px] leading-[22px] text-[#2A1005]">{t.text}</Text>
                </LinearGradient>
              </FadeIn>
            ) : (
              <FadeIn key={t.id} rise={10} style={styles.devoteeBubble}>
                <Text className="font-body text-[15px] leading-[22px] text-textHi">{t.text}</Text>
              </FadeIn>
            )
          )}
        </ScrollView>

        {/* Chat input */}
        <View style={[styles.dock, { paddingBottom: insets.bottom + sp(2) }]}>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={`Speak to ${deity.name.split(' ').pop()}…`}
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  langRow: { gap: 8, paddingHorizontal: sp(4), paddingTop: sp(2), alignItems: 'center' },
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

  deityBubbleWrap: { alignItems: 'flex-start', marginBottom: sp(3) },
  deityBubble: {
    maxWidth: '88%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radii.lg,
    borderTopLeftRadius: 6,
  },
  devoteeBubble: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    borderTopRightRadius: 6,
    marginBottom: sp(3),
  },

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
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
