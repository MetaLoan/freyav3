import { GoogleGenAI } from '@google/genai';
import type { TarotCardData, TarotPosition } from '../lib/tarot-data';

/**
 * 塔罗牌 AI 解读服务
 * 
 * 使用 Gemini 生成基于抽到的牌的结构化解读报告
 */

const API_KEY = 'AIzaSyB5RXoij3tZ1CL6f3p1oZcNt2-d2E2Xx28';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface TarotReadingCard {
  card: TarotCardData;
  isReversed: boolean;
  position: TarotPosition;
  positionLabel: string;
  interpretation: string;
  keywords: string[];
}

export interface TarotReadingData {
  question: string;
  cards: TarotReadingCard[];
  summary: string;
  advice: string;
  timestamp: string;
}

interface GeminiTarotResponse {
  cards: {
    positionLabel: string;
    interpretation: string;
    keywords: string[];
  }[];
  summary: string;
  advice: string;
}

/**
 * 生成塔罗解读报告
 */
export async function generateTarotReading(
  drawnCards: { card: TarotCardData; isReversed: boolean }[],
  question: string,
  userName: string = 'Seeker'
): Promise<TarotReadingData | null> {
  const positions: TarotPosition[] = ['past', 'present', 'future'];

  const cardDescriptions = drawnCards.map((d, i) => {
    const pos = positions[i] || 'present';
    return `Position ${i + 1} (${pos}): ${d.card.name} (${d.isReversed ? 'Reversed' : 'Upright'}) - ${d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning}`;
  }).join('\n');

  const prompt = `You are Freya, a mystical tarot reader. Generate a tarot reading interpretation.

User: ${userName}
Question: ${question}

Cards drawn:
${cardDescriptions}

Respond in valid JSON format:
{
  "cards": [
    {
      "positionLabel": "The Past",
      "interpretation": "2-3 sentence interpretation for this card in this position",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "summary": "A 2-3 sentence overall summary connecting all three cards",
  "advice": "A practical, encouraging piece of advice based on the reading"
}

Be warm, insightful, and mystical. Connect the cards to the user's question. Keep interpretations concise but meaningful.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text || '';
    let parsed: GeminiTarotResponse;

    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      parsed = JSON.parse(jsonMatch[0]);
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      question,
      cards: drawnCards.map((d, i) => ({
        card: d.card,
        isReversed: d.isReversed,
        position: positions[i] || 'present',
        positionLabel: parsed.cards[i]?.positionLabel || ['The Past', 'The Present', 'The Future'][i],
        interpretation: parsed.cards[i]?.interpretation || d.card.description,
        keywords: parsed.cards[i]?.keywords || d.card.keywords.slice(0, 3),
      })),
      summary: parsed.summary || 'The cards reveal a journey of transformation.',
      advice: parsed.advice || 'Trust the process and follow your intuition.',
      timestamp,
    };
  } catch (error) {
    console.error('[TarotService] Error generating reading:', error);
    return null;
  }
}
