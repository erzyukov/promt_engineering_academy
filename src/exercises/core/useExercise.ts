import { useCallback, useState } from 'react';
import type { ExerciseResult, ExerciseStatus } from './types';
import { useQuizContext } from './QuizContext';

export interface UseExerciseOptions<TAnswer> {
  id: string;
  /** Чистая функция проверки конкретного типа упражнения. */
  validate: (answer: TAnswer) => ExerciseResult;
}

/**
 * Сердце системы: управляет состоянием упражнения (idle → отвечено) и связью
 * с тест-режимом. Компонент не знает, в каком он режиме — хук сам решает,
 * нужно ли отдавать результат в QuizContext.
 */
export function useExercise<TAnswer>({ id, validate }: UseExerciseOptions<TAnswer>) {
  const quiz = useQuizContext();
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const [result, setResult] = useState<ExerciseResult | null>(null);

  const submit = useCallback(
    (answer: TAnswer) => {
      const r = validate(answer);
      setStatus(r.status);
      setResult(r);
      quiz?.report(r); // в инлайн-режиме quiz === null — результат остаётся локальным
    },
    [validate, quiz],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
  }, []);

  return {
    status,
    result,
    answered: status !== 'idle',
    isQuiz: quiz !== null,
    submit,
    reset,
  };
}
