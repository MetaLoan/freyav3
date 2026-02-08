import React from 'react';
import { Pressable } from 'react-native';
import { XStack, Text, Circle } from 'tamagui';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { spacing, iconSize, s } from '../../utils/responsive';
import { useHeaderSafeArea } from '../../hooks/useSafeArea';

/**
 * Freya V3 页面头部导航
 * 
 * 设计特征：
 * - 透明/暗色背景
 * - 左侧返回按钮（圆形暗色容器）
 * - 居中标题（Playfair Display 衬线体）
 * - 右侧可选操作按钮
 * - 自动处理安全区域
 */

interface HeaderProps {
  /** 页面标题 */
  title?: string;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 自定义返回处理 */
  onBack?: () => void;
  /** 左侧自定义内容（替代返回按钮） */
  leftContent?: React.ReactNode;
  /** 右侧自定义内容 */
  rightContent?: React.ReactNode;
  /** 是否透明背景 */
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBack,
  leftContent,
  rightContent,
  transparent = false,
}) => {
  const router = useRouter();
  const headerTop = useHeaderSafeArea();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <XStack
      paddingTop={headerTop}
      height={layout.header.height + headerTop}
      paddingHorizontal={layout.header.paddingH}
      alignItems="center"
      justifyContent="space-between"
      backgroundColor={transparent ? 'transparent' : palette.bgDeep}
      borderBottomWidth={transparent ? 0 : 1}
      borderBottomColor={palette.border}
    >
      {/* 左侧 */}
      {leftContent || (showBack ? (
        <Pressable onPress={handleBack} hitSlop={layout.header.iconHitSlop}>
          <Circle
            size={layout.header.backButtonSize}
            backgroundColor={palette.bgSurface}
            borderWidth={1}
            borderColor={palette.border}
          >
            <ChevronLeft size={iconSize.sm} color={palette.textTertiary} />
          </Circle>
        </Pressable>
      ) : (
        <Circle size={layout.header.backButtonSize} backgroundColor="transparent" />
      ))}

      {/* 标题 */}
      {title && (
        <Text
          fontFamily="$heading"
          fontSize={layout.header.titleSize}
          fontWeight="700"
          color={palette.textPrimary}
          position="absolute"
          left={0}
          right={0}
          textAlign="center"
          pointerEvents="none"
        >
          {title}
        </Text>
      )}

      {/* 右侧 */}
      {rightContent || (
        <Circle size={layout.header.backButtonSize} backgroundColor="transparent" />
      )}
    </XStack>
  );
};
