import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { ambientAudio } from '../data/assets';
import { colors, fonts } from '../theme/theme';

// Looping ambient devotional track, toggled on/off. Plays the generated tanpura/flute loop.
export default function AmbientToggle() {
  const player = useAudioPlayer(ambientAudio);
  const [on, setOn] = useState(false);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (on) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
    setOn((v) => !v);
  };

  return (
    <Pressable
      onPress={toggle}
      style={[styles.btn, on && styles.btnOn]}
      hitSlop={8}
    >
      <Text style={[styles.icon, on && styles.iconOn]}>ॐ</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOn: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(246,200,76,0.16)',
    shadowColor: colors.glowGold,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  icon: { fontSize: 24, color: colors.textMid, fontFamily: fonts.display },
  iconOn: { color: colors.gold },
});
