import React from 'react';
import { YStack, XStack, Text, Circle } from 'tamagui';
import { Sparkles } from '@tamagui/lucide-icons';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { spacing, fontSize, iconSize } from '../../utils/responsive';
import type { Message } from '../../stores/useChatStore';

/**
 * 消息气泡组件
 * 
 * 设计特征：
 * - AI 消息：左侧对齐，暗色卡片底 + 金色头像
 * - 用户消息：右侧对齐，皇家蓝底
 * - 系统消息：居中，半透明，斜体
 */

interface MessageBubbleProps {
  message: Message;
  onLongPress?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onLongPress }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <YStack alignItems="center" paddingVertical={spacing.xs}>
        <Text
          fontFamily="$body"
          fontSize={fontSize.sm}
          fontStyle="italic"
          color={palette.gold400}
          opacity={0.7}
        >
          {message.text}
        </Text>
      </YStack>
    );
  }

  return (
    <XStack
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      paddingVertical={layout.bubble.gap / 2}
      maxWidth={`${layout.bubble.maxWidthPercent}%`}
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
    >
      <XStack space={spacing.sm} flexDirection={isUser ? 'row-reverse' : 'row'}>
        {/* AI 头像 */}
        {!isUser && (
          <Circle
            size={layout.bubble.avatarSize}
            backgroundColor={palette.bgSurface}
            borderWidth={1}
            borderColor={palette.borderGold}
            alignSelf="flex-end"
          >
            <Sparkles size={iconSize.xs} color={palette.gold400} />
          </Circle>
        )}

        {/* 气泡 */}
        <YStack
          backgroundColor={isUser ? palette.royal500 : palette.bgSurface}
          borderRadius={layout.bubble.radius}
          borderTopRightRadius={isUser ? 4 : layout.bubble.radius}
          borderTopLeftRadius={isUser ? layout.bubble.radius : 4}
          paddingHorizontal={layout.bubble.paddingH}
          paddingVertical={layout.bubble.padding}
          borderWidth={1}
          borderColor={isUser ? palette.borderBlue : palette.border}
          flexShrink={1}
        >
          <Text
            fontFamily="$body"
            fontSize={layout.bubble.fontSize}
            color={isUser ? palette.textOnBlue : palette.textPrimary}
            lineHeight={layout.bubble.fontSize * 1.5}
          >
            {message.text}
          </Text>
          <Text
            fontFamily="$body"
            fontSize={layout.bubble.timestampSize}
            color={isUser ? palette.royal200 : palette.textMuted}
            textAlign="right"
            marginTop={spacing.xs}
          >
            {message.timestamp}
          </Text>
        </YStack>
      </XStack>
    </XStack>
  );
};
