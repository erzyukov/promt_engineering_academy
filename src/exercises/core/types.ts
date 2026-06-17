import type { ReactNode } from 'react';

/** Статус ответа после проверки (idle = ещё не отвечали). */
export type AnsweredStatus = 'correct' | 'partial' | 'incorrect';
export type ExerciseStatus = 'idle' | AnsweredStatus;

/** Единый результат проверки — общий для всех типов упражнений. */
export interface ExerciseResult {
  id: string;
  status: AnsweredStatus;
  /** Нормализованный балл 0..1 (для частичной правильности). */
  score: number;
  /** Вес упражнения в тесте. По умолчанию 1. */
  maxScore: number;
}

export type ExerciseMode = 'inline' | 'quiz';

/** Общие пропсы, которые принимает любое упражнение. */
export interface ExerciseProps<TData> {
  id: string;
  data: TData;
  /** Явно задать режим. По умолчанию выводится из наличия QuizContext. */
  mode?: ExerciseMode;
}

/** Метаданные типа упражнения для шапки ExerciseShell. */
export interface ExerciseTypeMeta {
  /** Человекочитаемое название типа, напр. «Выбор ответа». */
  label: string;
  /** Иконка типа (обычно из lucide-react). */
  icon: ReactNode;
  /** Акцентный цвет типа (CSS-значение), задаёт --exercise-accent. */
  accent?: string;
}
