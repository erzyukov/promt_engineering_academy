export interface MultipleChoiceOption {
  id: string;
  text: string;
}

export interface MultipleChoiceData {
  question: string;
  options: MultipleChoiceOption[];
  /** id правильных вариантов. Один элемент = single-выбор (multi — в Фазе 2). */
  correct: string[];
  explanation?: string;
}
