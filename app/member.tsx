import React from 'react';
import { YStack, Text } from 'tamagui';
import { useSafeAreaStyle } from '../src/hooks/useSafeArea';
import { palette } from '../src/config/theme';
import { fontSize, spacing } from '../src/utils/responsive';

/**
 * 会员中心页（堆栈页）
 * 从 Profile 点击进入
 * Phase 5 实现完整功能
 */
export default function MemberScreen() {
  const safeArea = useSafeAreaStyle(['top', 'bottom']);

  return (
    <YStack flex={1} backgroundColor={palette.bgDeep} justifyContent="center" alignItems="center" {...safeArea}>
      <Text fontFamily="$heading" fontSize={fontSize.h2} color={palette.textPrimary}>
        Member Center
      </Text>
      <Text fontFamily="$body" fontSize={fontSize.base} color={palette.textTertiary} marginTop={spacing.sm}>
        Coming in Phase 5
      </Text>
    </YStack>
  );
}
