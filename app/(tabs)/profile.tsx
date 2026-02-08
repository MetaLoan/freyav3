import React from 'react';
import { YStack, XStack, Text, Card, Circle, ScrollView, Separator } from 'tamagui';
import {
  Diamond,
  Wallet,
  Heart,
  Settings,
  Gift,
  ChevronRight,
  Star,
} from '@tamagui/lucide-icons';
import { useSafeAreaStyle } from '../../src/hooks/useSafeArea';
import { palette } from '../../src/config/theme';
import { layout } from '../../src/config/layout';
import { s, fontSize, spacing, radius, iconSize } from '../../src/utils/responsive';
import { MysticalBackground } from '../../src/components/ui';
// @ts-ignore
import totemPattern from '../../assets/totem-pattern.png';
// @ts-ignore
import totemPatternBottom from '../../assets/totem-pattern-bottom.png';

/**
 * Profile / 个人中心
 * 
 * 展示用户信息、会员状态、设置入口
 * 基于参考图的 Profile 页面设计
 */

interface MenuItemProps {
  icon: typeof Diamond;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  rightText?: string;
  onPress?: () => void;
}

function MenuItem({ icon: Icon, iconBg, iconColor, title, subtitle, rightText, onPress }: MenuItemProps) {
  return (
    <XStack
      paddingVertical={layout.listItem.paddingV}
      paddingHorizontal={layout.listItem.paddingH}
      alignItems="center"
      space={spacing.base}
      pressStyle={{ backgroundColor: palette.bgSurfaceHover }}
      borderRadius={radius.base}
      onPress={onPress}
    >
      <Circle size={layout.listItem.iconContainer} backgroundColor={iconBg} borderRadius={layout.listItem.iconRadius}>
        <Icon size={iconSize.sm} color={iconColor} />
      </Circle>
      <YStack flex={1}>
        <Text fontFamily="$body" fontSize={layout.listItem.titleSize} fontWeight="500" color={palette.textPrimary}>
          {title}
        </Text>
        {subtitle && (
          <Text fontFamily="$body" fontSize={layout.listItem.descSize} color={palette.textTertiary} marginTop={2}>
            {subtitle}
          </Text>
        )}
      </YStack>
      {rightText && (
        <Text fontFamily="$body" fontSize={fontSize.base} fontWeight="700" color={palette.textPrimary} marginRight={spacing.sm}>
          {rightText}
        </Text>
      )}
      <ChevronRight size={layout.listItem.chevronSize} color={palette.textMuted} />
    </XStack>
  );
}

export default function ProfileScreen() {
  const safeArea = useSafeAreaStyle(['top']);

  return (
    <MysticalBackground variant="top" showTotem showGlow={false} totemImageSource={totemPattern} totemBottomImageSource={totemPatternBottom}>
    <ScrollView
      flex={1}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: layout.bottomNav.height + spacing.xl }}
    >
      <YStack paddingHorizontal={layout.page.paddingH} {...safeArea}>

        {/* 顶部栏：积分 + 通知 */}
        <XStack
          height={layout.header.height}
          alignItems="center"
          justifyContent="space-between"
        >
          <XStack alignItems="center" space={spacing.sm}>
            <Circle size={s(28)} backgroundColor={palette.bgSurface} borderWidth={1} borderColor={palette.border}>
              <Text fontFamily="$body" fontSize={fontSize.xs} color={palette.textPrimary}>+</Text>
            </Circle>
            <Text fontFamily="$mono" fontSize={fontSize.md} fontWeight="700" color={palette.textPrimary}>
              37,484
            </Text>
            <Star size={iconSize.xs} color={palette.gold400} />
          </XStack>
        </XStack>

        {/* 头像 + 用户信息 */}
        <YStack alignItems="center" space={spacing.sm} paddingTop={spacing.md}>
          <Circle
            size={layout.avatar.sizeLg}
            borderWidth={layout.avatar.borderWidth}
            borderColor={palette.gold400}
            backgroundColor={palette.bgSurface}
            overflow="hidden"
          >
            <Text fontFamily="$heading" fontSize={fontSize.h2} color={palette.gold300}>F</Text>
          </Circle>
          <Text fontFamily="$heading" fontSize={fontSize.h2} fontWeight="700" color={palette.textPrimary}>
            Emma Smith
          </Text>
          <XStack alignItems="center" space={spacing.xs}>
            <Text fontFamily="$body" fontSize={fontSize.base} color={palette.textSecondary}>
              ♊ Gemini
            </Text>
          </XStack>
        </YStack>

        {/* Premium CTA */}
        <Card
          marginTop={layout.page.sectionGap}
          backgroundColor={palette.gold600}
          borderRadius={layout.card.radius}
          padding={layout.card.padding}
          borderWidth={1}
          borderColor={palette.borderGold}
        >
          <YStack alignItems="center" space={spacing.xs}>
            <Text fontFamily="$heading" fontSize={fontSize.xl} fontWeight="700" color={palette.gold50}>
              Get Premium
            </Text>
            <Text fontFamily="$body" fontSize={fontSize.sm} color={palette.gold200} textAlign="center">
              Get Unlimited Tarot Reading, No Ads and Other Advantages
            </Text>
          </YStack>
        </Card>

        {/* 邀请好友 + 进度 */}
        <XStack marginTop={layout.card.gap} space={layout.card.gap}>
          <Card
            flex={1}
            backgroundColor={palette.royal500}
            borderRadius={layout.card.radius}
            padding={layout.card.padding}
            borderWidth={1}
            borderColor={palette.borderBlue}
          >
            <YStack space={spacing.xs}>
              <Text fontFamily="$body" fontSize={fontSize.md} fontWeight="600" color={palette.textOnBlue}>
                Invite Friends
              </Text>
              <Text fontFamily="$body" fontSize={fontSize.xs} color={palette.royal200}>
                Earn a 5% discount
              </Text>
            </YStack>
          </Card>
          <Card
            width={s(100)}
            backgroundColor={palette.bgSurface}
            borderRadius={layout.card.radius}
            padding={layout.card.padding}
            borderWidth={1}
            borderColor={palette.border}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontFamily="$mono" fontSize={fontSize.h3} fontWeight="700" color={palette.coral400}>
              75%
            </Text>
            <Text fontFamily="$mono" fontSize={fontSize.xs} color={palette.coral300}>
              +15%
            </Text>
          </Card>
        </XStack>

        {/* 菜单列表 */}
        <Card
          marginTop={layout.page.sectionGap}
          backgroundColor={palette.bgSurface}
          borderRadius={layout.card.radius}
          borderWidth={1}
          borderColor={palette.border}
          overflow="hidden"
        >
          <MenuItem
            icon={Diamond}
            iconBg="rgba(168, 85, 247, 0.15)"
            iconColor="#A855F7"
            title="Member Center"
            subtitle="Premium Active"
          />
          <Separator borderColor={palette.border} marginHorizontal={layout.listItem.paddingH} />
          <MenuItem
            icon={Wallet}
            iconBg="rgba(16, 185, 129, 0.15)"
            iconColor="#10B981"
            title="Credit Balance"
            rightText="$24.00"
          />
          <Separator borderColor={palette.border} marginHorizontal={layout.listItem.paddingH} />
          <MenuItem
            icon={Heart}
            iconBg="rgba(244, 63, 94, 0.15)"
            iconColor="#F43F5E"
            title="Favorites"
            subtitle="12 saved items"
          />
          <Separator borderColor={palette.border} marginHorizontal={layout.listItem.paddingH} />
          <MenuItem
            icon={Settings}
            iconBg="rgba(148, 163, 184, 0.15)"
            iconColor="#94A3B8"
            title="Settings"
            subtitle="Sound, Haptics, Font"
          />
          <Separator borderColor={palette.border} marginHorizontal={layout.listItem.paddingH} />
          <MenuItem
            icon={Gift}
            iconBg="rgba(251, 146, 60, 0.15)"
            iconColor="#FB923C"
            title="Refer a Friend"
          />
        </Card>

        {/* 版本号 */}
        <Text
          fontFamily="$body"
          fontSize={fontSize.xs}
          color={palette.textMuted}
          textAlign="center"
          marginTop={spacing.xl}
        >
          Freya V3 · Build 1.0.0
        </Text>

      </YStack>
      </ScrollView>
    </MysticalBackground>
  );
}
