import { createContext, useContext } from 'react';
import type { ExerciseResult } from './types';

/**
 * Контекст тест-режима. Когда упражнения обёрнуты в <Quiz>, провайдер
 * раздаёт этот контекст: упражнения регистрируются и сообщают результаты.
 * В инлайн-режиме контекст === null.
 */
export interface QuizContextValue {
  /** Упражнение регистрируется в тесте при монтировании (для прогресса и порядка). */
  register: (id: string) => void;
  /** Снимает регистрацию при размонтировании. */
  unregister: (id: string) => void;
  /** Упражнение сообщает свой результат наверх. */
  report: (result: ExerciseResult) => void;
}

export const QuizContext = createContext<QuizContextValue | null>(null);

export function useQuizContext(): QuizContextValue | null {
  return useContext(QuizContext);
}
