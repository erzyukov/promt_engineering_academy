import { useCallback, useState } from 'react';
import { ScanSearch } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { makeResult, setMatch } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type { SpotTheHallucinationData } from './types';
import './SpotTheHallucination.css';

const TYPE_META = {
  label: 'Найди галлюцинацию',
  icon: <ScanSearch size={18} />,
  accent: '#e11d48',
};

export function SpotTheHallucination({
  id,
  data,
}: ExerciseProps<SpotTheHallucinationData>) {
  const [selected, setSelected] = useState<string[]>([]);
  const hallucinationSet = new Set(data.hallucinationIds);

  const validate = useCallback(
    (answer: string[]) => makeResult(id, setMatch(answer, data.hallucinationIds)),
    [id, data.hallucinationIds],
  );

  const { status, answered, isQuiz, result, submit, reset } = useExercise<string[]>({
    id,
    validate,
  });

  const toggle = (spanId: string) => {
    setSelected((prev) =>
      prev.includes(spanId) ? prev.filter((x) => x !== spanId) : [...prev, spanId],
    );
  };

  const handleSubmit = () => {
    if (selected.length > 0) submit(selected);
  };
  const handleReset = () => {
    setSelected([]);
    reset();
  };

  const found = selected.filter((s) => hallucinationSet.has(s)).length;
  const partialNote =
    answered && result?.status === 'partial'
      ? `Найдено выдумок: ${found} из ${data.hallucinationIds.length}.`
      : undefined;

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt="Отметьте фрагменты, которые похожи на выдумку:"
      status={status}
      canSubmit={selected.length > 0}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
      feedback={partialNote}
    >
      {data.intro && <p className="spot-intro">{data.intro}</p>}
      <p className="spot-text">
        {data.spans.map((span, i) => {
          const isSelected = selected.includes(span.id);
          const isHall = hallucinationSet.has(span.id);

          let stateClass = '';
          if (answered) {
            if (isSelected && isHall) stateClass = 'spot-span--correct';
            else if (isSelected && !isHall) stateClass = 'spot-span--wrong';
            else if (!isSelected && isHall) stateClass = 'spot-span--missed';
          } else if (isSelected) {
            stateClass = 'spot-span--selected';
          }

          return (
            <span key={span.id}>
              {i > 0 && ' '}
              <button
                type="button"
                className={`spot-span ${stateClass}`}
                disabled={answered}
                aria-pressed={isSelected}
                onClick={() => toggle(span.id)}
              >
                {span.text}
              </button>
            </span>
          );
        })}
      </p>
    </ExerciseShell>
  );
}
