export interface FillBlank {
  /** Допустимые варианты ответа (сравнение без учёта регистра, ё/е и пробелов). */
  accept: string[];
}

export interface FillTheBlankData {
  /** Текст с маркерами пропусков: {{0}}, {{1}}, ... */
  template: string;
  /** Описание пропусков по индексам маркеров. */
  blanks: FillBlank[];
  explanation?: string;
}
