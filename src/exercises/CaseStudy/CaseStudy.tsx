import { useCallback, useState } from 'react';
import { Check, Circle, PenLine } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { checklistScore, makeResult, normalizeText } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type { CaseCriterion, CaseStudyData } from './types';
import './CaseStudy.css';

const TYPE_META = {
  label: 'Улучши промпт',
  icon: <PenLine size={18} />,
  accent: '#0891b2',
};

function isMet(c: CaseCriterion, text: string): boolean {
  if (c.regex && new RegExp(c.regex, 'i').test(text)) return true;
  const norm = normalizeText(text);
  if (c.anyOf && c.anyOf.some((k) => norm.includes(normalizeText(k)))) return true;
  return false;
}

export function CaseStudy({ id, data }: ExerciseProps<CaseStudyData>) {
  const [text, setText] = useState(data.weakPrompt);

  const flags = useCallback(
    (t: string) => data.criteria.map((c) => isMet(c, t)),
    [data.criteria],
  );

  const validate = useCallback(
    (answer: string) => makeResult(id, checklistScore(flags(answer))),
    [id, flags],
  );

  const { status, answered, isQuiz, result, submit, reset } = useExercise<string>({
    id,
    validate,
  });

  const liveFlags = flags(text);
  const metCount = liveFlags.filter(Boolean).length;

  const handleSubmit = () => {
    if (text.trim().length > 0) submit(text);
  };
  const handleReset = () => {
    setText(data.weakPrompt);
    reset();
  };

  const partialNote =
    answered && result
      ? `Выполнено критериев: ${metCount} из ${data.criteria.length}.`
      : undefined;

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt={`Перепишите промпт так, чтобы он решал задачу: ${data.brief}`}
      status={status}
      canSubmit={text.trim().length > 0}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
      feedback={partialNote}
    >
      <textarea
        className="cs-input"
        value={text}
        disabled={answered}
        rows={5}
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        aria-label="Ваш улучшенный промпт"
      />

      <ul className="cs-checklist">
        {data.criteria.map((c, i) => (
          <li
            key={c.id}
            className={`cs-criterion ${liveFlags[i] ? 'cs-criterion--met' : ''}`}
          >
            {liveFlags[i] ? <Check size={16} /> : <Circle size={16} />}
            <span>{c.label}</span>
          </li>
        ))}
      </ul>

      {answered && (
        <div className="cs-reference">
          <div className="cs-reference__title">Пример сильного промпта</div>
          <p className="cs-reference__text">{data.referenceGood}</p>
        </div>
      )}
    </ExerciseShell>
  );
}
