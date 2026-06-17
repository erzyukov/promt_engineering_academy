import { CheckCircle2, CircleDot, RotateCcw, XCircle } from 'lucide-react';
import type { AnsweredStatus, ExerciseResult } from '../exercises/core/types';
import { summarizeQuiz } from './scoring';

interface QuizSummaryProps {
  order: string[];
  results: Record<string, ExerciseResult>;
  onRetry: () => void;
}

const STATUS_ICON: Record<AnsweredStatus, typeof CheckCircle2> = {
  correct: CheckCircle2,
  partial: CircleDot,
  incorrect: XCircle,
};

export function QuizSummary({ order, results, onRetry }: QuizSummaryProps) {
  const items = order.map((id, i) => ({ n: i + 1, r: results[id] }));
  const { pct, wrong } = summarizeQuiz(order, results);

  let verdict: string;
  let tone: AnsweredStatus;
  if (pct >= 80) {
    verdict = 'Отличный результат — материал усвоен!';
    tone = 'correct';
  } else if (pct >= 50) {
    verdict = 'Неплохо, но часть материала стоит перечитать.';
    tone = 'partial';
  } else {
    verdict = 'Стоит вернуться к статье и пройти тест ещё раз.';
    tone = 'incorrect';
  }

  return (
    <div className={`quiz-summary quiz-summary--${tone}`}>
      <div className="quiz-summary__score">{pct}%</div>
      <p className="quiz-summary__verdict">{verdict}</p>

      <ul className="quiz-summary__list">
        {items.map(({ n, r }) => {
          const status = (r?.status ?? 'incorrect') as AnsweredStatus;
          const Icon = STATUS_ICON[status];
          return (
            <li key={n} className={`quiz-summary__item quiz-summary__item--${status}`}>
              <Icon size={18} aria-hidden="true" />
              <span>Вопрос {n}</span>
              {status === 'partial' && r && (
                <span className="quiz-summary__partial">
                  {Math.round(r.score * 100)}%
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {wrong.length > 0 && (
        <p className="quiz-summary__hint">
          Стоит повторить вопросы: {wrong.join(', ')}.
        </p>
      )}

      <button type="button" className="btn btn--ghost" onClick={onRetry}>
        <RotateCcw size={16} /> Пройти заново
      </button>
    </div>
  );
}
