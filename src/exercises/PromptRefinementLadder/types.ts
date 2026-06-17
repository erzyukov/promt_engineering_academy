/** Элемент промпта, который добавляет «ступень». */
export type PromptElement = 'role' | 'context' | 'task' | 'format' | 'constraint' | 'example';

export interface LadderRung {
  id: string;
  /** Подпись кнопки: «Добавить роль эксперта». */
  label: string;
  element: PromptElement;
  /** Текст, который дописывается к промпту. */
  addsText: string;
}

export interface LadderResponse {
  /** Заготовленный ответ показывается, когда все эти элементы применены (берётся самый специфичный). */
  whenElements: PromptElement[];
  text: string;
}

export interface PromptRefinementLadderData {
  /** Что нужно получить от модели. */
  task: string;
  /** Слабый стартовый промпт. */
  basePrompt: string;
  rungs: LadderRung[];
  /** Заготовленные «ответы AI» под разные наборы элементов (должен быть и базовый с whenElements: []). */
  responses: LadderResponse[];
  /** Набор элементов, считающийся оптимальным. */
  optimalSet: PromptElement[];
  explanation: string;
}
