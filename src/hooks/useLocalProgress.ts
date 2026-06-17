import { useEffect, useState } from 'react';

const KEY = 'pea:progress:v1';
const EVENT = 'pea:progress';

export interface QuizProgress {
  /** Лучший результат по тесту, %. */
  pct: number;
  /** Время последнего прохождения (epoch ms). */
  at: number;
}

export type Progress = Record<string, QuizProgress>;

function read(): Progress {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Progress;
  } catch {
    return {};
  }
}

/** Сохраняет результат теста (хранится лучший) и оповещает подписчиков. */
export function saveQuizScore(quizId: string, pct: number): void {
  const progress = read();
  const prev = progress[quizId];
  if (!prev || pct >= prev.pct) {
    progress[quizId] = { pct, at: Date.now() };
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      // приватный режим / переполнение — молча игнорируем
    }
    window.dispatchEvent(new CustomEvent(EVENT));
  }
}

/** Реактивно отдаёт весь прогресс; обновляется при сохранении и из других вкладок. */
export function useProgress(): Progress {
  const [progress, setProgress] = useState<Progress>(read);

  useEffect(() => {
    const update = () => setProgress(read());
    window.addEventListener(EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return progress;
}
