import React from 'react';
import { Tabs } from 'expo-router';
import { Compass, MessageCircle, User } from '@tamagui/lucide-icons';
import { palette } from '../../src/config/theme';
import { layout } from '../../src/config/layout';

/**
 * Tab 导航布局
 * 
 * 3 个主 Tab：
 * 1. Discover (每日洞察) - 首页
 * 2. Chat (AI 对话) - 核心功能
 * 3. Profile (个人中心) - 设置/会员
 * 
 * 使用 expo-router Tabs + 自定义样式
 * 底部导航栏采用暗色玻璃拟态 + 皇家蓝活跃态
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.bgOverlay,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: layout.bottomNav.height + 20,
          paddingBottom: 16,
          paddingTop: 8,
          // @ts-ignore web-only
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        },
        tabBarActiveTintColor: palette.royal300,
        tabBarInactiveTintColor: palette.textTertiary,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: layout.bottomNav.labelSize,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Compass size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
