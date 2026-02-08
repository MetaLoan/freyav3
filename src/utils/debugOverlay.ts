export type DebugLogEntry = {
  ts: number;
  message: string;
  data?: Record<string, unknown>;
};

const getStore = (): DebugLogEntry[] | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { __debugLogs?: DebugLogEntry[] };
  if (!w.__debugLogs) w.__debugLogs = [];
  return w.__debugLogs;
};

export const pushDebugLog = (message: string, data?: Record<string, unknown>) => {
  const store = getStore();
  if (!store) return;
  store.push({ ts: Date.now(), message, data });
  if (store.length > 200) store.shift();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('debug-log-update'));
  }
};

export const getDebugLogs = (): DebugLogEntry[] => {
  const store = getStore();
  return store ? [...store] : [];
};

export const shouldShowDebugOverlay = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === '1';
};
