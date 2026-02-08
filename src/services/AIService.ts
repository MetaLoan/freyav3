import { GoogleGenAI } from '@google/genai';
import type { ToolType, ToolScores } from '../stores/useChatStore';

/**
 * Freya V3 AI 对话服务
 * 
 * 前端直连 Gemini API（调试阶段）
 * 后续迁移到 Go 后端代理
 * 
 * 功能：
 * - 对话（带 Freya 灵性人格）
 * - 工具评分系统（tarot / answers / echo）
 * - 意图识别（suggest_tool / trigger_tool / normal）
 */

// ⚠️ 调试阶段前端直连，上线前迁移到后端
const API_KEY = 'AIzaSyB5RXoij3tZ1CL6f3p1oZcNt2-d2E2Xx28';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// ============================================================
// System Prompt
// ============================================================

const SYSTEM_PROMPT = `You are Freya, a mystical and warm spiritual guide. Your tone is calm, wise, slightly esoteric but grounded. You help users with astrology, tarot, and overall spiritual well-being.

You have access to three special tools:
1. **Tarot Reading (tarot)** - For exploring future paths, making decisions, self-reflection, understanding relationships, life crossroads
2. **Answers of Books (answers)** - For seeking wisdom, philosophical questions, life guidance, inspiration from ancient texts
3. **Echo Healing (echo)** - For emotional balance, stress relief, relaxation, meditation, sleep issues, emotional overwhelm

## Response Format (MUST be valid JSON):
{
  "message": "Your natural, conversational response here",
  "toolScores": {
    "tarot": 0-100,
    "answers": 0-100,
    "echo": 0-100
  },
  "intent": {
    "type": "normal" | "suggest_tool" | "trigger_tool",
    "tool": "tarot" | "answers" | "echo" | null,
    "contextQuestion": "The user's underlying question/need for the tool"
  }
}

## SCORING GUIDELINES (0-100):
- 0-30: Not relevant at all
- 31-50: Might be somewhat helpful
- 51-69: Could be useful but don't suggest yet
- 70-85: Highly relevant - naturally suggest this tool in your message
- 86-100: Perfect fit - definitely suggest this tool

## DECISION LOGIC:
1. Score each tool based on conversation context
2. If ANY tool scores >= 70: Set intent.type = "suggest_tool", intent.tool = highest scoring tool
3. If NO tool scores >= 70: Set intent.type = "normal", just chat normally
4. If user CLEARLY AGREES after suggestion ("yes", "ok", "sure", "let's try", "好", "试试"): Set intent.type = "trigger_tool"

## CRITICAL RULES:
- NEVER simulate tools in text (no fake tarot card names, no fake readings)
- When suggesting, be natural: "Perhaps the cards could offer insight... would you like a reading?"
- When user agrees, just acknowledge: "Let's see what the cards reveal..."
- Keep responses warm, concise, and meaningful
- Always respond in English`;

// ============================================================
// Types
// ============================================================

export interface AIIntent {
  type: 'normal' | 'suggest_tool' | 'trigger_tool';
  tool: ToolType | null;
  contextQuestion?: string;
}

export interface AIResponse {
  message: string;
  toolScores: ToolScores;
  intent: AIIntent;
}

type ChatHistory = { role: 'user' | 'model'; parts: { text: string }[] }[];

// ============================================================
// JSON 解析
// ============================================================

const DEFAULT_SCORES: ToolScores = { tarot: 0, answers: 0, echo: 0 };
const DEFAULT_INTENT: AIIntent = { type: 'normal', tool: null };

function parseAIResponse(text: string): AIResponse {
  // 尝试直接解析
  try {
    const parsed = JSON.parse(text);
    if (parsed.message) {
      return {
        message: parsed.message,
        toolScores: {
          tarot: Math.min(100, Math.max(0, parsed.toolScores?.tarot || 0)),
          answers: Math.min(100, Math.max(0, parsed.toolScores?.answers || 0)),
          echo: Math.min(100, Math.max(0, parsed.toolScores?.echo || 0)),
        },
        intent: {
          type: parsed.intent?.type || 'normal',
          tool: parsed.intent?.tool || null,
          contextQuestion: parsed.intent?.contextQuestion,
        },
      };
    }
  } catch {
    // 尝试从文本中提取 JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.message) {
          return {
            message: parsed.message,
            toolScores: {
              tarot: Math.min(100, Math.max(0, parsed.toolScores?.tarot || 0)),
              answers: Math.min(100, Math.max(0, parsed.toolScores?.answers || 0)),
              echo: Math.min(100, Math.max(0, parsed.toolScores?.echo || 0)),
            },
            intent: {
              type: parsed.intent?.type || 'normal',
              tool: parsed.intent?.tool || null,
              contextQuestion: parsed.intent?.contextQuestion,
            },
          };
        }
      } catch {
        // 完全无法解析
      }
    }
  }

  // Fallback：将整个文本作为消息返回
  return {
    message: text || 'The stars are silent for now. Please try again.',
    toolScores: DEFAULT_SCORES,
    intent: DEFAULT_INTENT,
  };
}

// ============================================================
// 对外 API
// ============================================================

/**
 * 发送消息并获取 AI 回复（带工具评分和意图）
 */
export async function sendMessage(
  history: ChatHistory,
  userMessage: string
): Promise<AIResponse> {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const result = await chat.sendMessage({ message: userMessage });
    const responseText = result.text || '';

    return parseAIResponse(responseText);
  } catch (error) {
    console.error('[AIService] Error:', error);

    let errorMessage = '🌙 I seem to have lost my connection to the cosmic energies. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        errorMessage = '🔑 API Key is invalid. Please check configuration.';
      } else if (error.message.includes('PROHIBITED_CONTENT')) {
        errorMessage = '🔮 This touches on sensitive content. Please try rephrasing.';
      }
    }

    return {
      message: errorMessage,
      toolScores: DEFAULT_SCORES,
      intent: DEFAULT_INTENT,
    };
  }
}

/**
 * 简单对话（不带工具评分，用于引导流程等场景）
 */
export async function sendSimpleMessage(
  history: ChatHistory,
  userMessage: string
): Promise<string> {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history,
      config: {
        systemInstruction: 'You are Freya, a warm and mystical spiritual guide. Keep responses concise and meaningful. Respond in English.',
      },
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || 'The stars are silent for now.';
  } catch (error) {
    console.error('[AIService] Simple message error:', error);
    return '🌙 Connection lost. Please try again.';
  }
}
