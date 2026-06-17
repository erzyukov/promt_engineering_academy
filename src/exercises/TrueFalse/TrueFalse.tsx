import { useCallback, useState } from 'react';
import { ToggleLeft } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { exactMatch, makeResult } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type { TrueFalseData } from './types';
import './TrueFalse.css';

const TYPE_META = {
  label: 'Верно или неверно',
  icon: <ToggleLeft size={18} />,
  accent: '#0d9488',
};

export function TrueFalse({ id, data }: ExerciseProps<TrueFalseData>) {
  const [selected, setSelected] = useState<boolean | null>(null);

  const validate = useCallback(
    (answer: boolean) => makeResult(id, exactMatch(answer, data.answer)),
    [id, data.answer],
  );

  const { status, answered, isQuiz, submit, reset } = useExercise<boolean>({
    id,
    validate,
  });

  const handleSubmit = () => {
    if (selected !== null) submit(selected);
  };
  const handleReset = () => {
    setSelected(null);
    reset();
  };

  const options: { value: boolean; label: string }[] = [
    { value: true, label: 'Верно' },
    { value: false, label: 'Неверно' },
  ];

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt={data.statement}
      status={status}
      canSubmit={selected !== null}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
    >
      <div className="tf-options" role="radiogroup" aria-label={data.statement}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          const isCorrect = opt.value === data.answer;

          let stateClass = '';
          if (answered) {
            if (isCorrect) stateClass = 'tf-option--correct';
            else if (isSelected) stateClass = 'tf-option--wrong';
          } else if (isSelected) {
            stateClass = 'tf-option--selected';
          }

          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`tf-option ${stateClass}`}
              disabled={answered}
              onClick={() => setSelected(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </ExerciseShell>
  );
}
