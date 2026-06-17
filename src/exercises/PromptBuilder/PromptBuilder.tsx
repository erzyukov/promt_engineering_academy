import { useCallback, useState } from 'react';
import { Blocks } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { checklistScore, makeResult } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type { PromptBuilderData } from './types';
import './PromptBuilder.css';

const TYPE_META = {
  label: 'Собери промпт',
  icon: <Blocks size={18} />,
  accent: '#c026d3',
};

type Chosen = Record<string, string | null>;

export function PromptBuilder({ id, data }: ExerciseProps<PromptBuilderData>) {
  const [chosen, setChosen] = useState<Chosen>(() =>
    Object.fromEntries(data.slots.map((s) => [s.id, null])),
  );

  const optionById = (slotId: string, optId: string | null) =>
    data.slots.find((s) => s.id === slotId)?.options.find((o) => o.id === optId);

  const goodFlags = useCallback(
    (c: Chosen) => data.slots.map((s) => optionById(s.id, c[s.id])?.good ?? false),
    [data.slots],
  );

  const validate = useCallback(
    (answer: Chosen) => makeResult(id, checklistScore(goodFlags(answer))),
    [id, goodFlags],
  );

  const { status, answered, isQuiz, result, submit, reset } = useExercise<Chosen>({
    id,
    validate,
  });

  const allChosen = data.slots.every((s) => chosen[s.id]);

  const handleSubmit = () => {
    if (allChosen) submit(chosen);
  };
  const handleReset = () => {
    setChosen(Object.fromEntries(data.slots.map((s) => [s.id, null])));
    reset();
  };

  const goodCount = goodFlags(chosen).filter(Boolean).length;
  const partialNote =
    answered && result?.status === 'partial'
      ? `Удачных блоков: ${goodCount} из ${data.slots.length}.`
      : undefined;

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt={`Соберите промпт из блоков. Задача: ${data.task}`}
      status={status}
      canSubmit={allChosen}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
      feedback={partialNote}
    >
      <div className="pb-slots">
        {data.slots.map((slot) => (
          <div key={slot.id} className="pb-slot">
            <div className="pb-slot__label">{slot.label}</div>
            <div className="pb-slot__options">
              {slot.options.map((opt) => {
                const isChosen = chosen[slot.id] === opt.id;
                let stateClass = '';
                if (answered) {
                  if (isChosen) stateClass = opt.good ? 'pb-opt--good' : 'pb-opt--bad';
                  else if (opt.good) stateClass = 'pb-opt--hint';
                } else if (isChosen) {
                  stateClass = 'pb-opt--chosen';
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`pb-opt ${stateClass}`}
                    disabled={answered}
                    onClick={() => setChosen((p) => ({ ...p, [slot.id]: opt.id }))}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pb-preview">
        <div className="pb-preview__title">Собранный промпт</div>
        {data.slots.map((slot) => {
          const opt = optionById(slot.id, chosen[slot.id]);
          return (
            <p key={slot.id} className="pb-preview__line">
              <span className="pb-preview__tag">{slot.label}</span>
              <span className={opt ? '' : 'pb-preview__empty'}>
                {opt ? opt.text : '—'}
              </span>
            </p>
          );
        })}
      </div>
    </ExerciseShell>
  );
}
