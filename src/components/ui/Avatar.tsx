import React from 'react';
import { Image } from 'react-native';
import { Circle, Text, YStack } from 'tamagui';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { s, fs } from '../../utils/responsive';

/**
 * Freya V3 头像组件
 * 
 * 设计特征（来自参考图）：
 * - 圆形 + 金色渐变描边环
 * - 可选在线状态点（右下角绿色小圆点）
 * - 支持图片 / 文字初始 / 图标
 * 
 * 尺寸: sm(32) / md(44) / default(56) / lg(80) / xl(96)
 */

type AvatarSize = 'sm' | 'md' | 'default' | 'lg' | 'xl';

interface AvatarProps {
  /** 图片 URL 或本地图片资源 */
  source?: string | any;
  /** 无图片时显示的文字初始（如名字首字母） */
  fallback?: string;
  /** 自定义 fallback 内容 */
  fallbackContent?: React.ReactNode;
  /** 尺寸 */
  size?: AvatarSize;
  /** 是否显示金色边框环 */
  showBorder?: boolean;
  /** 是否显示在线状态 */
  showStatus?: boolean;
  /** 在线状态 */
  isOnline?: boolean;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: layout.avatar.sizeSm,
  md: layout.avatar.size,
  default: layout.avatar.sizeMd,
  lg: layout.avatar.sizeLg,
  xl: layout.avatar.sizeXl,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: fs(12),
  md: fs(16),
  default: fs(20),
  lg: fs(28),
  xl: fs(36),
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  fallback,
  fallbackContent,
  size = 'default',
  showBorder = true,
  showStatus = false,
  isOnline = false,
}) => {
  const avatarSize = sizeMap[size];
  const borderWidth = showBorder ? layout.avatar.borderWidth : 0;
  const innerSize = avatarSize - borderWidth * 2;
  const statusSize = layout.avatar.statusDotSize;

  return (
    <YStack position="relative" width={avatarSize} height={avatarSize}>
      {/* 外层金色边框环 */}
      <Circle
        size={avatarSize}
        borderWidth={borderWidth}
        borderColor={palette.gold400}
        backgroundColor={palette.bgSurface}
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
      >
        {source ? (
          <Image
            source={typeof source === 'string' ? { uri: source } : source}
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            }}
          />
        ) : fallbackContent ? (
          fallbackContent
        ) : (
          <Text
            fontFamily="$heading"
            fontSize={fontSizeMap[size]}
            fontWeight="700"
            color={palette.gold300}
          >
            {fallback || '?'}
          </Text>
        )}
      </Circle>

      {/* 在线状态点 */}
      {showStatus && (
        <Circle
          position="absolute"
          bottom={0}
          right={0}
          size={statusSize}
          backgroundColor={isOnline ? palette.success : palette.textMuted}
          borderWidth={s(2)}
          borderColor={palette.bgDeep}
        />
      )}
    </YStack>
  );
};
