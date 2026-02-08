import React, { useState, useRef } from 'react';
import { TextInput, type TextInputProps, Pressable } from 'react-native';
import { XStack, YStack, Text, Circle } from 'tamagui';
import { Eye, EyeOff, Search, X } from '@tamagui/lucide-icons';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { s, spacing, fontSize, iconSize, radius } from '../../utils/responsive';

/**
 * Freya V3 输入框组件
 * 
 * 设计特征：
 * - 暗色底 + 微妙边框
 * - 聚焦时金色边框
 * - 支持：标签 / 前缀图标 / 后缀图标 / 密码切换 / 搜索 / 错误态
 */

type InputVariant = 'default' | 'search';

interface AppInputProps extends Omit<TextInputProps, 'style'> {
  /** 标签文字 */
  label?: string;
  /** 变体 */
  variant?: InputVariant;
  /** 错误信息 */
  error?: string;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 是否可清除 */
  clearable?: boolean;
  /** 清除回调 */
  onClear?: () => void;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  variant = 'default',
  error,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  value,
  secureTextEntry,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isSearch = variant === 'search';
  const hasError = !!error;
  const hasValue = value && value.length > 0;

  const borderColor = hasError
    ? palette.coral400
    : isFocused
    ? palette.gold400
    : palette.border;

  return (
    <YStack space={spacing.xs}>
      {/* 标签 */}
      {label && (
        <Text fontFamily="$body" fontSize={fontSize.sm} fontWeight="600" color={palette.textSecondary}>
          {label}
        </Text>
      )}

      {/* 输入框容器 */}
      <Pressable onPress={() => inputRef.current?.focus()}>
        <XStack
          height={layout.input.height}
          backgroundColor={palette.bgSurface}
          borderRadius={isSearch ? radius.full : layout.input.radius}
          borderWidth={1}
          borderColor={borderColor}
          alignItems="center"
          paddingHorizontal={layout.input.paddingH}
          space={spacing.sm}
        >
          {/* 左侧图标 / 搜索图标 */}
          {isSearch && !leftIcon && (
            <Search size={iconSize.sm} color={palette.textMuted} />
          )}
          {leftIcon}

          {/* TextInput */}
          <TextInput
            ref={inputRef}
            value={value}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            placeholderTextColor={palette.textMuted}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              flex: 1,
              height: '100%',
              fontSize: layout.input.fontSize,
              color: palette.textPrimary,
              fontFamily: 'Inter_400Regular',
            }}
            {...textInputProps}
          />

          {/* 清除按钮 */}
          {clearable && hasValue && (
            <Pressable onPress={onClear}>
              <Circle size={s(20)} backgroundColor={palette.bgElevated}>
                <X size={s(12)} color={palette.textTertiary} />
              </Circle>
            </Pressable>
          )}

          {/* 密码可见性切换 */}
          {secureTextEntry && (
            <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              {isPasswordVisible ? (
                <EyeOff size={iconSize.sm} color={palette.textTertiary} />
              ) : (
                <Eye size={iconSize.sm} color={palette.textTertiary} />
              )}
            </Pressable>
          )}

          {/* 右侧图标 */}
          {rightIcon}
        </XStack>
      </Pressable>

      {/* 错误信息 */}
      {hasError && (
        <Text fontFamily="$body" fontSize={fontSize.xs} color={palette.coral400}>
          {error}
        </Text>
      )}
    </YStack>
  );
};
