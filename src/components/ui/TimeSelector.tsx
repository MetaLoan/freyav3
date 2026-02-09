import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Platform, ScrollView as RNScrollView, Pressable } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { palette } from '../../config/theme';
import { layout } from '../../config/layout';
import { s, fs, spacing, fontSize } from '../../utils/responsive';

// ============================================================
// 时间单位
// ============================================================

export type TimeUnit = 'Hour' | 'Day' | 'Week' | 'Month' | 'Year';

const TIME_UNITS: TimeUnit[] = ['Day', 'Week', 'Month', 'Year'];

// ============================================================
// 接口
// ============================================================

export interface TimeSelectorProps {
  selectedTime: Date;
  timeUnit: TimeUnit;
  onTimeChange: (time: Date) => void;
  onTimeUnitChange: (unit: TimeUnit) => void;
  showUnitSelect?: boolean;
  showTitle?: boolean;
  /** 安全区域顶部高度（px），悬浮模式下作为顶部内边距 */
  safeAreaTop?: number;
}

// ============================================================
// 时间选择器组件
// 适配自参考 DailyInsight 组件，保留核心动画逻辑
// ============================================================

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTime,
  timeUnit,
  onTimeChange,
  onTimeUnitChange,
  showUnitSelect = true,
  showTitle = true,
  safeAreaTop = 0,
}) => {
  const [timeOffset, setTimeOffset] = useState(0);

  // 胶囊动画相关
  const scrollRef = useRef<any>(null);
  const buttonRefs = useRef<any[]>([]);
  const [pillTransform, setPillTransform] = useState({ x: 0, width: 60 });
  const [isPillReady, setIsPillReady] = useState(false);
  const [visualActiveIndex, setVisualActiveIndex] = useState(-1);
  const [pendingTime, setPendingTime] = useState<Date | null>(null);

  // 滚动进度（用于控制模糊效果）
  const [scrollProgress, setScrollProgress] = useState(0);

  // ============================================================
  // 日期格式化
  // ============================================================

  const formatTimeLabel = useCallback((date: Date, unit: TimeUnit): string => {
    const now = new Date();

    const isCurrentSlot = (): boolean => {
      switch (unit) {
        case 'Hour':
          return date.getFullYear() === now.getFullYear() &&
                 date.getMonth() === now.getMonth() &&
                 date.getDate() === now.getDate() &&
                 date.getHours() === now.getHours();
        case 'Day':
          return date.getFullYear() === now.getFullYear() &&
                 date.getMonth() === now.getMonth() &&
                 date.getDate() === now.getDate();
        case 'Week': {
          const getWeekStart = (d: Date) => {
            const dt = new Date(d);
            const day = dt.getDay();
            const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(dt.getFullYear(), dt.getMonth(), diff);
          };
          const dateWeekStart = getWeekStart(date);
          const nowWeekStart = getWeekStart(now);
          return dateWeekStart.getFullYear() === nowWeekStart.getFullYear() &&
                 dateWeekStart.getMonth() === nowWeekStart.getMonth() &&
                 dateWeekStart.getDate() === nowWeekStart.getDate();
        }
        case 'Month':
          return date.getFullYear() === now.getFullYear() &&
                 date.getMonth() === now.getMonth();
        case 'Year':
          return date.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    };

    if (isCurrentSlot()) return 'Now';

    switch (unit) {
      case 'Hour':
        return `${date.getHours().toString().padStart(2, '0')}:00`;
      case 'Day':
        return date.getDate().toString();
      case 'Week': {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `W${weekNumber}`;
      }
      case 'Month': {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[date.getMonth()];
      }
      case 'Year':
        return date.getFullYear().toString();
      default:
        return date.getDate().toString();
    }
  }, []);

  const formatDateTitle = useCallback((): string => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = selectedTime;

    switch (timeUnit) {
      case 'Hour':
        return `${monthNamesShort[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} · ${date.getHours().toString().padStart(2, '0')}:00`;
      case 'Day':
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      case 'Week': {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${monthNamesShort[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNamesShort[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${date.getFullYear()}`;
      }
      case 'Month':
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      case 'Year':
        return `${date.getFullYear()}`;
      default:
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
  }, [selectedTime, timeUnit]);

  // ============================================================
  // 生成时间选择器数据（前后各 20 项 + 中心 = 41 项）
  // ============================================================

  const getTimeSelectorData = useCallback(() => {
    const baseDate = new Date(selectedTime);
    const items: Array<{
      date: Date;
      label: string;
      active: boolean;
    }> = [];

    const itemCount = 41;
    const centerIndex = Math.floor(itemCount / 2);

    for (let i = -centerIndex; i <= centerIndex; i++) {
      const date = new Date(baseDate);

      switch (timeUnit) {
        case 'Hour':
          date.setHours(baseDate.getHours() + i + timeOffset);
          break;
        case 'Day':
          date.setDate(baseDate.getDate() + i + timeOffset);
          break;
        case 'Week':
          date.setDate(baseDate.getDate() + (i + timeOffset) * 7);
          break;
        case 'Month':
          date.setMonth(baseDate.getMonth() + i + timeOffset);
          break;
        case 'Year':
          date.setFullYear(baseDate.getFullYear() + i + timeOffset);
          break;
      }

      const isSelected = date.getTime() === selectedTime.getTime();

      items.push({
        date,
        label: formatTimeLabel(date, timeUnit),
        active: isSelected,
      });
    }

    return items;
  }, [selectedTime, timeUnit, timeOffset, formatTimeLabel]);

  const timeSelectorData = getTimeSelectorData();

  // ============================================================
  // 同步视觉选中索引
  // ============================================================

  useEffect(() => {
    if (pendingTime !== null) return;
    const activeIndex = timeSelectorData.findIndex(item => item.active);
    if (activeIndex === -1) return;
    if (visualActiveIndex === -1 || !isPillReady) {
      setVisualActiveIndex(activeIndex);
    }
  }, [timeSelectorData, pendingTime, isPillReady, visualActiveIndex]);

  // ============================================================
  // 点击处理：胶囊滑动 → 滚动居中 → 数据刷新
  // ============================================================

  const handleTimeSelect = useCallback((idx: number, date: Date) => {
    if (visualActiveIndex === idx || pendingTime) return;

    setPendingTime(date);

    // 非 web 直接切换
    if (Platform.OS !== 'web') {
      onTimeChange(date);
      setTimeOffset(0);
      setPendingTime(null);
      return;
    }

    const targetButton = buttonRefs.current[idx];
    const firstButton = buttonRefs.current[0];
    const scrollContainer = scrollRef.current;

    if (targetButton && firstButton && scrollContainer) {
      // 第一步：胶囊滑动
      const offsetX = targetButton.offsetLeft - firstButton.offsetLeft;

      setVisualActiveIndex(idx);
      setPillTransform({ x: offsetX, width: targetButton.offsetWidth });

      // 第二步：等待胶囊滑动完成 (300ms)
      setTimeout(() => {
        const currentTarget = buttonRefs.current[idx];
        if (!currentTarget) return;
        const buttonCenter = currentTarget.offsetLeft + currentTarget.offsetWidth / 2;
        const targetScroll = Math.max(0, buttonCenter - scrollContainer.clientWidth / 2);

        scrollContainer.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });

        // 第三步：等待滚动停止
        const waitForScrollEnd = () =>
          new Promise<void>((resolve) => {
            let lastPos = scrollContainer.scrollLeft;
            let lastChange = performance.now();
            const start = performance.now();

            const tick = () => {
              const current = scrollContainer.scrollLeft;
              const now = performance.now();
              if (Math.abs(current - lastPos) > 0.5) {
                lastPos = current;
                lastChange = now;
              }

              const isCloseEnough = Math.abs(current - targetScroll) < 1;
              const isIdle = now - lastChange > 120;
              const timedOut = now - start > 900;

              if (isCloseEnough || isIdle || timedOut) {
                resolve();
                return;
              }
              requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });

        waitForScrollEnd().then(() => {
          // 静默对齐：先切到中心索引
          setIsPillReady(false);
          setVisualActiveIndex(20);

          // 更新数据
          onTimeChange(date);
          setTimeOffset(0);
          setPendingTime(null);
        });
      }, 300);
    }
  }, [visualActiveIndex, pendingTime, onTimeChange]);

  // ============================================================
  // 初始化 / 静默阶段：paint 前对齐胶囊与滚动
  // ============================================================

  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    if (visualActiveIndex === -1) return;

    const activeButton = buttonRefs.current[visualActiveIndex];
    const firstButton = buttonRefs.current[0];
    const scrollContainer = scrollRef.current;
    if (!activeButton || !firstButton || !scrollContainer) return;

    const firstButtonRect = firstButton.getBoundingClientRect();
    const activeButtonRect = activeButton.getBoundingClientRect();

    const offsetX = activeButtonRect.left - firstButtonRect.left;
    const width = activeButtonRect.width;
    setPillTransform({ x: offsetX, width });

    // 静默阶段：直接居中
    if (!isPillReady) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollLeft = scrollContainer.scrollLeft;
      const buttonCenter =
        activeButtonRect.left - containerRect.left + scrollLeft + activeButtonRect.width / 2;
      const targetScroll = buttonCenter - scrollContainer.offsetWidth / 2;
      scrollContainer.scrollLeft = Math.max(0, targetScroll);
      setTimeout(() => setIsPillReady(true), 0);
    }
  }, [visualActiveIndex, timeUnit, selectedTime, timeOffset, isPillReady]);

  // 切换 timeUnit 时重置状态
  const handleUnitChange = useCallback((unit: TimeUnit) => {
    onTimeUnitChange(unit);
    setTimeOffset(0);
    setIsPillReady(false);
    setVisualActiveIndex(-1);
  }, [onTimeUnitChange]);

  // 监听滚动进度（从 CSS 变量 --sp 读取）
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const updateScrollProgress = () => {
      const sp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sp') || '0');
      setScrollProgress(sp);
    };

    // 初始读取
    updateScrollProgress();

    // 使用 requestAnimationFrame 轮询 CSS 变量变化
    // 优化：只在滚动时更新（通过检查值是否变化）
    let rafId: number;
    let lastSp = 0;
    const tick = () => {
      const currentSp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sp') || '0');
      // 只在值变化时更新 state，减少不必要的重渲染
      if (Math.abs(currentSp - lastSp) > 0.01) {
        setScrollProgress(currentSp);
        lastSp = currentSp;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ============================================================
  // 渲染
  // ============================================================

  // 胶囊高度
  const PILL_H = s(36);
  // 按钮内边距
  const BTN_PX = s(12);
  // 按钮最小宽度
  const BTN_MIN_W = s(48);

  return (
    <YStack
      paddingBottom={spacing.sm}
      zIndex={50}
      // @ts-ignore web-only: fixed positioning at top
      style={Platform.OS === 'web' ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: safeAreaTop + spacing.sm,
        // 根据滚动进度动态调整模糊：0px (顶部) → 20px (滚动后)
        backdropFilter: `blur(${scrollProgress * 20}px)`,
        WebkitBackdropFilter: `blur(${scrollProgress * 20}px)`,
        backgroundColor: 'transparent', // 完全透明背景
        zIndex: 50,
        transition: 'backdrop-filter 0.2s ease-out', // 平滑过渡
      } : {
        paddingTop: safeAreaTop + spacing.sm,
      }}
    >
      {/* 顶部：日期标题 + 时间单位切换 */}
      <XStack
        paddingHorizontal={layout.page.paddingH}
        justifyContent="space-between"
        alignItems="center"
        marginBottom={spacing.md}
      >
        {showTitle && (
          <Text fontFamily="$heading" fontSize={fontSize.base} fontWeight="600" color={palette.gold200}>
            {formatDateTitle()}
          </Text>
        )}

        {showUnitSelect && (
          <XStack
            backgroundColor={palette.white10}
            borderRadius={s(8)}
            overflow="hidden"
          >
            {TIME_UNITS.map((unit) => (
              <Pressable
                key={unit}
                onPress={() => handleUnitChange(unit)}
                // @ts-ignore web-only
                style={{
                  paddingHorizontal: s(10),
                  paddingVertical: s(6),
                  borderRadius: s(6),
                  backgroundColor: timeUnit === unit ? palette.gold400 : 'transparent',
                }}
              >
                <Text
                  fontFamily="$body"
                  fontSize={fs(11)}
                  fontWeight={timeUnit === unit ? '700' : '400'}
                  color={timeUnit === unit ? palette.bgDeep : palette.textTertiary}
                >
                  {unit}
                </Text>
              </Pressable>
            ))}
          </XStack>
        )}
      </XStack>

      {/* 可滚动时间选择器 */}
      {Platform.OS === 'web' ? (
        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            overflowX: 'auto',
            overflowY: 'hidden', // 防止垂直滚动条
            paddingBottom: s(4),
            paddingLeft: s(8),
            paddingRight: s(8),
            // 隐藏滚动条（多浏览器兼容）
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
            // 加强两侧渐隐：更宽的渐变区域 + 中间过渡层
            maskImage: `linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) ${s(40)}px, black ${s(70)}px, black calc(100% - ${s(70)}px), rgba(0,0,0,0.3) calc(100% - ${s(40)}px), transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) ${s(40)}px, black ${s(70)}px, black calc(100% - ${s(70)}px), rgba(0,0,0,0.3) calc(100% - ${s(40)}px), transparent 100%)`,
          }}
        >
          {/* 动画胶囊背景 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              height: PILL_H,
              borderRadius: 9999,
              backgroundImage: `linear-gradient(180deg, ${palette.gold400} 0%, ${palette.gold600} 100%)`,
              zIndex: 0,
              width: pillTransform.width,
              transform: `translateX(${pillTransform.x}px)`,
              transition: isPillReady && pendingTime !== null ? 'all 300ms ease-out' : 'none',
              boxShadow: `0 2px 8px rgba(196, 154, 108, 0.3)`,
            }}
          />

          {/* 时间按钮 — 3D 透视轮盘效果 */}
          {timeSelectorData.map((item, idx) => {
            const isVisualActive = idx === visualActiveIndex;

            // 计算距离选中中心的偏移
            const centerIndex = visualActiveIndex >= 0 ? visualActiveIndex : 20;
            const offset = idx - centerIndex;
            const distance = Math.abs(offset);
            const maxDist = 12;
            const t = Math.min(distance / maxDist, 1); // 0~1 归一化

            // 轮盘效果参数
            const scaleVal  = 1 - t * 0.2;              // 1.0 → 0.8
            const zVal      = -t * 30;                    // 0 → -30px
            const rotateVal = (offset > 0 ? 1 : -1) * t * 20; // ±20deg
            const opacityVal = isVisualActive ? 1 : 0.6 - t * 0.35; // 0.6 → 0.25

            return (
              <button
                key={`${timeUnit}-${item.date.getTime()}`}
                ref={(el) => { buttonRefs.current[idx] = el; }}
                onClick={() => handleTimeSelect(idx, item.date)}
                style={{
                  position: 'relative',
                  zIndex: 10 - distance,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: BTN_PX,
                  paddingRight: BTN_PX,
                  height: PILL_H,
                  minWidth: BTN_MIN_W,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: opacityVal,
                  transition: 'opacity 300ms',
                  flexShrink: 0,
                }}
              >
                {/* 3D 透视轮盘应用在内部 span，不影响按钮布局位置 */}
                <span style={{
                  display: 'inline-block',
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  fontSize: fs(13),
                  fontWeight: isVisualActive ? 700 : 500,
                  whiteSpace: 'nowrap' as const,
                  transition: 'color 300ms, transform 300ms',
                  color: isVisualActive ? palette.bgDeep : palette.textSecondary,
                  // 3D 透视轮盘：远端缩小 + 向后推 + 绕 Y 轴旋转
                  transform: `perspective(800px) translateZ(${zVal}px) rotateY(${rotateVal}deg) scale(${scaleVal})`,
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Native 简化版本 — 无胶囊动画 */
        <RNScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.sm }}
        >
          {timeSelectorData.map((item, idx) => (
            <Pressable
              key={`${timeUnit}-${item.date.getTime()}`}
              onPress={() => handleTimeSelect(idx, item.date)}
              style={{
                paddingHorizontal: BTN_PX,
                paddingVertical: s(8),
                borderRadius: 9999,
                backgroundColor: item.active ? palette.gold400 : 'transparent',
                marginRight: s(4),
                minWidth: BTN_MIN_W,
                alignItems: 'center',
              }}
            >
              <Text
                fontFamily="$body"
                fontSize={fs(13)}
                fontWeight={item.active ? '700' : '500'}
                color={item.active ? palette.bgDeep : palette.textTertiary}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </RNScrollView>
      )}
    </YStack>
  );
};
