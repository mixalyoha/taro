
import { GoogleGenAI } from "@google/genai";
import { TarotCard, SpreadType } from "../types";

export const interpretReading = async (
  question: string,
  spreadType: SpreadType,
  cards: TarotCard[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const cardsList = cards.map((c, i) => `Карта ${i + 1}: ${c.name} (Суть: ${c.meaning})`).join('\n');
  
  let spreadContext = "";
  if (spreadType === SpreadType.BOOMERANG) {
    spreadContext = "\nКонтекст 'Бумеранг': 1. Что против вас. 2. Что летит обратно врагу. 3. Ваш урок.";
  } else if (spreadType === SpreadType.EX_STATE) {
    spreadContext = "\nКонтекст 'Бывшая': 1. Реальность ее жизни. 2. Ее мысли о вас. 3. Перспектива.";
  } else if (spreadType === SpreadType.WEEKLY) {
    spreadContext = "\nКонтекст 'Неделя': 1. Начало. 2. Пик. 3. Финал.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ 
        parts: [{ 
          text: `Вопрос: "${question}"\nРасклад: ${spreadType}${spreadContext}\nКарты:\n${cardsList}\n\nДай четкий анализ связки этих карт.` 
        }] 
      }],
      config: {
        systemInstruction: "Вы — 'Эфирный Оракул'. Ваша интерпретация должна быть ПРЯМОЙ, СТРОГОЙ и БЕЗ ВОДЫ. Исключите любые 'ванильные' утешения, пустые фразы и общие места. Говорите по существу связки карт. Анализируйте, как карты сталкиваются или дополняют друг друга. Если прогноз плохой — говорите прямо. Если ситуация требует действий — указывайте каких. Тон: холодный, мистический, реалистичный. Никаких 'все будет хорошо' и 'вселенная любит вас', только сухие факты из символизма карт и их комбинаций. Ответ должен быть компактным, но максимально емким.",
        temperature: 0.8,
        topP: 0.9,
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
    return "Эфир молчит. Повтори позже.";
  }
};
