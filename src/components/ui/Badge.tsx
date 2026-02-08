import React from 'react';
import { XStack, Text, Circle } from 'tamagui';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { s, fs, spacing } from '../../utils/responsive';

/**
 * Freya V3 徽标 / 标签组件
 * 
 * Badge: 小圆点或数字徽标（通知、计数）
 * Tag:   文字标签（分类、状态）
 */

// ============================================================
// Badge（通知徽标）
// ============================================================

type BadgeVariant = 'coral' | 'gold' | 'royal' | 'success';

interface BadgeProps {
  /** 数字（不传则显示小圆点） */
  count?: number;
  /** 颜色变体 */
  variant?: BadgeVariant;
  /** 最大显示数字（超过显示 N+） */
  max?: number;
}

const badgeColors: Record<BadgeVariant, string> = {
  coral: palette.coral400,
  gold: palette.gold400,
  royal: palette.royal400,
  success: palette.success,
};

export const Badge: React.FC<BadgeProps> = ({
  count,
  variant = 'coral',
  max = 99,
}) => {
  const color = badgeColors[variant];

  // 无数字：小圆点
  if (count === undefined) {
    return <Circle size={layout.badge.dotSize} backgroundColor={color} />;
  }

  // 隐藏 0
  if (count <= 0) return null;

  const displayText = count > max ? `${max}+` : count.toString();

  return (
    <Circle
      minWidth={layout.badge.size}
      height={layout.badge.size}
      backgroundColor={color}
      paddingHorizontal={s(4)}
    >
      <Text
        fontFamily="$mono"
        fontSize={layout.badge.fontSize}
        fontWeight="700"
        color="#FFFFFF"
        textAlign="center"
      >
        {displayText}
      </Text>
    </Circle>
  );
};

// ============================================================
// Tag（文字标签）
// ============================================================

type TagVariant = 'gold' | 'royal' | 'coral' | 'default';

interface TagProps {
  children: string;
  variant?: TagVariant;
  /** 是否为选中态 */
  active?: boolean;
  onPress?: () => void;
}

const tagVariants: Record<TagVariant, {
  bg: string;
  bgActive: string;
  text: string;
  textActive: string;
  border: string;
  borderActive: string;
}> = {
  default: {
    bg: palette.bgElevated,
    bgActive: palette.bgSurfaceHover,
    text: palette.textSecondary,
    textActive: palette.textPrimary,
    border: palette.border,
    borderActive: palette.borderLight,
  },
  gold: {
    bg: palette.gold900,
    bgActive: palette.gold700,
    text: palette.gold300,
    textActive: palette.gold50,
    border: palette.borderGold,
    borderActive: palette.gold400,
  },
  royal: {
    bg: palette.royal900,
    bgActive: palette.royal500,
    text: palette.royal300,
    textActive: palette.textOnBlue,
    border: palette.borderBlue,
    borderActive: palette.royal300,
  },
  coral: {
    bg: palette.coral900,
    bgActive: palette.coral500,
    text: palette.coral300,
    textActive: '#FFFFFF',
    border: 'rgba(232, 93, 58, 0.2)',
    borderActive: palette.coral400,
  },
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  active = false,
  onPress,
}) => {
  const v = tagVariants[variant];

  return (
    <XStack
      height={layout.badge.tagHeight}
      paddingHorizontal={layout.badge.tagPaddingH}
      backgroundColor={active ? v.bgActive : v.bg}
      borderRadius={layout.badge.tagRadius}
      borderWidth={1}
      borderColor={active ? v.borderActive : v.border}
      alignItems="center"
      justifyContent="center"
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
    >
      <Text
        fontFamily="$body"
        fontSize={layout.badge.tagFontSize}
        fontWeight={active ? '600' : '400'}
        color={active ? v.textActive : v.text}
      >
        {children}
      </Text>
    </XStack>
  );
};
