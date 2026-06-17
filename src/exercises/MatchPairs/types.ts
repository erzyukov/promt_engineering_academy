export interface MatchItem {
  id: string;
  text: string;
}

export interface MatchPairsData {
  /** Левый столбец — фиксированные слоты (термины). */
  left: MatchItem[];
  /** Правый столбец — перетаскиваемые карточки (определения). */
  right: MatchItem[];
  /** Правильное сопоставление: leftId → rightId. */
  correct: Record<string, string>;
  explanation?: string;
}
