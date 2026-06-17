import { useCallback, useState } from 'react';
import { ListChecks } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { exactMatch, makeResult } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type { MultipleChoiceData } from './types';
import './MultipleChoice.css';

const TYPE_META = {
  label: 'Выбор ответа',
  icon: <ListChecks size={18} />,
  accent: '#4f46e5',
};

export function MultipleChoice({ id, data }: ExerciseProps<MultipleChoiceData>) {
  const [selected, setSelected] = useState<string | null>(null);
  const correctId = data.correct[0];

  const validate = useCallback(
    (answer: string) => makeResult(id, exactMatch(answer, correctId)),
    [id, correctId],
  );

  const { status, answered, isQuiz, submit, reset } = useExercise<string>({
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

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt={data.question}
      status={status}
      canSubmit={selected !== null}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
    >
      <ul className="mc-options" role="radiogroup" aria-label={data.question}>
        {data.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = opt.id === correctId;

          let stateClass = '';
          if (answered) {
            if (isCorrect) stateClass = 'mc-option--correct';
            else if (isSelected) stateClass = 'mc-option--wrong';
          } else if (isSelected) {
            stateClass = 'mc-option--selected';
          }

          return (
            <li key={opt.id}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`mc-option ${stateClass}`}
                disabled={answered}
                onClick={() => setSelected(opt.id)}
              >
                <span className="mc-option__marker" aria-hidden="true" />
                <span className="mc-option__text">{opt.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </ExerciseShell>
  );
}
