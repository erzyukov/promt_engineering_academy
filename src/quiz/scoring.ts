import type { ExerciseResult } from '../exercises/core/types';

export interface QuizScore {
  /** Итоговый процент 0..100. */
  pct: number;
  gained: number;
  totalWeight: number;
  /** Номера (1-based) вопросов, отвеченных не полностью верно. */
  wrong: number[];
}

/**
 * Агрегирует результаты теста: процент = Σ(score·maxScore) / Σ(maxScore).
 * Не отвеченные вопросы учитываются как 0 баллов и попадают в wrong.
 */
export function summarizeQuiz(
  order: string[],
  results: Record<string, ExerciseResult>,
): QuizScore {
  let gained = 0;
  let totalWeight = 0;
  const wrong: number[] = [];

  order.forEach((id, i) => {
    const r = results[id];
    const weight = r?.maxScore ?? 1;
    totalWeight += weight;
    gained += r ? r.score * weight : 0;
    if (!r || r.status !== 'correct') wrong.push(i + 1);
  });

  const pct = totalWeight ? Math.round((gained / totalWeight) * 100) : 0;
  return { pct, gained, totalWeight, wrong };
}
