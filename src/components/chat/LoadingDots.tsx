import React, { useEffect } from 'react';
import { XStack, Circle } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { palette } from '../../config/theme';
import { s, spacing } from '../../utils/responsive';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * AI 思考中的加载动画（三个跳动的点）
 */

function Dot({ delay }: { delay: number }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <AnimatedCircle
      size={s(6)}
      backgroundColor={palette.textTertiary}
      style={animatedStyle}
    />
  );
}

export const LoadingDots: React.FC = () => {
  return (
    <XStack
      alignSelf="flex-start"
      backgroundColor={palette.bgSurface}
      borderRadius={s(18)}
      borderTopLeftRadius={4}
      paddingHorizontal={s(16)}
      paddingVertical={s(14)}
      borderWidth={1}
      borderColor={palette.border}
      space={spacing.xs}
      marginLeft={s(40)}
    >
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </XStack>
  );
};
