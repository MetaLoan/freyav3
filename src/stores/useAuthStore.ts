import { create } from 'zustand';

/**
 * 认证状态管理
 * 
 * 管理用户登录态、Token、用户信息、引导完成状态
 * TMA 环境通过 Telegram initData 自动认证
 * 原生 App 环境通过手机号/邮箱登录
 */

export interface UserProfile {
  id: string;
  name: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  birthTime?: string;
  birthLocation?: string;
  zodiacSign?: string;
  avatarUrl?: string;
  telegramId?: number;
  subscriptionType: 'free' | 'premium';
  credits: number;
}

interface AuthState {
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** JWT Token */
  token: string | null;
  /** 用户信息 */
  user: UserProfile | null;
  /** 引导流程是否已完成 */
  onboardingCompleted: boolean;
  /** 是否正在加载认证状态 */
  isLoading: boolean;

  /** 设置认证信息 */
  setAuth: (token: string, user: UserProfile) => void;
  /** 清除认证（登出） */
  clearAuth: () => void;
  /** 更新用户信息 */
  updateUser: (updates: Partial<UserProfile>) => void;
  /** 标记引导完成 */
  completeOnboarding: () => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  onboardingCompleted: false,
  isLoading: true,

  setAuth: (token, user) =>
    set({ isAuthenticated: true, token, user, isLoading: false }),

  clearAuth: () =>
    set({ isAuthenticated: false, token: null, user: null }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  completeOnboarding: () =>
    set({ onboardingCompleted: true }),

  setLoading: (loading) =>
    set({ isLoading: loading }),
}));
