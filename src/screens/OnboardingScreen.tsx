import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../components/ScreenBackground';
import DeityArt from '../components/DeityArt';
import FadeIn from '../components/FadeIn';
import PressableScale from '../components/PressableScale';
import DivineOrb from '../components/DivineOrb';
import { colors, fill, fonts, gradients, radii, sp, type } from '../theme/theme';
import { deities } from '../data/content';
import { deityImage } from '../data/assets';
import { INTENTIONS, Intention, usePreferences } from '../state/preferences';

const STEP_COUNT = 4;
const TIMES = ['Dawn · 6:00', 'Morning · 8:00', 'Evening · 6:30', 'Night · 9:00'];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { save } = usePreferences();

  const [step, setStep] = useState(0);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [deityId, setDeityId] = useState<string | undefined>();
  const [reminder, setReminder] = useState<string | undefined>();

  const canAdvance =
    step === 0 ||
    (step === 1 && intentions.length > 0) ||
    (step === 2 && !!deityId) ||
    step === 3;

  const toggleIntention = (id: Intention) => {
    Haptics.selectionAsync();
    setIntentions((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const advance = () => {
    if (!canAdvance) return;
    if (step < STEP_COUNT - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep((s) => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      save({
        onboarded: true,
        deityId,
        intentions,
        reminder: reminder ? { enabled: true, label: reminder } : { enabled: false, label: '' },
      });
    }
  };

  const back = () => {
    Haptics.selectionAsync();
    setStep((s) => Math.max(0, s - 1));
  };

  const cta = step === 0 ? 'Begin' : step === STEP_COUNT - 1 ? 'Enter the sanctuary' : 'Continue';

  return (
    <ScreenBackground sanctuary>
      <View style={{ flex: 1, paddingTop: insets.top + sp(3), paddingBottom: insets.bottom + sp(4) }}>
        {/* Progress + back */}
        <View style={styles.topRow}>
          <View style={{ width: 40 }}>
            {step > 0 && (
              <PressableScale haptic="selection" onPress={back} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={22} color={colors.textHi} />
              </PressableScale>
            )}
          </View>
          <View style={styles.dots}>
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotOn, i < step && styles.dotDone]} />
            ))}
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Step content */}
        <View style={{ flex: 1 }}>
          <FadeIn key={step} delay={40} rise={18} style={{ flex: 1 }}>
            {step === 0 && <Welcome />}
            {step === 1 && <IntentionStep selected={intentions} onToggle={toggleIntention} />}
            {step === 2 && <DeityStep selected={deityId} onSelect={(id) => { Haptics.selectionAsync(); setDeityId(id); }} />}
            {step === 3 && <ReminderStep selected={reminder} onSelect={(t) => { Haptics.selectionAsync(); setReminder(t); }} />}
          </FadeIn>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <PressableScale haptic="medium" onPress={advance} disabled={!canAdvance} style={{ opacity: canAdvance ? 1 : 0.4 }}>
            <LinearGradient colors={gradients.divine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
              <Text style={styles.ctaLabel}>{cta}</Text>
              <Ionicons name="arrow-forward" size={17} color="#3A1205" />
            </LinearGradient>
          </PressableScale>
          {step === 3 && (
            <PressableScale haptic="selection" onPress={advance} style={styles.skip}>
              <Text className="font-body text-[13px] text-textLow">Maybe later</Text>
            </PressableScale>
          )}
        </View>
      </View>
    </ScreenBackground>
  );
}

function Welcome() {
  return (
    <View style={styles.center}>
      <DivineOrb size={132} glyph="ॐ" gradient={gradients.orb} state="idle" />
      <Text style={[type.section, { marginTop: sp(8) }]}>NAMASTE</Text>
      <Text style={[type.hero, styles.centerText, { marginTop: sp(2) }]}>Sanatan</Text>
      <Text className="font-displayItalic italic text-[16px] text-textLow text-center px-8 mt-3">
        A quiet place for daily darshan, sacred sound, and a word with the divine.
      </Text>
    </View>
  );
}

function IntentionStep({
  selected,
  onToggle,
}: {
  selected: Intention[];
  onToggle: (id: Intention) => void;
}) {
  return (
    <View style={styles.stepPad}>
      <Text style={[type.section]}>STEP ONE</Text>
      <Text style={[type.title, { marginTop: sp(2) }]}>What brings you here?</Text>
      <Text className="font-body text-[14px] text-textMid mt-2">Choose all that speak to you.</Text>

      <View style={{ marginTop: sp(6), gap: sp(3) }}>
        {INTENTIONS.map((it) => {
          const on = selected.includes(it.id);
          return (
            <PressableScale
              key={it.id}
              haptic="none"
              scaleTo={0.98}
              onPress={() => onToggle(it.id)}
              style={[styles.intent, on && styles.intentOn]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.intentTitle, on && { color: colors.textHi }]}>{it.label}</Text>
                <Text className="font-body text-[13px] text-textLow mt-0.5">{it.blurb}</Text>
              </View>
              <View style={[styles.check, on && styles.checkOn]}>
                {on && <Ionicons name="checkmark" size={15} color="#3A1205" />}
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

function DeityStep({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.stepPad}>
        <Text style={[type.section]}>STEP TWO</Text>
        <Text style={[type.title, { marginTop: sp(2) }]}>Choose your guardian</Text>
        <Text className="font-body text-[14px] text-textMid mt-2">
          Your Ishta Devata — the form you feel drawn to.
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.deityGrid}>
        {deities.map((d) => {
          const on = d.id === selected;
          return (
            <PressableScale
              key={d.id}
              haptic="none"
              onPress={() => onSelect(d.id)}
              style={styles.deityCardWrap}
            >
              <View style={[styles.deityCard, on && styles.deityCardOn]}>
                <DeityArt source={deityImage(d.id)} style={fill} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={fill} />
                <View style={styles.deityFooter}>
                  <Text style={styles.deityName} numberOfLines={1}>{d.name}</Text>
                </View>
                {on && (
                  <View style={styles.deityBadge}>
                    <Ionicons name="checkmark" size={14} color="#3A1205" />
                  </View>
                )}
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ReminderStep({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (t: string) => void;
}) {
  return (
    <View style={styles.stepPad}>
      <Text style={[type.section]}>STEP THREE</Text>
      <Text style={[type.title, { marginTop: sp(2) }]}>A daily moment</Text>
      <Text className="font-body text-[14px] text-textMid mt-2">
        When should we call you to darshan?
      </Text>

      <View style={{ marginTop: sp(6), gap: sp(3) }}>
        {TIMES.map((t) => {
          const on = t === selected;
          return (
            <PressableScale
              key={t}
              haptic="none"
              scaleTo={0.98}
              onPress={() => onSelect(t)}
              style={[styles.intent, on && styles.intentOn]}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={on ? colors.gold : colors.textLow}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.intentTitle, on && { color: colors.textHi }]}>{t}</Text>
              <View style={{ flex: 1 }} />
              <View style={[styles.check, on && styles.checkOn]}>
                {on && <Ionicons name="checkmark" size={15} color="#3A1205" />}
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(5),
  },
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
  dots: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)' },
  dotOn: { width: 22, backgroundColor: colors.gold },
  dotDone: { backgroundColor: 'rgba(246,200,76,0.5)' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sp(5) },
  centerText: { textAlign: 'center' },
  stepPad: { paddingHorizontal: sp(6), paddingTop: sp(6) },

  intent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sp(4),
    borderRadius: radii.lg,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
  },
  intentOn: { borderColor: colors.gold, backgroundColor: 'rgba(246,200,76,0.08)' },
  intentTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.textMid },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.gold, borderColor: colors.gold },

  deityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: sp(5),
    paddingTop: sp(5),
    paddingBottom: sp(4),
    gap: sp(3),
  },
  deityCardWrap: { width: '47%' },
  deityCard: {
    height: 150,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.bg2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  deityCardOn: { borderColor: colors.gold },
  deityFooter: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  deityName: { fontFamily: fonts.display, fontSize: 17, color: '#fff' },
  deityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaWrap: { paddingHorizontal: sp(5), paddingTop: sp(3), alignItems: 'center', gap: sp(2) },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radii.pill,
    width: '100%',
  },
  ctaLabel: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#3A1205' },
  skip: { paddingVertical: sp(2) },
});
