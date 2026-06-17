import type { AnsweredStatus, ExerciseResult } from './types';

/** Выводит статус из нормализованного балла. */
export function statusFromScore(score: number): AnsweredStatus {
  if (score >= 1) return 'correct';
  if (score <= 0) return 'incorrect';
  return 'partial';
}

/** Собирает ExerciseResult, ограничивая балл диапазоном 0..1. */
export function makeResult(id: string, score: number, maxScore = 1): ExerciseResult {
  const clamped = Math.max(0, Math.min(1, score));
  return { id, score: clamped, maxScore, status: statusFromScore(clamped) };
}

/** Точное совпадение одного значения (single-выбор, true/false, ввод). */
export function exactMatch<T>(answer: T, correct: T): number {
  return answer === correct ? 1 : 0;
}

/**
 * Множественный выбор. Балл = (верные − лишние) / число верных, не ниже 0.
 * Полностью верный набор без лишнего → 1; каждый промах или лишний выбор снижает балл.
 */
export function setMatch(answer: string[], correct: string[]): number {
  if (correct.length === 0) return answer.length === 0 ? 1 : 0;
  const correctSet = new Set(correct);
  const picked = new Set(answer);
  let hits = 0;
  let extras = 0;
  for (const a of picked) {
    if (correctSet.has(a)) hits++;
    else extras++;
  }
  return Math.max(0, (hits - extras) / correct.length);
}
