import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { QuizContext, type QuizContextValue } from '../exercises/core/QuizContext';
import type { ExerciseResult } from '../exercises/core/types';
import { ProgressBar } from './ProgressBar';
import { QuizSummary } from './QuizSummary';
import './Quiz.css';

interface QuizProps {
  id: string;
  title?: string;
  children: ReactNode;
}

/**
 * Тест-режим: оборачивает последовательность упражнений. Сами упражнения
 * не меняются — они регистрируются и шлют результаты через QuizContext.
 */
export function Quiz({ title, children }: QuizProps) {
  const [order, setOrder] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, ExerciseResult>>({});
  const [finished, setFinished] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const register = useCallback((exId: string) => {
    setOrder((prev) => (prev.includes(exId) ? prev : [...prev, exId]));
  }, []);

  const unregister = useCallback((exId: string) => {
    setOrder((prev) => prev.filter((x) => x !== exId));
    setResults((prev) => {
      if (!(exId in prev)) return prev;
      const next = { ...prev };
      delete next[exId];
      return next;
    });
  }, []);

  const report = useCallback((r: ExerciseResult) => {
    setResults((prev) => ({ ...prev, [r.id]: r }));
  }, []);

  const ctx = useMemo<QuizContextValue>(
    () => ({ register, unregister, report }),
    [register, unregister, report],
  );

  const answeredCount = order.filter((id) => results[id]).length;
  const total = order.length;
  const allAnswered = total > 0 && answeredCount === total;

  const handleRetry = () => {
    setResults({});
    setOrder([]);
    setFinished(false);
    setAttempt((a) => a + 1);
  };

  return (
    <QuizContext.Provider value={ctx}>
      <section className="quiz">
        <header className="quiz__head">
          {title && <h3 className="quiz__title">{title}</h3>}
          <ProgressBar answered={answeredCount} total={total} />
        </header>

        {/* key=attempt — «Пройти заново» перемонтирует упражнения и сбрасывает их состояние */}
        <div className="quiz__body" key={attempt}>
          {children}
        </div>

        {allAnswered && !finished && (
          <button
            type="button"
            className="btn btn--primary quiz__finish"
            onClick={() => setFinished(true)}
          >
            Показать результат
          </button>
        )}

        {finished && (
          <QuizSummary order={order} results={results} onRetry={handleRetry} />
        )}
      </section>
    </QuizContext.Provider>
  );
}
