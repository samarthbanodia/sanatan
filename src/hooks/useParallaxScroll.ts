import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

// Tracks vertical scroll offset as a shared value for parallax heroes.
// Wire `onScroll` to an Animated.ScrollView and derive hero transforms from `scrollY`
// inside a useAnimatedStyle (translate/scale/opacity on pull + scroll).
export function useParallaxScroll() {
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return { scrollY, onScroll };
}
