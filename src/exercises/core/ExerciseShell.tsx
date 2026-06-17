import type { CSSProperties, ReactNode } from 'react';
import { CheckCircle2, XCircle, CircleDot } from 'lucide-react';
import type { ExerciseStatus, ExerciseTypeMeta, AnsweredStatus } from './types';
import './ExerciseShell.css';

interface ExerciseShellProps {
  type: ExerciseTypeMeta;
  /** Формулировка задания / вопрос. */
  prompt: ReactNode;
  status: ExerciseStatus;
  /** Можно ли нажать «Проверить» (есть ли ответ для проверки). */
  canSubmit: boolean;
  onSubmit: () => void;
  onReset: () => void;
  /** В тест-режиме скрываем «Попробовать снова». */
  isQuiz: boolean;
  /** Объяснение, показывается после ответа. */
  explanation?: ReactNode;
  /** Доп. деталь обратной связи, напр. «3 из 4 пар верно». */
  feedback?: ReactNode;
  /** Интерактивная часть конкретного упражнения. */
  children: ReactNode;
}

const STATUS_LABEL: Record<AnsweredStatus, string> = {
  correct: 'Верно',
  partial: 'Частично',
  incorrect: 'Неверно',
};

function StatusIcon({ status }: { status: AnsweredStatus }) {
  if (status === 'correct') return <CheckCircle2 size={20} aria-hidden="true" />;
  if (status === 'incorrect') return <XCircle size={20} aria-hidden="true" />;
  return <CircleDot size={20} aria-hidden="true" />;
}

export function ExerciseShell({
  type,
  prompt,
  status,
  canSubmit,
  onSubmit,
  onReset,
  isQuiz,
  explanation,
  feedback,
  children,
}: ExerciseShellProps) {
  const answered = status !== 'idle';
  const accentStyle = type.accent
    ? ({ ['--exercise-accent']: type.accent } as CSSProperties)
    : undefined;

  return (
    <section className="exercise" data-status={status} style={accentStyle}>
      <header className="exercise__head">
        <span className="exercise__icon" aria-hidden="true">
          {type.icon}
        </span>
        <span className="exercise__type">{type.label}</span>
      </header>

      <div className="exercise__prompt">{prompt}</div>

      <div className="exercise__body">{children}</div>

      {!answered ? (
        <div className="exercise__footer">
          <button
            type="button"
            className="btn btn--primary"
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            Проверить
          </button>
        </div>
      ) : (
        <div
          className={`feedback feedback--${status}`}
          role="status"
          aria-live="polite"
        >
          <div className="feedback__head">
            <StatusIcon status={status as AnsweredStatus} />
            <span>{STATUS_LABEL[status as AnsweredStatus]}</span>
          </div>
          {feedback && <div className="feedback__detail">{feedback}</div>}
          {explanation && <div className="feedback__explanation">{explanation}</div>}
          {!isQuiz && (
            <button type="button" className="btn btn--ghost" onClick={onReset}>
              Попробовать снова
            </button>
          )}
        </div>
      )}
    </section>
  );
}
