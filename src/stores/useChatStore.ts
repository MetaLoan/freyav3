import { create } from 'zustand';

/**
 * 对话状态管理
 * 
 * 管理 AI 对话消息、工具状态、加载态
 */

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'model' | 'system';
  timestamp: string;
  /** 是否已收藏 */
  isFavorited?: boolean;
  /** 工具类型（如果消息包含工具结果） */
  toolType?: 'tarot' | 'answers' | 'echo';
  /** 工具数据（JSON） */
  toolData?: Record<string, unknown>;
}

export type ToolType = 'tarot' | 'answers' | 'echo';

export interface ToolScores {
  tarot: number;
  answers: number;
  echo: number;
}

interface ChatState {
  /** 消息列表 */
  messages: Message[];
  /** 是否正在加载 AI 回复 */
  isLoading: boolean;
  /** 输入框内容 */
  inputValue: string;
  /** AI 推荐的工具评分 */
  toolScores: ToolScores | null;
  /** 待确认的工具推荐 */
  pendingTool: { tool: ToolType; contextQuestion?: string } | null;

  /** 添加消息 */
  addMessage: (message: Message) => void;
  /** 批量设置消息 */
  setMessages: (messages: Message[]) => void;
  /** 更新消息属性 */
  updateMessage: (id: string, updates: Partial<Message>) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置输入值 */
  setInputValue: (value: string) => void;
  /** 设置工具评分 */
  setToolScores: (scores: ToolScores | null) => void;
  /** 设置待确认工具 */
  setPendingTool: (tool: { tool: ToolType; contextQuestion?: string } | null) => void;
  /** 切换消息收藏状态 */
  toggleFavorite: (id: string) => void;
  /** 清空对话 */
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  inputValue: '',
  toolScores: null,
  pendingTool: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) =>
    set({ messages }),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setInputValue: (value) =>
    set({ inputValue: value }),

  setToolScores: (scores) =>
    set({ toolScores: scores }),

  setPendingTool: (tool) =>
    set({ pendingTool: tool }),

  toggleFavorite: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isFavorited: !m.isFavorited } : m
      ),
    })),

  clearMessages: () =>
    set({ messages: [], toolScores: null, pendingTool: null }),
}));
