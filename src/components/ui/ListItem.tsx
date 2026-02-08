import React from 'react';
import { Pressable } from 'react-native';
import { XStack, YStack, Text, Circle } from 'tamagui';
import { ChevronRight } from '@tamagui/lucide-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { spacing, fontSize, iconSize, radius } from '../../utils/responsive';

/**
 * Freya V3 列表项组件
 * 
 * 设计特征（来自参考图 Profile 页）：
 * - 左侧彩色图标容器（圆角方形）
 * - 标题 + 可选描述
 * - 右侧可选文字 + 箭头
 * - 按压态背景变化
 */

interface ListItemProps {
  /** 左侧图标 */
  icon: React.ReactNode;
  /** 图标容器背景色 */
  iconBg: string;
  /** 标题 */
  title: string;
  /** 描述（可选） */
  subtitle?: string;
  /** 右侧文字（可选） */
  rightText?: string;
  /** 右侧自定义内容（可选，替代箭头） */
  rightContent?: React.ReactNode;
  /** 是否显示右箭头（默认 true） */
  showChevron?: boolean;
  /** 点击回调 */
  onPress?: () => void;
  /** 是否为列表最后一项（控制底部分割线） */
  isLast?: boolean;
}

const AnimatedXStack = Animated.createAnimatedComponent(XStack);

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  rightText,
  rightContent,
  showChevron = true,
  onPress,
  isLast = false,
}) => {
  const bgOpacity = useSharedValue(0);

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(53, 46, 40, ${bgOpacity.value})`,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { bgOpacity.value = withTiming(1, { duration: 100 }); }}
      onPressOut={() => { bgOpacity.value = withTiming(0, { duration: 200 }); }}
    >
      <AnimatedXStack
        paddingVertical={layout.listItem.paddingV}
        paddingHorizontal={layout.listItem.paddingH}
        alignItems="center"
        space={spacing.base}
        borderRadius={radius.base}
        style={bgStyle}
      >
        {/* 图标容器 */}
        <Circle
          size={layout.listItem.iconContainer}
          backgroundColor={iconBg}
          borderRadius={layout.listItem.iconRadius}
        >
          {icon}
        </Circle>

        {/* 文字区域 */}
        <YStack flex={1}>
          <Text
            fontFamily="$body"
            fontSize={layout.listItem.titleSize}
            fontWeight="500"
            color={palette.textPrimary}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              fontFamily="$body"
              fontSize={layout.listItem.descSize}
              color={palette.textTertiary}
              marginTop={2}
            >
              {subtitle}
            </Text>
          )}
        </YStack>

        {/* 右侧内容 */}
        {rightText && (
          <Text
            fontFamily="$body"
            fontSize={fontSize.base}
            fontWeight="700"
            color={palette.textPrimary}
            marginRight={spacing.xs}
          >
            {rightText}
          </Text>
        )}
        {rightContent}
        {showChevron && (
          <ChevronRight size={layout.listItem.chevronSize} color={palette.textMuted} />
        )}
      </AnimatedXStack>
    </Pressable>
  );
};
