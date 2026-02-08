import React from 'react';
import { Pressable, type ViewStyle, type TextStyle } from 'react-native';
import { XStack, Text, Circle } from 'tamagui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { s, fs, spacing, iconSize } from '../../utils/responsive';

/**
 * Freya V3 通用按钮组件
 * 
 * 变体 (variant):
 * - gold:     金色渐变填充（主要 CTA）
 * - royal:    皇家蓝填充（次要操作）
 * - outline:  描边按钮（轻量操作）
 * - ghost:    无背景（文字按钮）
 * - danger:   珊瑚橙（危险操作）
 * 
 * 尺寸 (size):
 * - sm:  高度 32dp，字号 12
 * - md:  高度 44dp，字号 14（默认）
 * - lg:  高度 52dp，字号 16
 * 
 * 圆角 (shape):
 * - rounded:  标准圆角 16dp（默认）
 * - pill:     胶囊形 9999
 * 
 * 支持：图标 (icon) / 加载态 (loading) / 全宽 (fullWidth) / 禁用 (disabled)
 */

type ButtonVariant = 'gold' | 'royal' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonShape = 'rounded' | 'pill';

interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

// 变体样式映射
const variantStyles: Record<ButtonVariant, {
  bg: string;
  bgPressed: string;
  border: string;
  text: string;
  textPressed: string;
}> = {
  gold: {
    bg: palette.gold500,
    bgPressed: palette.gold600,
    border: palette.borderGold,
    text: palette.gold50,
    textPressed: palette.gold100,
  },
  royal: {
    bg: palette.royal500,
    bgPressed: palette.royal600,
    border: palette.borderBlue,
    text: palette.textOnBlue,
    textPressed: palette.royal100,
  },
  outline: {
    bg: 'transparent',
    bgPressed: palette.white5,
    border: palette.borderLight,
    text: palette.textPrimary,
    textPressed: palette.gold300,
  },
  ghost: {
    bg: 'transparent',
    bgPressed: palette.white5,
    border: 'transparent',
    text: palette.textSecondary,
    textPressed: palette.gold300,
  },
  danger: {
    bg: palette.coral500,
    bgPressed: palette.coral600,
    border: 'rgba(232, 93, 58, 0.3)',
    text: '#FFFFFF',
    textPressed: palette.coral100,
  },
};

// 尺寸映射
const sizeStyles: Record<ButtonSize, {
  height: number;
  paddingH: number;
  fontSize: number;
  iconSize: number;
  iconGap: number;
}> = {
  sm: {
    height: layout.button.heightSm,
    paddingH: s(14),
    fontSize: layout.button.fontSizeSm,
    iconSize: iconSize.xs,
    iconGap: s(6),
  },
  md: {
    height: layout.button.height,
    paddingH: layout.button.paddingH,
    fontSize: layout.button.fontSize,
    iconSize: iconSize.sm,
    iconGap: layout.button.iconGap,
  },
  lg: {
    height: layout.button.heightLg,
    paddingH: s(24),
    fontSize: layout.button.fontSizeLg,
    iconSize: iconSize.base,
    iconGap: s(10),
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  shape = 'rounded',
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];
  const borderRadius = shape === 'pill' ? layout.button.radiusFull : layout.button.radius;
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        {
          height: sStyle.height,
          paddingHorizontal: sStyle.paddingH,
          borderRadius,
          backgroundColor: isDisabled ? palette.bgElevated : vStyle.bg,
          borderWidth: 1,
          borderColor: isDisabled ? palette.border : vStyle.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'stretch' : 'auto',
          opacity: isDisabled ? 0.5 : 1,
          gap: sStyle.iconGap,
        } satisfies ViewStyle,
      ]}
    >
      {/* 左侧图标 */}
      {icon && !loading && icon}

      {/* 加载指示器 */}
      {loading && (
        <Circle size={sStyle.iconSize} borderWidth={2} borderColor={vStyle.text} borderTopColor="transparent" borderRadius={999}>
          {/* TODO: 旋转动画 */}
        </Circle>
      )}

      {/* 文字 */}
      <Text
        fontFamily={variant === 'gold' || variant === 'royal' ? '$heading' : '$body'}
        fontSize={sStyle.fontSize}
        fontWeight={variant === 'gold' || variant === 'royal' ? '700' : '600'}
        color={isDisabled ? palette.textMuted : vStyle.text}
      >
        {children}
      </Text>

      {/* 右侧图标 */}
      {iconRight && iconRight}
    </AnimatedPressable>
  );
};
