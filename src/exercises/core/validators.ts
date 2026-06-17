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

/** Совпадение порядка: доля элементов, стоящих на своей позиции (OrderSteps). */
export function orderMatch(answer: string[], correct: string[]): number {
  if (correct.length === 0) return 1;
  let hits = 0;
  for (let i = 0; i < correct.length; i++) {
    if (answer[i] === correct[i]) hits++;
  }
  return hits / correct.length;
}

/** Совпадение пар: доля левых элементов с верно сопоставленным правым (MatchPairs). */
export function pairsMatch(
  assignment: Record<string, string | null>,
  correct: Record<string, string>,
): number {
  const keys = Object.keys(correct);
  if (keys.length === 0) return 1;
  let hits = 0;
  for (const key of keys) {
    if (assignment[key] === correct[key]) hits++;
  }
  return hits / keys.length;
}

/** Нормализация текстового ввода: трим, нижний регистр, ё→е, схлопывание пробелов. */
export function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ');
}

/** Совпадение введённого текста с любым из допустимых вариантов (FillTheBlank). */
export function textMatch(answer: string, accept: string[]): number {
  const normalized = normalizeText(answer);
  return accept.some((a) => normalizeText(a) === normalized) ? 1 : 0;
}
