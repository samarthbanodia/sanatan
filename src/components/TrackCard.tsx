import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import DeityArt from './DeityArt';
import { colors, fill, fonts, radii } from '../theme/theme';
import { Track, deityById } from '../data/content';
import { deityImage } from '../data/assets';

// Compact row used in lists.
export function TrackRow({ track, onPress }: { track: Track; onPress: () => void }) {
  const deity = deityById(track.deityId);
  return (
    <PressableScale onPress={onPress} haptic="selection" scaleTo={0.985} style={styles.row}>
      <DeityArt source={deityImage(track.deityId)} radius={radii.md} style={styles.thumb} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {deity?.name ?? track.subtitle}
        </Text>
      </View>
      <Text style={styles.duration}>{track.duration}</Text>
      <Ionicons name="play-circle" size={30} color={colors.textLow} style={styles.rowPlay} />
    </PressableScale>
  );
}

// Larger tile used in horizontal carousels.
export function TrackTile({ track, onPress }: { track: Track; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} haptic="selection" style={styles.tile}>
      <View style={styles.tileGrad}>
        <DeityArt source={deityImage(track.deityId)} style={fill} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.94)']}
          style={fill}
        />
        <View style={styles.tileFooter}>
          <Text style={styles.tileTitle} numberOfLines={2}>
            {track.title}
          </Text>
          <Text style={styles.tileSub}>{track.duration}</Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
  },
  thumb: {
    width: 56,
    height: 56,
    backgroundColor: colors.bg2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorderSoft,
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: fonts.bodySemi, fontSize: 16, letterSpacing: -0.2, color: colors.textHi },
  rowSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textLow, marginTop: 2 },
  duration: { fontFamily: fonts.body, fontSize: 12, color: colors.textLow },
  rowPlay: { marginLeft: 2 },

  tile: { width: 156, height: 200 },
  tileGrad: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.bg2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorderSoft,
  },
  tileFooter: { flex: 1, justifyContent: 'flex-end', padding: 14 },
  tileTitle: { fontFamily: fonts.bodySemi, fontSize: 16, letterSpacing: -0.2, color: '#fff' },
  tileSub: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
});
