import React, { useState } from 'react';
import { TextInput, Pressable } from 'react-native';
import { XStack, Circle } from 'tamagui';
import { Send, Mic } from '@tamagui/lucide-icons';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { spacing, fontSize, iconSize, s } from '../../utils/responsive';

/**
 * 聊天输入栏
 * 
 * 设计特征：
 * - 胶囊形输入框，暗色玻璃底
 * - 右侧金色发送按钮
 * - 左侧麦克风按钮（预留语音功能）
 */

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  isLoading = false,
}) => {
  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <XStack
      height={layout.input.chatBarHeight}
      backgroundColor={palette.bgSurface}
      borderRadius={layout.input.chatBarRadius}
      borderWidth={1}
      borderColor={palette.border}
      alignItems="center"
      paddingLeft={spacing.sm}
      paddingRight={spacing.xs}
    >
      {/* 麦克风按钮 */}
      <Pressable
        style={{
          width: layout.input.chatSendSize,
          height: layout.input.chatSendSize,
          borderRadius: layout.input.chatSendSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Mic size={iconSize.sm} color={palette.textMuted} />
      </Pressable>

      {/* 输入框 */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Your message..."
        placeholderTextColor={palette.textMuted}
        onSubmitEditing={canSend ? onSend : undefined}
        returnKeyType="send"
        multiline={false}
        style={{
          flex: 1,
          height: '100%',
          paddingHorizontal: spacing.sm,
          fontSize: layout.input.fontSize,
          color: palette.textPrimary,
          fontFamily: 'Inter_400Regular',
        }}
      />

      {/* 发送按钮 */}
      <Pressable
        onPress={canSend ? onSend : undefined}
        style={({ pressed }) => ({
          width: layout.input.chatSendSize,
          height: layout.input.chatSendSize,
          borderRadius: layout.input.chatSendSize / 2,
          backgroundColor: canSend ? palette.gold500 : palette.bgElevated,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed && canSend ? 0.8 : 1,
          transform: [{ scale: pressed && canSend ? 0.95 : 1 }],
        })}
        disabled={!canSend}
      >
        <Send
          size={iconSize.sm}
          color={canSend ? palette.gold50 : palette.textMuted}
        />
      </Pressable>
    </XStack>
  );
};
