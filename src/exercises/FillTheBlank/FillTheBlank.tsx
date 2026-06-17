import { useCallback, useMemo, useState } from 'react';
import { TextCursorInput } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { makeResult, textMatch } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type { FillTheBlankData } from './types';
import './FillTheBlank.css';

const TYPE_META = {
  label: 'Заполни пропуск',
  icon: <TextCursorInput size={18} />,
  accent: '#7c3aed',
};

const MARKER = /\{\{(\d+)\}\}/;
const MARKER_SPLIT = /(\{\{\d+\}\})/g;

export function FillTheBlank({ id, data }: ExerciseProps<FillTheBlankData>) {
  const [values, setValues] = useState<string[]>(() =>
    data.blanks.map(() => ''),
  );

  const segments = useMemo(() => data.template.split(MARKER_SPLIT), [data.template]);

  const perBlankScore = useCallback(
    (vals: string[]) => data.blanks.map((b, i) => textMatch(vals[i] ?? '', b.accept)),
    [data.blanks],
  );

  const validate = useCallback(
    (answer: string[]) => {
      const scores = perBlankScore(answer);
      const avg = scores.reduce((s, x) => s + x, 0) / (scores.length || 1);
      return makeResult(id, avg);
    },
    [id, perBlankScore],
  );

  const { status, answered, isQuiz, submit, reset } = useExercise<string[]>({
    id,
    validate,
  });

  const setValue = (index: number, v: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
  };

  const allFilled = values.every((v) => v.trim().length > 0);
  const scores = answered ? perBlankScore(values) : [];

  const handleSubmit = () => {
    if (allFilled) submit(values);
  };
  const handleReset = () => {
    setValues(data.blanks.map(() => ''));
    reset();
  };

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt="Заполните пропуски:"
      status={status}
      canSubmit={allFilled}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
    >
      <p className="ftb-text">
        {segments.map((seg, i) => {
          const m = seg.match(MARKER);
          if (!m) return <span key={i}>{seg}</span>;
          const index = Number(m[1]);
          const correct = scores[index] === 1;
          const stateClass = answered
            ? correct
              ? 'ftb-input--correct'
              : 'ftb-input--wrong'
            : '';
          return (
            <span key={i} className="ftb-blank">
              <input
                type="text"
                className={`ftb-input ${stateClass}`}
                value={values[index] ?? ''}
                size={Math.max(8, (values[index]?.length ?? 0) + 1)}
                disabled={answered}
                aria-label={`Пропуск ${index + 1}`}
                onChange={(e) => setValue(index, e.target.value)}
              />
              {answered && !correct && (
                <span className="ftb-correction">
                  → {data.blanks[index].accept[0]}
                </span>
              )}
            </span>
          );
        })}
      </p>
    </ExerciseShell>
  );
}
