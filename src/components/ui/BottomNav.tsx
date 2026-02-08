import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable } from 'react-native';
import { XStack, YStack, Text, Circle } from 'tamagui';
import { Compass, MessageCircle, User } from '@tamagui/lucide-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { s, fs, ms } from '../../utils/responsive';
import { isTelegram } from '../../utils/platform';
import { getSafeAreaBottom } from '../../utils/telegram';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * 自定义底部导航栏
 * 
 * 设计特征（来自参考图）：
 * - 暗色玻璃拟态背景
 * - 圆形图标容器 + 皇家蓝活跃态指示器
 * - 活跃态图标放大 + 白色
 * - 弹性动画切换
 */

interface TabItem {
  key: string;
  label: string;
  icon: typeof Compass;
}

const TABS: TabItem[] = [
  { key: 'index', label: 'Discover', icon: Compass },
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'profile', label: 'Profile', icon: User },
];

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

function TabButton({
  item,
  isActive,
  onPress,
}: {
  item: TabItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.12 : 1, {
      damping: 12,
      stiffness: 200,
    });
    bgOpacity.value = withTiming(isActive ? 1 : 0, { duration: 250 });
  }, [isActive]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const IconComponent = item.icon;
  const containerSize = isActive ? layout.bottomNav.iconContainerActive : layout.bottomNav.iconContainer;

  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', flex: 1 }}>
      <YStack alignItems="center" space={layout.bottomNav.iconLabelGap}>
        <Animated.View style={[containerStyle, { width: containerSize, height: containerSize, alignItems: 'center', justifyContent: 'center' }]}>
          {/* 活跃态背景圆 */}
          <AnimatedCircle
            position="absolute"
            size={containerSize}
            backgroundColor={palette.royal400}
            style={bgStyle}
          />
          {/* 非活跃态背景圆 */}
          {!isActive && (
            <Circle
              position="absolute"
              size={containerSize}
              backgroundColor={palette.bgElevated}
              borderWidth={1}
              borderColor={palette.border}
            />
          )}
          <IconComponent
            size={layout.bottomNav.iconSize}
            color={isActive ? '#FFFFFF' : palette.textTertiary}
          />
        </Animated.View>
        <Text
          fontFamily="$body"
          fontSize={layout.bottomNav.labelSize}
          fontWeight={isActive ? '600' : '400'}
          color={isActive ? palette.royal300 : palette.textTertiary}
        >
          {item.label}
        </Text>
      </YStack>
    </Pressable>
  );
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress }) => {
  const nativeInsets = useSafeAreaInsets();
  const bottomPadding = isTelegram ? getSafeAreaBottom() : nativeInsets.bottom;

  return (
    <XStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      height={layout.bottomNav.height + bottomPadding}
      paddingBottom={bottomPadding + layout.bottomNav.paddingBottom}
      paddingHorizontal={layout.bottomNav.paddingH}
      alignItems="center"
      justifyContent="space-around"
      backgroundColor={palette.bgOverlay}
      borderTopWidth={1}
      borderTopColor={palette.border}
      // 玻璃拟态效果（Web 端生效）
      // @ts-ignore - web-only style
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {TABS.map((tab) => (
        <TabButton
          key={tab.key}
          item={tab}
          isActive={activeTab === tab.key}
          onPress={() => onTabPress(tab.key)}
        />
      ))}
    </XStack>
  );
};
