import { createContext, useContext } from 'react';
import type { ExerciseResult } from './types';

/**
 * Контекст тест-режима. Когда упражнения обёрнуты в <Quiz>, провайдер
 * раздаёт этот контекст и собирает результаты. В инлайн-режиме контекст === null.
 */
export interface QuizContextValue {
  /** Упражнение сообщает свой результат наверх (в тест-режиме). */
  report: (result: ExerciseResult) => void;
}

export const QuizContext = createContext<QuizContextValue | null>(null);

export function useQuizContext(): QuizContextValue | null {
  return useContext(QuizContext);
}
