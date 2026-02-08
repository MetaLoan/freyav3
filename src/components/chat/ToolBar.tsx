import React from 'react';
import { Pressable } from 'react-native';
import { XStack, YStack, Text, Circle } from 'tamagui';
import { Sparkles, BookOpen, Music } from '@tamagui/lucide-icons';
import { palette } from '../../config/theme';
import { spacing, fontSize, iconSize, s } from '../../utils/responsive';

/**
 * 工具栏 - 塔罗 / 答案之石 / Echo
 * 
 * 显示在输入框上方，3 个圆形图标入口
 */

interface ToolBarProps {
  onTarotPress: () => void;
  onStonePress: () => void;
  onEchoPress: () => void;
}

interface ToolItemProps {
  icon: typeof Sparkles;
  label: string;
  color: string;
  onPress: () => void;
}

function ToolItem({ icon: Icon, label, color, onPress }: ToolItemProps) {
  return (
    <Pressable onPress={onPress}>
      <YStack alignItems="center" space={spacing.xs}>
        <Circle
          size={s(44)}
          backgroundColor={palette.bgElevated}
          borderWidth={1}
          borderColor={palette.border}
        >
          <Icon size={iconSize.sm} color={color} />
        </Circle>
        <Text fontFamily="$body" fontSize={fontSize.xs} color={palette.textTertiary}>
          {label}
        </Text>
      </YStack>
    </Pressable>
  );
}

export const ToolBar: React.FC<ToolBarProps> = ({ onTarotPress, onStonePress, onEchoPress }) => {
  return (
    <XStack justifyContent="center" space={spacing.xl} paddingVertical={spacing.sm}>
      <ToolItem
        icon={Sparkles}
        label="Tarot"
        color={palette.gold400}
        onPress={onTarotPress}
      />
      <ToolItem
        icon={BookOpen}
        label="Answers"
        color={palette.royal300}
        onPress={onStonePress}
      />
      <ToolItem
        icon={Music}
        label="Echo"
        color={palette.coral400}
        onPress={onEchoPress}
      />
    </XStack>
  );
};
