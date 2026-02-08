import { Redirect } from 'expo-router';

/**
 * 根路由入口
 * 
 * 直接重定向到 (tabs) 组：
 * - 后续可在这里加入 onboarding 判断逻辑
 * - 未完成引导 → 跳转 (onboarding)
 * - 已完成引导 → 跳转 (tabs)
 */
export default function RootIndex() {
  // TODO: Phase 2 加入 onboarding 判断
  // const { onboardingCompleted } = useAuthStore();
  // if (!onboardingCompleted) return <Redirect href="/(onboarding)" />;

  return <Redirect href="/(tabs)" />;
}
