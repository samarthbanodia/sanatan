import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ScreenBackground from '../components/ScreenBackground';
import DeityArt from '../components/DeityArt';
import FadeIn from '../components/FadeIn';
import PressableScale from '../components/PressableScale';
import { fill, sp, type } from '../theme/theme';
import { deities } from '../data/content';
import { deityImage } from '../data/assets';
import type { RootStackParamList } from '../navigation/types';

// Styling note: layout + simple text use NativeWind `className`; precise typography
// stays on the `type.*` tokens, and animated/gradient/blur stay on StyleSheet.

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TalkScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + sp(4), paddingBottom: sp(28) }}
      >
        <View className="px-5">
          <Text style={type.title}>Sacred Council</Text>
          <Text className="font-body text-[14px] leading-[21px] tracking-[-0.1px] text-textMid mt-1.5">
            Choose a deity to begin a 1-on-1 voice darshan. Speak your heart; receive their words.
          </Text>
        </View>

        <View className="flex-row flex-wrap px-4 mt-5 justify-between">
          {deities.map((d, i) => (
            <FadeIn key={d.id} delay={80 + i * 60} rise={16} style={styles.cardWrap}>
              <PressableScale
                haptic="light"
                style={styles.card}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  nav.navigate('Conversation', { deityId: d.id });
                }}
              >
                <View className="flex-1 rounded-lg overflow-hidden bg-bg2 border border-glassBorderSoft">
                  <DeityArt source={deityImage(d.id)} style={fill} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.96)']}
                    style={fill}
                  />
                  <View className="flex-1 justify-end p-4">
                    <Text className="font-display text-[22px] tracking-[-0.3px] text-white">{d.name}</Text>
                    <Text className="font-body text-[12px] text-[#ffffffcc] mt-0.5">{d.epithet}</Text>
                  </View>
                  <BlurView intensity={24} tint="light" style={styles.micBadge}>
                    <Ionicons name="mic" size={16} color="#fff" />
                  </BlurView>
                </View>
              </PressableScale>
            </FadeIn>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  cardWrap: { width: '47%', marginBottom: sp(3) },
  card: { height: 224 },
  micBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
