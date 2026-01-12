
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
  SINGLE = 'Карта дня',
  THREE_CARD = 'Три тайны',
  BOOMERANG = 'Бумеранг врагам',
  EX_STATE = 'Как дела у бывшей?',
  WEEKLY = 'Расклад на неделю'
}

export interface ReadingHistoryItem {
  id: string;
  timestamp: number;
  question: string;
  spreadType: SpreadType;
  cards: TarotCard[];
  interpretation: string;
}
