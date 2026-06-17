export interface TrueFalseData {
  /** Утверждение, которое нужно оценить. */
  statement: string;
  /** Истинно ли утверждение. */
  answer: boolean;
  /** Обязательное объяснение — в нём вся суть упражнения. */
  explanation: string;
}
