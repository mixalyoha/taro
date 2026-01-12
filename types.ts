
export enum Suit {
  MAJOR = 'Старшие Арканы',
  CUPS = 'Кубки',
  PENTACLES = 'Пентакли',
  SWORDS = 'Мечи',
  WANDS = 'Жезлы'
}

export interface TarotCard {
  id: string;
  name: string;
  suit: Suit;
  meaning: string;
  image_url: string;
  description: string;
}

export enum SpreadType {
  SINGLE = 'Одна карта',
  THREE_CARD = 'Прошлое, Настоящее, Будущее',
  RELATIONSHIP = 'Кельтский крест (мини)'
}

export interface ReadingHistoryItem {
  id: string;
  timestamp: number;
  question: string;
  spreadType: SpreadType;
  cards: TarotCard[];
  interpretation: string;
}
