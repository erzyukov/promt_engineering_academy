import { useCallback, useState } from 'react';
import { ListChecks } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { makeResult, setMatch } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type { MultipleChoiceData } from './types';
import './MultipleChoice.css';

const TYPE_META = {
  label: 'Выбор ответа',
  icon: <ListChecks size={18} />,
  accent: '#4f46e5',
};

export function MultipleChoice({ id, data }: ExerciseProps<MultipleChoiceData>) {
  const isMulti = data.correct.length > 1;
  const [selected, setSelected] = useState<string[]>([]);
  const correctSet = new Set(data.correct);

  const validate = useCallback(
    (answer: string[]) => makeResult(id, setMatch(answer, data.correct)),
    [id, data.correct],
  );

  const { status, answered, isQuiz, result, submit, reset } = useExercise<string[]>({
    id,
    validate,
  });

  const toggle = (optId: string) => {
    setSelected((prev) => {
      if (isMulti) {
        return prev.includes(optId)
          ? prev.filter((x) => x !== optId)
          : [...prev, optId];
      }
      return [optId];
    });
  };

  const handleSubmit = () => {
    if (selected.length > 0) submit(selected);
  };
  const handleReset = () => {
    setSelected([]);
    reset();
  };

  const partialNote =
    answered && result?.status === 'partial'
      ? `Засчитано частично: верных отмечено ${selected.filter((s) => correctSet.has(s)).length} из ${data.correct.length}.`
      : undefined;

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt={data.question}
      status={status}
      canSubmit={selected.length > 0}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
      feedback={partialNote}
    >
      {isMulti && (
        <p className="mc-hint">Выберите все подходящие варианты.</p>
      )}
      <ul
        className={`mc-options ${isMulti ? 'mc-options--multi' : ''}`}
        role={isMulti ? 'group' : 'radiogroup'}
        aria-label={data.question}
      >
        {data.options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const isCorrect = correctSet.has(opt.id);

          let stateClass = '';
          if (answered) {
            if (isCorrect && isSelected) stateClass = 'mc-option--correct';
            else if (isCorrect && !isSelected) stateClass = 'mc-option--missed';
            else if (!isCorrect && isSelected) stateClass = 'mc-option--wrong';
          } else if (isSelected) {
            stateClass = 'mc-option--selected';
          }

          return (
            <li key={opt.id}>
              <button
                type="button"
                role={isMulti ? 'checkbox' : 'radio'}
                aria-checked={isSelected}
                className={`mc-option ${stateClass}`}
                disabled={answered}
                onClick={() => toggle(opt.id)}
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
