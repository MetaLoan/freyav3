import React, { useState, useCallback } from 'react';
import { Modal, Pressable, ScrollView as RNScrollView } from 'react-native';
import { YStack, XStack, Text, Card, Circle, ScrollView } from 'tamagui';
import { X, ChevronLeft, Sparkles } from '@tamagui/lucide-icons';
import { palette } from '../../../config/theme';
import { layout } from '../../../config/layout';
import { s, fs, spacing, fontSize, iconSize, radius, wp } from '../../../utils/responsive';
import { drawCards, type TarotCardData, POSITION_LABELS } from '../../../lib/tarot-data';
import { generateTarotReading, type TarotReadingData } from '../../../services/TarotService';
import { useChatStore } from '../../../stores/useChatStore';

/**
 * 塔罗牌全屏覆盖层
 * 
 * 流程：
 * 1. 输入问题
 * 2. 抽取 3 张牌（点击翻牌）
 * 3. AI 生成解读报告
 * 4. 显示报告，关闭后回到 Chat
 * 
 * 设计参考：参考图中的 "Tarot Horoscope" 页面
 * - 黑金卡面
 * - 卡片堆叠选择
 * - [1] [2] [3] 位置指示
 * - "Get interpretation" 金色 CTA
 */

type TarotStep = 'question' | 'draw' | 'loading' | 'report';

interface TarotOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  contextQuestion?: string;
}

export const TarotOverlay: React.FC<TarotOverlayProps> = ({ isOpen, onClose, contextQuestion }) => {
  const [step, setStep] = useState<TarotStep>('question');
  const [question, setQuestion] = useState(contextQuestion || '');
  const [drawn, setDrawn] = useState<{ card: TarotCardData; isReversed: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [reading, setReading] = useState<TarotReadingData | null>(null);
  const addMessage = useChatStore((s) => s.addMessage);

  const handleReset = useCallback(() => {
    setStep('question');
    setQuestion(contextQuestion || '');
    setDrawn([]);
    setFlippedIndices(new Set());
    setReading(null);
  }, [contextQuestion]);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [onClose, handleReset]);

  // 抽牌
  const handleDraw = useCallback(() => {
    if (!question.trim()) return;
    const cards = drawCards(3);
    setDrawn(cards);
    setStep('draw');
  }, [question]);

  // 翻牌
  const handleFlip = useCallback((index: number) => {
    setFlippedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // 获取解读
  const handleGetReading = useCallback(async () => {
    setStep('loading');
    const result = await generateTarotReading(drawn, question);
    if (result) {
      setReading(result);
      setStep('report');

      // 将结果发送到 Chat
      const cardNames = drawn.map((d) => `${d.card.name} (${d.isReversed ? 'Reversed' : 'Upright'})`).join(', ');
      addMessage({
        id: Date.now().toString(),
        sender: 'system',
        text: `🎴 Tarot Reading: ${cardNames}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolType: 'tarot',
        toolData: result as unknown as Record<string, unknown>,
      });
    } else {
      setStep('draw');
    }
  }, [drawn, question, addMessage]);

  const allFlipped = flippedIndices.size >= 3;
  const positions = ['past', 'present', 'future'] as const;

  return (
    <Modal visible={isOpen} animationType="slide" transparent={false}>
      <YStack flex={1} backgroundColor={palette.bgDeepest}>

        {/* 头部 */}
        <XStack
          paddingTop={s(50)}
          paddingHorizontal={layout.page.paddingH}
          paddingBottom={spacing.md}
          alignItems="center"
          justifyContent="space-between"
        >
          <Pressable onPress={handleClose}>
            <Circle size={s(36)} backgroundColor={palette.bgSurface} borderWidth={1} borderColor={palette.border}>
              {step === 'question' ? (
                <X size={iconSize.sm} color={palette.textTertiary} />
              ) : (
                <ChevronLeft size={iconSize.sm} color={palette.textTertiary} />
              )}
            </Circle>
          </Pressable>
          <Text fontFamily="$heading" fontSize={fontSize.xl} fontWeight="700" color={palette.textPrimary}>
            Tarot Horoscope
          </Text>
          <YStack width={s(36)} />
        </XStack>

        {/* 步骤 1：输入问题 */}
        {step === 'question' && (
          <YStack flex={1} paddingHorizontal={layout.page.paddingH} justifyContent="center" space={spacing.xl}>
            <YStack alignItems="center" space={spacing.md}>
              <Sparkles size={s(48)} color={palette.gold400} />
              <Text fontFamily="$heading" fontSize={fontSize.h2} fontWeight="700" color={palette.textPrimary} textAlign="center">
                Ask the Cards
              </Text>
              <Text fontFamily="$body" fontSize={fontSize.base} color={palette.textTertiary} textAlign="center">
                Focus on your question, then let the cards reveal your path
              </Text>
            </YStack>

            {/* 问题输入 */}
            <Card
              backgroundColor={palette.bgSurface}
              borderRadius={radius.lg}
              padding={layout.card.padding}
              borderWidth={1}
              borderColor={palette.border}
            >
              <Text
                fontFamily="$body"
                fontSize={fontSize.base}
                color={question ? palette.textPrimary : palette.textMuted}
                minHeight={s(80)}
                onPress={() => {
                  // TODO: 实现原生 TextInput 弹出
                }}
              >
                {question || 'What would you like to know...'}
              </Text>
            </Card>

            {/* 快捷问题 */}
            <YStack space={spacing.sm}>
              {[
                'What does my love life hold?',
                'What should I focus on this week?',
                'How can I improve my career?',
              ].map((q, i) => (
                <Pressable key={i} onPress={() => setQuestion(q)}>
                  <Card
                    backgroundColor={question === q ? palette.gold900 : palette.bgElevated}
                    borderRadius={radius.base}
                    padding={spacing.md}
                    borderWidth={1}
                    borderColor={question === q ? palette.borderGold : palette.border}
                  >
                    <Text fontFamily="$body" fontSize={fontSize.sm} color={question === q ? palette.gold300 : palette.textSecondary}>
                      {q}
                    </Text>
                  </Card>
                </Pressable>
              ))}
            </YStack>

            {/* 抽牌按钮 */}
            <Pressable onPress={handleDraw} disabled={!question.trim()}>
              <Card
                backgroundColor={question.trim() ? palette.gold500 : palette.bgSurface}
                borderRadius={layout.button.radius}
                height={layout.button.heightLg}
                justifyContent="center"
                alignItems="center"
                borderWidth={1}
                borderColor={question.trim() ? palette.borderGold : palette.border}
                opacity={question.trim() ? 1 : 0.5}
              >
                <Text fontFamily="$heading" fontSize={layout.button.fontSizeLg} fontWeight="700" color={question.trim() ? palette.gold50 : palette.textMuted}>
                  Draw Three Cards
                </Text>
              </Card>
            </Pressable>
          </YStack>
        )}

        {/* 步骤 2：翻牌 */}
        {step === 'draw' && (
          <YStack flex={1} paddingHorizontal={layout.page.paddingH} space={spacing.lg}>
            <YStack alignItems="center" space={spacing.xs}>
              <Text fontFamily="$heading" fontSize={fontSize.xl} fontWeight="700" color={palette.textPrimary}>
                Choose Three Cards
              </Text>
              <Text fontFamily="$body" fontSize={fontSize.sm} color={palette.textTertiary}>
                Tap each card to reveal your reading
              </Text>
            </YStack>

            {/* 三张牌 */}
            <XStack justifyContent="center" space={spacing.md} flex={1} alignItems="center">
              {drawn.map((d, i) => {
                const isFlipped = flippedIndices.has(i);
                return (
                  <Pressable key={i} onPress={() => handleFlip(i)} disabled={isFlipped}>
                    <YStack alignItems="center" space={spacing.sm}>
                      {/* 位置标签 */}
                      <Text fontFamily="$body" fontSize={fontSize.xs} color={palette.gold400}>
                        {POSITION_LABELS[positions[i]]}
                      </Text>

                      {/* 卡片 */}
                      <Card
                        width={wp(26)}
                        height={wp(38)}
                        backgroundColor={isFlipped ? palette.bgSurface : palette.gold700}
                        borderRadius={radius.md}
                        borderWidth={2}
                        borderColor={isFlipped ? palette.borderGold : palette.gold500}
                        justifyContent="center"
                        alignItems="center"
                        overflow="hidden"
                      >
                        {isFlipped ? (
                          <YStack alignItems="center" space={spacing.sm} padding={spacing.sm}>
                            <Text fontFamily="$heading" fontSize={fs(13)} fontWeight="700" color={palette.gold300} textAlign="center" numberOfLines={2}>
                              {d.card.name}
                            </Text>
                            {d.isReversed && (
                              <Text fontFamily="$body" fontSize={fs(10)} color={palette.coral400} style={{ transform: [{ rotate: '180deg' }] }}>
                                Reversed
                              </Text>
                            )}
                            <Text fontFamily="$body" fontSize={fs(9)} color={palette.textTertiary} textAlign="center" numberOfLines={3}>
                              {d.card.keywords.join(' · ')}
                            </Text>
                          </YStack>
                        ) : (
                          <YStack alignItems="center" space={spacing.xs}>
                            <Sparkles size={iconSize.base} color={palette.gold200} />
                            <Text fontFamily="$mono" fontSize={fontSize.lg} fontWeight="700" color={palette.gold200}>
                              {i + 1}
                            </Text>
                          </YStack>
                        )}
                      </Card>
                    </YStack>
                  </Pressable>
                );
              })}
            </XStack>

            {/* 位置指示器 */}
            <XStack justifyContent="center" space={spacing.sm}>
              {[1, 2, 3].map((n, i) => (
                <Circle
                  key={i}
                  size={s(32)}
                  backgroundColor={flippedIndices.has(i) ? palette.gold500 : palette.bgElevated}
                  borderWidth={1}
                  borderColor={flippedIndices.has(i) ? palette.gold400 : palette.border}
                >
                  <Text fontFamily="$mono" fontSize={fontSize.sm} fontWeight="700" color={flippedIndices.has(i) ? palette.gold50 : palette.textMuted}>
                    {n}
                  </Text>
                </Circle>
              ))}
            </XStack>

            {/* 获取解读按钮 */}
            <Pressable onPress={handleGetReading} disabled={!allFlipped}>
              <Card
                backgroundColor={allFlipped ? palette.gold500 : palette.bgSurface}
                borderRadius={layout.button.radius}
                height={layout.button.heightLg}
                justifyContent="center"
                alignItems="center"
                borderWidth={1}
                borderColor={allFlipped ? palette.borderGold : palette.border}
                opacity={allFlipped ? 1 : 0.5}
                marginBottom={s(40)}
              >
                <Text fontFamily="$heading" fontSize={layout.button.fontSizeLg} fontWeight="700" color={allFlipped ? palette.gold50 : palette.textMuted}>
                  Get Interpretation
                </Text>
              </Card>
            </Pressable>
          </YStack>
        )}

        {/* 步骤 3：加载中 */}
        {step === 'loading' && (
          <YStack flex={1} justifyContent="center" alignItems="center" space={spacing.lg}>
            <Sparkles size={s(48)} color={palette.gold400} />
            <Text fontFamily="$heading" fontSize={fontSize.xl} fontWeight="700" color={palette.textPrimary}>
              Reading the Cards...
            </Text>
            <Text fontFamily="$body" fontSize={fontSize.base} color={palette.textTertiary}>
              Freya is interpreting your spread
            </Text>
          </YStack>
        )}

        {/* 步骤 4：解读报告 */}
        {step === 'report' && reading && (
          <RNScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: layout.page.paddingH, paddingBottom: s(60) }}>
            <YStack space={spacing.lg}>
              {/* 问题 */}
              <Text fontFamily="$body" fontSize={fontSize.sm} color={palette.gold400} textAlign="center">
                "{reading.question}"
              </Text>

              {/* 每张牌的解读 */}
              {reading.cards.map((card, i) => (
                <Card
                  key={i}
                  backgroundColor={palette.bgSurface}
                  borderRadius={layout.card.radius}
                  padding={layout.card.padding}
                  borderWidth={1}
                  borderColor={palette.borderGold}
                >
                  <YStack space={spacing.sm}>
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text fontFamily="$body" fontSize={fontSize.xs} color={palette.gold400}>
                        {card.positionLabel}
                      </Text>
                      {card.isReversed && (
                        <Text fontFamily="$body" fontSize={fontSize.xs} color={palette.coral400}>
                          Reversed
                        </Text>
                      )}
                    </XStack>
                    <Text fontFamily="$heading" fontSize={fontSize.xl} fontWeight="700" color={palette.textPrimary}>
                      {card.card.name}
                    </Text>
                    <XStack space={spacing.xs} flexWrap="wrap">
                      {card.keywords.map((kw, j) => (
                        <Card key={j} backgroundColor={palette.bgElevated} borderRadius={radius.sm} paddingHorizontal={spacing.sm} paddingVertical={spacing.xs}>
                          <Text fontFamily="$body" fontSize={fontSize.xs} color={palette.gold300}>{kw}</Text>
                        </Card>
                      ))}
                    </XStack>
                    <Text fontFamily="$body" fontSize={fontSize.base} color={palette.textSecondary} lineHeight={fontSize.base * 1.6}>
                      {card.interpretation}
                    </Text>
                  </YStack>
                </Card>
              ))}

              {/* 总结 */}
              <Card
                backgroundColor={palette.gold900}
                borderRadius={layout.card.radius}
                padding={layout.card.paddingLg}
                borderWidth={1}
                borderColor={palette.borderGold}
              >
                <YStack space={spacing.md}>
                  <Text fontFamily="$heading" fontSize={fontSize.lg} fontWeight="700" color={palette.gold300}>
                    Summary
                  </Text>
                  <Text fontFamily="$body" fontSize={fontSize.base} color={palette.gold100} lineHeight={fontSize.base * 1.6}>
                    {reading.summary}
                  </Text>
                  <Text fontFamily="$heading" fontSize={fontSize.lg} fontWeight="700" color={palette.gold300} marginTop={spacing.sm}>
                    Advice
                  </Text>
                  <Text fontFamily="$body" fontSize={fontSize.base} color={palette.gold100} lineHeight={fontSize.base * 1.6}>
                    {reading.advice}
                  </Text>
                </YStack>
              </Card>

              {/* 关闭按钮 */}
              <Pressable onPress={handleClose}>
                <Card
                  backgroundColor={palette.gold500}
                  borderRadius={layout.button.radius}
                  height={layout.button.heightLg}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text fontFamily="$heading" fontSize={layout.button.fontSizeLg} fontWeight="700" color={palette.gold50}>
                    Return to Chat
                  </Text>
                </Card>
              </Pressable>
            </YStack>
          </RNScrollView>
        )}
      </YStack>
    </Modal>
  );
};
