import React, { useState } from 'react';
import { Image, ImageResizeMode, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Skeleton from './Skeleton';

// Deity image with a shimmer placeholder until the (large) art decodes.
// Clips to `radius` and fills its container.
export default function DeityArt({
  source,
  style,
  radius = 0,
  resizeMode = 'cover',
}: {
  source: any;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  resizeMode?: ImageResizeMode;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <View style={[{ overflow: 'hidden', borderRadius: radius }, style]}>
      <Image
        source={source}
        resizeMode={resizeMode}
        onLoad={() => setLoaded(true)}
        style={StyleSheet.absoluteFill}
      />
      {!loaded && <Skeleton style={StyleSheet.absoluteFill} radius={radius} />}
    </View>
  );
}
