import React from 'react';
import { Pressable } from 'react-native';
import { YStack, type YStackProps } from 'tamagui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';

/**
 * Freya V3 通用卡片组件
 * 
 * 变体 (variant):
 * - default:  暗色底 + 微妙边框（最常用）
 * - gold:     金色底（Premium CTA / 重要操作）
 * - royal:    皇家蓝底（功能卡片）
 * - elevated: 稍亮暗色底 + 更明显边框（抬升态）
 * 
 * 支持：按压缩放动画 / 可点击 / 自定义内边距
 */

type CardVariant = 'default' | 'gold' | 'royal' | 'elevated';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface AppCardProps extends Omit<YStackProps, 'onPress'> {
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  pressable?: boolean;
  children: React.ReactNode;
}

const variantMap: Record<CardVariant, {
  bg: string;
  border: string;
  bgPressed: string;
}> = {
  default: {
    bg: palette.bgSurface,
    border: palette.border,
    bgPressed: palette.bgSurfaceHover,
  },
  gold: {
    bg: palette.gold600,
    border: palette.borderGold,
    bgPressed: palette.gold700,
  },
  royal: {
    bg: palette.royal500,
    border: palette.borderBlue,
    bgPressed: palette.royal600,
  },
  elevated: {
    bg: palette.bgElevated,
    border: palette.borderLight,
    bgPressed: palette.bgSurface,
  },
};

const paddingMap: Record<CardPadding, number> = {
  none: 0,
  sm: layout.card.paddingSm,
  md: layout.card.padding,
  lg: layout.card.paddingLg,
};

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export const AppCard: React.FC<AppCardProps> = ({
  variant = 'default',
  padding = 'md',
  onPress,
  pressable,
  children,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const isPressable = pressable ?? !!onPress;
  const v = variantMap[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (isPressable) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const content = (
    <AnimatedYStack
      backgroundColor={v.bg}
      borderRadius={layout.card.radius}
      borderWidth={layout.card.borderWidth}
      borderColor={v.border}
      padding={paddingMap[padding]}
      overflow="hidden"
      style={animatedStyle}
      {...rest}
    >
      {children}
    </AnimatedYStack>
  );

  if (isPressable) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};
