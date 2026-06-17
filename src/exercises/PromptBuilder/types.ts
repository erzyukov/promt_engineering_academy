export interface BuilderOption {
  id: string;
  text: string;
  /** Хороший ли это вариант для данного слота. */
  good: boolean;
}

export interface BuilderSlot {
  id: string;
  /** Название части промпта: «Роль», «Контекст», ... */
  label: string;
  options: BuilderOption[];
}

export interface PromptBuilderData {
  /** Что должен делать собранный промпт (контекст задания). */
  task: string;
  slots: BuilderSlot[];
  explanation: string;
}
