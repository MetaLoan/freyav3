import React from 'react';
import { Modal, Pressable, Dimensions } from 'react-native';
import { YStack, XStack, Text, Circle } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { s, spacing, fontSize, iconSize } from '../../utils/responsive';

/**
 * Freya V3 模态弹窗组件
 * 
 * 设计特征：
 * - 暗色半透明遮罩
 * - 居中弹窗（暗色底 + 大圆角）
 * - 顶部可选标题 + 关闭按钮
 * - 底部滑入动画
 */

interface AppModalProps {
  /** 是否可见 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 弹窗标题 */
  title?: string;
  /** 是否显示关闭按钮 */
  showClose?: boolean;
  /** 点击遮罩是否关闭 */
  dismissOnOverlay?: boolean;
  /** 内容 */
  children: React.ReactNode;
}

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  title,
  showClose = true,
  dismissOnOverlay = true,
  children,
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* 遮罩 */}
      <Pressable
        style={{
          flex: 1,
          backgroundColor: `rgba(0, 0, 0, ${layout.modal.overlayOpacity})`,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: s(20),
        }}
        onPress={dismissOnOverlay ? onClose : undefined}
      >
        {/* 弹窗内容 */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: `${layout.modal.widthPercent}%`,
            maxWidth: layout.modal.maxWidth,
          }}
        >
          <AnimatedYStack
            entering={SlideInDown.springify().damping(15).stiffness(150)}
            exiting={SlideOutDown.duration(200)}
            backgroundColor={palette.bgSurface}
            borderRadius={layout.modal.radius}
            padding={layout.modal.padding}
            borderWidth={1}
            borderColor={palette.border}
          >
            {/* 标题栏 */}
            {(title || showClose) && (
              <XStack
                justifyContent="space-between"
                alignItems="center"
                marginBottom={spacing.lg}
              >
                <Text
                  fontFamily="$heading"
                  fontSize={layout.modal.titleSize}
                  fontWeight="700"
                  color={palette.textPrimary}
                  flex={1}
                >
                  {title || ''}
                </Text>
                {showClose && (
                  <Pressable onPress={onClose}>
                    <Circle
                      size={s(32)}
                      backgroundColor={palette.bgElevated}
                      borderWidth={1}
                      borderColor={palette.border}
                    >
                      <X size={iconSize.xs} color={palette.textTertiary} />
                    </Circle>
                  </Pressable>
                )}
              </XStack>
            )}

            {/* 内容 */}
            {children}
          </AnimatedYStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
