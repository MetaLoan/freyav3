import { create } from 'zustand';

/**
 * 设置状态管理
 * 
 * 管理主题、字体、声音、触觉等用户偏好设置
 */

export type ThemeMode = 'dark' | 'light' | 'system';
export type FontOption = 'system' | 'inter' | 'playfair';

interface SettingsState {
  /** 主题模式 */
  themeMode: ThemeMode;
  /** 字体选择 */
  font: FontOption;
  /** 是否启用声音 */
  soundEnabled: boolean;
  /** 是否启用触觉反馈 */
  hapticsEnabled: boolean;
  /** 是否启用通知 */
  notificationsEnabled: boolean;

  /** 设置主题 */
  setThemeMode: (mode: ThemeMode) => void;
  /** 设置字体 */
  setFont: (font: FontOption) => void;
  /** 切换声音 */
  toggleSound: () => void;
  /** 切换触觉 */
  toggleHaptics: () => void;
  /** 切换通知 */
  toggleNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'dark',
  font: 'inter',
  soundEnabled: true,
  hapticsEnabled: true,
  notificationsEnabled: true,

  setThemeMode: (mode) =>
    set({ themeMode: mode }),

  setFont: (font) =>
    set({ font }),

  toggleSound: () =>
    set((state) => ({ soundEnabled: !state.soundEnabled })),

  toggleHaptics: () =>
    set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),

  toggleNotifications: () =>
    set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
}));
