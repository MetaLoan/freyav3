import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Text } from './Text';
import { Select } from './Select';
import { texts } from '../constants/texts';

export interface TimeSelectorProps {
  selectedTime: Date;
  timeUnit: string;
  onTimeChange: (time: Date) => void;
  onTimeUnitChange: (unit: string) => void;
  className?: string;
  showUnitSelect?: boolean;
  showTitle?: boolean;
  showActiveSubLabel?: boolean;
  labelClassName?: string;
  activeButtonClassName?: string;
  inactiveButtonClassName?: string;
  activeSubLabelClassName?: string;
}

/**
 * 时间选择器组件
 * 完整复制自 DailyInsight 页面，支持滑动渐变模糊效果
 */
export const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTime,
  timeUnit,
  onTimeChange,
  onTimeUnitChange,
  className = '',
  showUnitSelect = true,
  showTitle = true,
  showActiveSubLabel = false,
  labelClassName = 'text-sm-responsive',
  activeButtonClassName,
  inactiveButtonClassName,
  activeSubLabelClassName = 'text-size-micro font-normal text-off-white-beige/80 whitespace-nowrap -mt-0.5 leading-none',
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  // 时间选择器动画相关
  const timeSelectorScrollRef = useRef<HTMLDivElement>(null);
  const timeButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillTransform, setPillTransform] = useState({ x: 0, width: 60 });
  const [isPillReady, setIsPillReady] = useState(false);
  const [visualActiveIndex, setVisualActiveIndex] = useState(-1);
  const [pendingTime, setPendingTime] = useState<Date | null>(null);

  // 格式化日期显示
  const formatTimeLabel = (date: Date, unit: string): string => {
    const now = new Date();
    
    // 判断是否是当前时间区间
    const isCurrentSlot = (): boolean => {
      switch (unit) {
        case texts.time.units.hour:
          return date.getFullYear() === now.getFullYear() &&
                 date.getMonth() === now.getMonth() &&
                 date.getDate() === now.getDate() &&
                 date.getHours() === now.getHours();
        case texts.time.units.day:
          return date.getFullYear() === now.getFullYear() &&
                 date.getMonth() === now.getMonth() &&
                 date.getDate() === now.getDate();
        case texts.time.units.week: {
          // 检查是否在同一周（周一为一周的开始）
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
        case texts.time.units.month:
          return date.getFullYear() === now.getFullYear() &&
                 date.getMonth() === now.getMonth();
        case texts.time.units.year:
          return date.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    };
    
    // 如果是当前时间区间，显示 "Now"
    if (isCurrentSlot()) {
      return 'Now';
    }
    
    switch (unit) {
      case texts.time.units.hour:
        return `${date.getHours().toString().padStart(2, '0')}:00`;
      case texts.time.units.day:
        return date.getDate().toString();
      case texts.time.units.week: {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `W${weekNumber}`;
      }
      case texts.time.units.month: {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[date.getMonth()];
      }
      case texts.time.units.year:
        return date.getFullYear().toString();
      default:
        return date.getDate().toString();
    }
  };

  const formatActiveSubLabel = (date: Date, unit: string): string => {
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    switch (unit) {
      case texts.time.units.hour:
        return `${monthNamesShort[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      case texts.time.units.day:
        return `${monthNamesShort[date.getMonth()]} ${date.getFullYear()}`;
      case texts.time.units.week: {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${monthNamesShort[startOfWeek.getMonth()]}${startOfWeek.getDate()}-${monthNamesShort[endOfWeek.getMonth()]}${endOfWeek.getDate()}`;
      }
      case texts.time.units.month:
        return `${date.getFullYear()}`;
      case texts.time.units.year:
        return '';
      default:
        return `${monthNamesShort[date.getMonth()]} ${date.getFullYear()}`;
    }
  };

  // 根据时间粒度生成时间选择器数据（使用真实日期）
  const getTimeSelectorData = () => {
    const baseDate = new Date(selectedTime);
    const items: Array<{
      date: Date;
      label: string;
      active: boolean;
      hasDot: boolean;
      dotColor?: string;
      useRoundedRect?: boolean;
    }> = [];

    // 生成足够多的项目以支持无限滚动（前后各20个）
    const itemCount = 41; // 中心 + 前后各20
    const centerIndex = Math.floor(itemCount / 2);

    for (let i = -centerIndex; i <= centerIndex; i++) {
      const date = new Date(baseDate);
      
      switch (timeUnit) {
        case texts.time.units.hour:
          date.setHours(baseDate.getHours() + i + timeOffset);
          break;
        case texts.time.units.day:
          date.setDate(baseDate.getDate() + i + timeOffset);
          break;
        case texts.time.units.week:
          date.setDate(baseDate.getDate() + (i + timeOffset) * 7);
          break;
        case texts.time.units.month:
          date.setMonth(baseDate.getMonth() + i + timeOffset);
          break;
        case texts.time.units.year:
          date.setFullYear(baseDate.getFullYear() + i + timeOffset);
          break;
      }

      const now = new Date();
      const isSelected = date.getTime() === selectedTime.getTime();
      const isToday = date.toDateString() === now.toDateString() && timeUnit === texts.time.units.day;
      
      // 判断是否需要使用圆角矩形（标签较长时）
      const label = formatTimeLabel(date, timeUnit);
      const useRoundedRect = label.length > 3 || timeUnit === texts.time.units.week || timeUnit === texts.time.units.month || timeUnit === texts.time.units.year;

      items.push({
        date,
        label,
        active: isSelected,
        hasDot: true,
        dotColor: isSelected ? undefined : isToday ? "bg-zen-red" : undefined,
        useRoundedRect,
      });
    }

    return items;
  };

  const timeSelectorData = getTimeSelectorData();

  // 同步视觉选中索引（避免滚动后再二次校准引发抖动）
  useEffect(() => {
    if (pendingTime !== null) return;
    const activeIndex = timeSelectorData.findIndex(item => item.active);
    if (activeIndex === -1) return;
    // 仅在初始化或静默对齐阶段同步，避免交互完成后又改一次导致"跳一下"
    if (visualActiveIndex === -1 || !isPillReady) {
      setVisualActiveIndex(activeIndex);
    }
  }, [timeSelectorData, pendingTime, isPillReady, visualActiveIndex]);

  // 处理点击：1. 移动胶囊 -> 2. 轮盘带胶囊居中 -> 3. 数据无感刷新
  const handleTimeSelect = (idx: number, date: Date) => {
    if (visualActiveIndex === idx || pendingTime) return; 
    
    setPendingTime(date);
    
    const targetButton = timeButtonRefs.current[idx];
    const firstButton = timeButtonRefs.current[0];
    const scrollContainer = timeSelectorScrollRef.current;
    
    if (targetButton && firstButton && scrollContainer) {
      // --- 第一步：胶囊滑动 ---
      const offsetX = targetButton.offsetLeft - firstButton.offsetLeft;
      
      setVisualActiveIndex(idx);
      setPillTransform({ x: offsetX, width: targetButton.offsetWidth });

      // --- 第二步：等待胶囊滑动完成 (300ms) ---
      setTimeout(() => {
        // 重新读取按钮尺寸，避免宽度变化导致“过度位移”
        const currentTarget = timeButtonRefs.current[idx];
        if (!currentTarget) return;
        const buttonCenter = currentTarget.offsetLeft + currentTarget.offsetWidth / 2;
        const targetScroll = Math.max(0, buttonCenter - scrollContainer.clientWidth / 2);
        
        scrollContainer.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });

        // --- 第三步：等待滚动真实停止（避免固定时间导致过度位移）---
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
          // 静默对齐：先切到中心索引，避免“新列表 + 旧索引”那一帧把胶囊算到错误位置
          setIsPillReady(false);
          setVisualActiveIndex(20);

          // 更新数据（此时列表会瞬间重排，选中项物理索引=20）
          onTimeChange(date);
          setTimeOffset(0);
          setPendingTime(null);
          // 重新打开 isPillReady 交给下方 useLayoutEffect（它会在 paint 前对齐完位置后再打开）
        });
      }, 300);
    }
  };

  // 初始化/静默阶段：在 paint 前对齐胶囊与滚动，避免"闪一下"
  useLayoutEffect(() => {
    if (visualActiveIndex === -1) return;

    const activeButton = timeButtonRefs.current[visualActiveIndex];
    const firstButton = timeButtonRefs.current[0];
    const scrollContainer = timeSelectorScrollRef.current;
    if (!activeButton || !firstButton || !scrollContainer) return;

    const firstButtonRect = firstButton.getBoundingClientRect();
    const activeButtonRect = activeButton.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();

    const offsetX = activeButtonRect.left - firstButtonRect.left;
    const width = activeButtonRect.width;
    setPillTransform({ x: offsetX, width });

    // 静默阶段：直接把选中项对齐到中心（无 smooth、无二次校准）
    if (!isPillReady) {
      const scrollLeft = scrollContainer.scrollLeft;
      const buttonCenter =
        activeButtonRect.left - containerRect.left + scrollLeft + activeButtonRect.width / 2;
      const targetScroll = buttonCenter - scrollContainer.offsetWidth / 2;
      scrollContainer.scrollLeft = Math.max(0, targetScroll);
      // 下一帧开启动画供后续交互使用
      setTimeout(() => setIsPillReady(true), 0);
    }
  }, [visualActiveIndex, timeUnit, selectedTime, timeOffset, isPillReady]);

  // 监听滚动以触发 sticky 背景
  useEffect(() => {
    const handleScroll = () => {
      // 一上滑就立即触发 sticky 背景
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    // 初始化时检查一次
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 格式化日期标题
  const formatDateTitle = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = selectedTime;
    
    switch (timeUnit) {
      case texts.time.units.hour:
        return `${monthNamesShort[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} · ${date.getHours().toString().padStart(2, '0')}:00`;
      case texts.time.units.day:
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      case texts.time.units.week: {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${monthNamesShort[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNamesShort[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${date.getFullYear()}`;
      }
      case texts.time.units.month:
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      case texts.time.units.year:
        return `${date.getFullYear()}`;
      default:
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
  };

  return (
    <>
      <div ref={sentinelRef} className="h-px -mt-px"></div>
      <section 
        ref={sectionRef}
        className={`sticky top-safe-top z-40 pt-2 pb-4 transition-all duration-300 relative ${className}`}
      >
        {/* 渐变高斯模糊背景 - 从安全区顶部开始，承接过渡效果 */}
        {/* 
          模糊渐变参数说明：
          - top: 负的安全区高度，使渐变从安全区顶部开始
          - height: 120px（原高度）+ 安全区高度，确保覆盖完整区域
          - backdropFilter: blur(10px) - 10px 的模糊强度
          - maskImage: 渐变遮罩，从顶部 100% 不透明到底部 0% 透明
            * 0%: 完全不透明（安全区顶部）
            * 安全区高度 + 20px: 保持不透明，确保安全区区域完全覆盖
            * 安全区高度 + 50px: 90% 不透明，开始淡出
            * 安全区高度 + 90px: 70% 不透明，继续淡出
            * 安全区高度 + 120px: 完全透明，渐变结束
        */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 w-[100vw] transition-all duration-300 ${
            isSticky 
              ? 'opacity-100' 
              : 'opacity-0 pointer-events-none'
          }`}
          style={{
            top: 'calc(var(--telegram-safe-area-top, 0px) * -1)',
            height: 'calc(120px + var(--telegram-safe-area-top, 0px))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            // 使用 CSS 变量动态计算渐变点，确保从安全区顶部开始平滑过渡
            maskImage: `linear-gradient(to bottom, 
              rgba(0,0,0,1) 0%, 
              rgba(0,0,0,1) calc(var(--telegram-safe-area-top, 0px) + 20px), 
              rgba(0,0,0,0.9) calc(var(--telegram-safe-area-top, 0px) + 50px), 
              rgba(0,0,0,0.7) calc(var(--telegram-safe-area-top, 0px) + 90px), 
              rgba(0,0,0,0) calc(var(--telegram-safe-area-top, 0px) + 120px)
            )`,
            WebkitMaskImage: `linear-gradient(to bottom, 
              rgba(0,0,0,1) 0%, 
              rgba(0,0,0,1) calc(var(--telegram-safe-area-top, 0px) + 20px), 
              rgba(0,0,0,0.9) calc(var(--telegram-safe-area-top, 0px) + 50px), 
              rgba(0,0,0,0.7) calc(var(--telegram-safe-area-top, 0px) + 90px), 
              rgba(0,0,0,0) calc(var(--telegram-safe-area-top, 0px) + 120px)
            )`,
          }}
        ></div>
        
        {/* 时间单位选择器 - 固定在安全区底部居中 */}
        {showUnitSelect && (
          <div 
            className="fixed left-1/2 -translate-x-1/2 z-50"
            style={{
              // 安全区高度 - 36px（控件高度），确保控件底部对齐安全区底部
              // 使用 max 确保最小 top 为 8px
              top: 'max(8px, calc(var(--telegram-safe-area-top, 8px) - 36px))',
            }}
          >
            <div className="w-20">
              <Select
                options={[
                  { value: texts.time.units.hour, label: texts.time.units.hour },
                  { value: texts.time.units.day, label: texts.time.units.day },
                  { value: texts.time.units.week, label: texts.time.units.week },
                  { value: texts.time.units.month, label: texts.time.units.month },
                  { value: texts.time.units.year, label: texts.time.units.year },
                ]}
                value={timeUnit}
                onChange={(value) => {
                  onTimeUnitChange(value);
                  setTimeOffset(0);
                }}
              />
            </div>
          </div>
        )}
        
        {showTitle && (
          <div className="flex items-center mb-4 relative z-10">
            <Text variant="body" bold>
              {formatDateTitle()}
            </Text>
          </div>
        )}
        
        <div 
          ref={timeSelectorScrollRef}
          className="relative flex items-center text-center overflow-x-auto no-scrollbar pb-2 mask-linear-fade px-2"
        >
          {/* 动画药丸背景 - 始终保持可见，仅控制 transition 类的开关 */}
          <div 
            className={`absolute top-0 h-9 rounded-full bg-pale-terracotta z-0 ${
              isPillReady && pendingTime !== null ? 'transition-all duration-300 ease-out' : ''
            }`}
            style={{
              width: pillTransform.width,
              transform: `translateX(${pillTransform.x}px)`,
            }}
          />
          
          {timeSelectorData.map((item, idx) => {
            const isVisualActive = idx === visualActiveIndex;
            // 使用日期作为 key，帮助 React 识别 DOM 移动而非销毁重排
            const itemKey = `${timeUnit}-${item.date.getTime()}`;
            return (
              <button
                key={itemKey}
                ref={(el) => { timeButtonRefs.current[idx] = el; }}
                onClick={() => handleTimeSelect(idx, item.date)}
                className={`relative z-10 flex flex-col items-center justify-center px-3 h-9 ${
                  isVisualActive 
                    ? (activeButtonClassName || 'min-w-[60px]')
                    : (inactiveButtonClassName || 'min-w-[60px]')
                } ${!isVisualActive && !item.dotColor ? "opacity-50 hover:opacity-80" : ""} transition-opacity duration-300`}
              >
                <span className={`${labelClassName} font-medium whitespace-nowrap transition-colors duration-300 ${
                  isVisualActive 
                    ? 'text-off-white-beige' 
                    : 'text-mid-grey-tertiary dark:text-zen-dark-text-light hover:text-charcoal-primary dark:hover:text-zen-off-white'
                }`}>
                  {item.label}
                </span>
                {showActiveSubLabel && isVisualActive && (() => {
                  const subLabel = formatActiveSubLabel(item.date, timeUnit);
                  if (!subLabel) return null;
                  return (
                    <span className={activeSubLabelClassName}>
                      {subLabel}
                    </span>
                  );
                })()}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
};
