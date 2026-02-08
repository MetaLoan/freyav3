import React, { useRef, useEffect, useCallback, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { YStack, XStack, Text, Circle } from 'tamagui';
import { Sparkles } from '@tamagui/lucide-icons';
import { useSafeAreaStyle, useHeaderSafeArea } from '../../src/hooks/useSafeArea';
import { palette } from '../../src/config/theme';
import { layout } from '../../src/config/layout';
import { spacing, fontSize, iconSize, s } from '../../src/utils/responsive';
import { useChatStore, type Message } from '../../src/stores/useChatStore';
import { sendMessage, type AIResponse } from '../../src/services/AIService';
import { MessageBubble } from '../../src/components/chat/MessageBubble';
import { ChatInput } from '../../src/components/chat/ChatInput';
import { ToolBar } from '../../src/components/chat/ToolBar';
import { LoadingDots } from '../../src/components/chat/LoadingDots';
import { TarotOverlay } from '../../src/components/tools/tarot/TarotOverlay';
import { MysticalBackground } from '../../src/components/ui';
// @ts-ignore
import totemPattern from '../../assets/totem-pattern.png';
// @ts-ignore
import totemPatternBottom from '../../assets/totem-pattern-bottom.png';

/**
 * Chat / AI 对话页面
 * 
 * 核心功能：
 * - 与 Freya AI 对话（Gemini 直连）
 * - 消息气泡（用户/AI/系统）
 * - 工具栏（塔罗/答案之石/Echo）
 * - AI 工具推荐（评分 >= 70 自动建议）
 * - 加载动画
 */

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  sender: 'model',
  text: "Hello, I'm Freya ✨ Your mystical guide through the cosmos. I can help you explore your destiny through tarot, seek ancient wisdom, or find healing through sound. What's on your mind today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export default function ChatScreen() {
  const headerTop = useHeaderSafeArea();
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isLoading,
    inputValue,
    toolScores,
    addMessage,
    setMessages,
    setLoading,
    setInputValue,
    setToolScores,
    setPendingTool,
  } = useChatStore();

  // 初始化欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([WELCOME_MESSAGE]);
    }
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isLoading]);

  // 构建对话历史（供 Gemini API 使用）
  const buildHistory = useCallback(() => {
    return messages
      .filter((m) => m.sender !== 'system')
      .map((m) => ({
        role: m.sender as 'user' | 'model',
        parts: [{ text: m.text }],
      }));
  }, [messages]);

  // 发送消息
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 用户消息
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp,
    };
    addMessage(userMsg);
    setInputValue('');
    setLoading(true);

    try {
      const history = buildHistory();
      const response: AIResponse = await sendMessage(history, text);

      // AI 回复
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'model',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addMessage(aiMsg);

      // 更新工具评分
      setToolScores(response.toolScores);

      // 处理工具意图
      if (response.intent.type === 'trigger_tool' && response.intent.tool) {
        setPendingTool({
          tool: response.intent.tool,
          contextQuestion: response.intent.contextQuestion,
        });
      }
    } catch (error) {
      console.error('[Chat] Send error:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        sender: 'model',
        text: '🌙 I seem to have lost my connection to the cosmic energies. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setLoading(false);
    }
  }, [inputValue, isLoading, messages, buildHistory]);

  // 塔罗牌状态
  const [isTarotOpen, setIsTarotOpen] = useState(false);

  // 工具按钮
  const handleToolPress = useCallback((tool: string) => {
    if (tool === 'Tarot') {
      setIsTarotOpen(true);
      return;
    }
    addMessage({
      id: Date.now().toString(),
      sender: 'system',
      text: `🔮 ${tool} tool coming soon`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }, []);

  // 空状态
  const renderEmptyState = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={layout.page.paddingH}>
      <Circle
        size={s(80)}
        backgroundColor={palette.bgSurface}
        borderWidth={1}
        borderColor={palette.borderGold}
        marginBottom={spacing.lg}
      >
        <Sparkles size={iconSize.lg} color={palette.gold400} />
      </Circle>
      <Text fontFamily="$heading" fontSize={fontSize.h3} fontWeight="700" color={palette.textPrimary} textAlign="center">
        Start a Conversation
      </Text>
      <Text fontFamily="$body" fontSize={fontSize.base} color={palette.textTertiary} textAlign="center" marginTop={spacing.sm}>
        Ask Freya about your destiny, relationships, or spiritual guidance
      </Text>
    </YStack>
  );

  return (
    <MysticalBackground variant="full" showTotem showGlow={false} totemImageSource={totemPattern} totemBottomImageSource={totemPatternBottom}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* 头部 */}
      <XStack
        paddingTop={headerTop}
        height={layout.header.height + headerTop}
        paddingHorizontal={layout.header.paddingH}
        alignItems="center"
        justifyContent="space-between"
        backgroundColor={palette.bgDeep}
        borderBottomWidth={1}
        borderBottomColor={palette.border}
      >
        <XStack alignItems="center" space={spacing.sm}>
          <Circle size={s(32)} backgroundColor={palette.bgSurface} borderWidth={1} borderColor={palette.borderGold}>
            <Sparkles size={iconSize.xs} color={palette.gold400} />
          </Circle>
          <Text fontFamily="$heading" fontSize={layout.header.titleSize} fontWeight="700" color={palette.textPrimary}>
            Freya
          </Text>
        </XStack>
        <XStack alignItems="center" space={spacing.xs}>
          <Circle size={s(8)} backgroundColor={palette.success} />
          <Text fontFamily="$body" fontSize={fontSize.xs} color={palette.textTertiary}>
            Online
          </Text>
        </XStack>
      </XStack>

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{
          paddingHorizontal: layout.page.paddingH,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
          flexGrow: messages.length === 0 ? 1 : undefined,
        }}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={isLoading ? <LoadingDots /> : null}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      {/* 工具评分调试信息（开发模式） */}
      {__DEV__ && toolScores && (
        <XStack
          paddingHorizontal={layout.page.paddingH}
          paddingVertical={spacing.xs}
          justifyContent="center"
        >
          <Text fontFamily="$mono" fontSize={fontSize.xs} color={palette.textMuted}>
            🎴{toolScores.tarot} 📚{toolScores.answers} 🎵{toolScores.echo}
          </Text>
        </XStack>
      )}

      {/* 底部工具栏 + 输入框 */}
      <YStack
        paddingHorizontal={layout.page.paddingH}
        paddingBottom={layout.bottomNav.height + spacing.sm}
        backgroundColor={palette.bgDeep}
        borderTopWidth={1}
        borderTopColor={palette.border}
      >
        {/* 工具栏 */}
        <ToolBar
          onTarotPress={() => handleToolPress('Tarot')}
          onStonePress={() => handleToolPress('Answers')}
          onEchoPress={() => handleToolPress('Echo')}
        />

        {/* 输入框 */}
        <ChatInput
          value={inputValue}
          onChangeText={setInputValue}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </YStack>
      {/* 塔罗牌覆盖层 */}
      <TarotOverlay
        isOpen={isTarotOpen}
        onClose={() => setIsTarotOpen(false)}
      />
      </KeyboardAvoidingView>
    </MysticalBackground>
  );
}
