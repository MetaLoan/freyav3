import React from 'react';
import { YStack, Text } from 'tamagui';
import { useSafeAreaStyle } from '../src/hooks/useSafeArea';
import { palette } from '../src/config/theme';
import { fontSize, spacing } from '../src/utils/responsive';

/**
 * 收藏页面（堆栈页）
 * 从 Chat 或 Profile 点击进入
 * Phase 3 实现完整功能
 */
export default function FavoritesScreen() {
  const safeArea = useSafeAreaStyle(['top', 'bottom']);

  return (
    <YStack flex={1} backgroundColor={palette.bgDeep} justifyContent="center" alignItems="center" {...safeArea}>
      <Text fontFamily="$heading" fontSize={fontSize.h2} color={palette.textPrimary}>
        Favorites
      </Text>
      <Text fontFamily="$body" fontSize={fontSize.base} color={palette.textTertiary} marginTop={spacing.sm}>
        Coming in Phase 3
      </Text>
    </YStack>
  );
}
