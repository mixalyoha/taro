
import { GoogleGenAI } from "@google/genai";
import { TarotCard, SpreadType } from "../types";

export const interpretReading = async (
  question: string,
  spreadType: SpreadType,
  cards: TarotCard[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const cardsList = cards.map((c, i) => `Карта ${i + 1}: ${c.name} (${c.meaning})`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ 
        parts: [{ 
          text: `Вопрос пользователя: "${question}"\nТип расклада: ${spreadType}\nВыпавшие карты из Оракула Полной Луны:\n${cardsList}` 
        }] 
      }],
      config: {
        systemInstruction: "Вы — таинственный и проницательный оракул, работающий с колодой 'Оракул Полной Луны'. Ваша задача — дать глубокое, интуитивное и мистическое толкование на РУССКОМ языке. Оракул Полной Луны работает с тенями, скрытыми эмоциями и подсознанием. Тон должен быть загадочным, но направляющим. Объединяйте метафоры карт в единый поток предсказания. Не используйте Markdown-заголовки (#), только абзацы. Акцентируйте внимание на том, что скрыто от глаз пользователя под светом Луны.",
        temperature: 0.9,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Лунный свет сегодня слишком тускл... (Ошибка при получении толкования). Попробуйте позже, когда туман рассеется.";
  }
};
