import { useCallback, useState } from 'react';
import { Plus, TrendingUp, X } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { makeResult, setMatch } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type {
  LadderResponse,
  PromptElement,
  PromptRefinementLadderData,
} from './types';
import './PromptRefinementLadder.css';

const TYPE_META = {
  label: 'Лестница улучшения',
  icon: <TrendingUp size={18} />,
  accent: '#f59e0b',
};

/**
 * Выбирает заготовленный ответ по числу применённых удачных улучшений: берём
 * самый «продвинутый» ответ, чей размер набора не превышает применённого.
 * Так каждый удачный шаг меняет ответ независимо от порядка добавления.
 */
function pickResponse(responses: LadderResponse[], optimalApplied: number): string {
  let best: LadderResponse | null = null;
  for (const r of responses) {
    if (r.whenElements.length <= optimalApplied) {
      if (!best || r.whenElements.length > best.whenElements.length) best = r;
    }
  }
  return best?.text ?? responses[0]?.text ?? '';
}

export function PromptRefinementLadder({
  id,
  data,
}: ExerciseProps<PromptRefinementLadderData>) {
  const [applied, setApplied] = useState<string[]>([]);

  const appliedRungs = applied
    .map((rid) => data.rungs.find((r) => r.id === rid))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  const appliedElements = new Set<PromptElement>(appliedRungs.map((r) => r.element));
  const availableRungs = data.rungs.filter((r) => !applied.includes(r.id));

  const validate = useCallback(
    (answer: PromptElement[]) => makeResult(id, setMatch(answer, data.optimalSet)),
    [id, data.optimalSet],
  );

  const { status, answered, isQuiz, result, submit, reset } = useExercise<PromptElement[]>(
    { id, validate },
  );

  const addRung = (rid: string) => setApplied((p) => [...p, rid]);
  const removeRung = (rid: string) => setApplied((p) => p.filter((x) => x !== rid));

  const handleSubmit = () => {
    if (applied.length > 0) submit([...appliedElements]);
  };
  const handleReset = () => {
    setApplied([]);
    reset();
  };

  const goodCount = [...appliedElements].filter((e) => data.optimalSet.includes(e)).length;
  const response = pickResponse(data.responses, goodCount);
  const partialNote =
    answered && result?.status === 'partial'
      ? `Удачных улучшений: ${goodCount} из ${data.optimalSet.length}.`
      : undefined;

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt={`Улучшайте промпт по одной ступени и смотрите, как меняется ответ. Задача: ${data.task}`}
      status={status}
      canSubmit={applied.length > 0}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
      feedback={partialNote}
    >
      <div className="prl-grid">
        <div className="prl-col">
          <div className="prl-col__title">Промпт</div>
          <div className="prl-prompt">
            <span className="prl-prompt__base">{data.basePrompt}</span>
            {appliedRungs.map((r) => (
              <span key={r.id} className="prl-chip">
                {r.addsText}
                {!answered && (
                  <button
                    type="button"
                    className="prl-chip__remove"
                    aria-label="Убрать улучшение"
                    onClick={() => removeRung(r.id)}
                  >
                    <X size={13} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="prl-col">
          <div className="prl-col__title">Ответ AI</div>
          <div className="prl-response">{response}</div>
        </div>
      </div>

      {!answered && availableRungs.length > 0 && (
        <div className="prl-rungs">
          <div className="prl-rungs__title">Добавить улучшение:</div>
          <div className="prl-rungs__list">
            {availableRungs.map((r) => (
              <button
                key={r.id}
                type="button"
                className="prl-rung"
                onClick={() => addRung(r.id)}
              >
                <Plus size={15} /> {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </ExerciseShell>
  );
}
