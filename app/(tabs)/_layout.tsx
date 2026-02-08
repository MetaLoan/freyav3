import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Compass, MessageCircle, User } from '@tamagui/lucide-icons';
import { palette } from '../../src/config/theme';
import { layout } from '../../src/config/layout';

const TAB_HEIGHT = Math.round((layout.bottomNav.height + 20) * 2 / 3);

/**
 * 导航栏渐变模糊背景
 * 从顶部透明渐变到底部模糊 + 半透明深色
 */
function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* 层 1：渐变高斯模糊 — 用 mask-image 让模糊从顶部透明渐变到底部不透明 */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            // @ts-ignore web-only
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            // 渐变遮罩：顶部模糊不可见，底部模糊完全可见
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
          },
        ]}
      />
      {/* 层 2：渐变半透明深色底 — 增强底部可读性 */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            // @ts-ignore web-only
            backgroundImage: `linear-gradient(to bottom, 
              rgba(19, 17, 16, 0) 0%, 
              rgba(19, 17, 16, 0.3) 40%, 
              rgba(19, 17, 16, 0.6) 100%
            )`,
          },
        ]}
      />
    </View>
  );
}

/**
 * Tab 导航布局
 * 
 * 3 个主 Tab：
 * 1. Discover (每日洞察) - 首页
 * 2. Chat (AI 对话) - 核心功能
 * 3. Profile (个人中心) - 设置/会员
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'transparent',
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: TAB_HEIGHT,
          paddingBottom: 8,
          paddingTop: 4,
          elevation: 0,
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: palette.gold400,
        tabBarInactiveTintColor: palette.gold200,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: layout.bottomNav.labelSize,
          // @ts-ignore web-only
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
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
