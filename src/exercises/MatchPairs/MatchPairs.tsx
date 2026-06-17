import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Link2 } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { makeResult, pairsMatch } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type { MatchPairsData } from './types';
import './MatchPairs.css';

const TYPE_META = {
  label: 'Соедини пары',
  icon: <Link2 size={18} />,
  accent: '#db2777',
};

type Assignment = Record<string, string | null>;

/** Ставит правый элемент в слот (или в пул при targetLeftId=null), убирая его из прежнего места. */
function place(prev: Assignment, rightId: string, targetLeftId: string | null): Assignment {
  const next: Assignment = { ...prev };
  for (const lid of Object.keys(next)) {
    if (next[lid] === rightId) next[lid] = null;
  }
  if (targetLeftId) next[targetLeftId] = rightId;
  return next;
}

interface ChipProps {
  rightId: string;
  text: string;
  selected: boolean;
  answered: boolean;
  stateClass: string;
  onSelect: (rightId: string) => void;
}

function Chip({ rightId, text, selected, answered, stateClass, onSelect }: ChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: rightId,
    disabled: answered,
  });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 5 }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className={`mp-chip ${selected ? 'mp-chip--selected' : ''} ${stateClass} ${
        isDragging ? 'mp-chip--dragging' : ''
      }`}
      disabled={answered}
      onClick={(e) => {
        e.stopPropagation();
        if (!answered) onSelect(rightId);
      }}
      {...attributes}
      {...listeners}
    >
      {text}
    </button>
  );
}

interface SlotProps {
  leftId: string;
  leftText: string;
  answered: boolean;
  stateClass: string;
  onPlace: (leftId: string) => void;
  children?: ReactNode;
}

function Slot({ leftId, leftText, answered, stateClass, onPlace, children }: SlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${leftId}`, disabled: answered });
  return (
    <div className="mp-row">
      <div className="mp-left">{leftText}</div>
      <div
        ref={setNodeRef}
        className={`mp-slot ${isOver ? 'mp-slot--over' : ''} ${stateClass}`}
        onClick={() => !answered && onPlace(leftId)}
      >
        {children ?? <span className="mp-slot__placeholder">перетащите сюда</span>}
      </div>
    </div>
  );
}

export function MatchPairs({ id, data }: ExerciseProps<MatchPairsData>) {
  const [assignment, setAssignment] = useState<Assignment>(() =>
    Object.fromEntries(data.left.map((l) => [l.id, null])),
  );
  const [picked, setPicked] = useState<string | null>(null);

  const rightById = useMemo(
    () => Object.fromEntries(data.right.map((r) => [r.id, r.text])),
    [data.right],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const validate = useCallback(
    (answer: Assignment) => makeResult(id, pairsMatch(answer, data.correct)),
    [id, data.correct],
  );

  const { status, answered, isQuiz, result, submit, reset } = useExercise<Assignment>({
    id,
    validate,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const rightId = String(active.id);
    const overId = String(over.id);
    if (overId === 'pool') setAssignment((p) => place(p, rightId, null));
    else if (overId.startsWith('slot:'))
      setAssignment((p) => place(p, rightId, overId.slice(5)));
    setPicked(null);
  };

  const selectChip = (rightId: string) =>
    setPicked((p) => (p === rightId ? null : rightId));

  const placeToSlot = (leftId: string) => {
    if (picked) {
      setAssignment((p) => place(p, picked, leftId));
      setPicked(null);
    }
  };

  const placeToPool = () => {
    if (picked) {
      setAssignment((p) => place(p, picked, null));
      setPicked(null);
    }
  };

  const { setNodeRef: poolRef, isOver: poolOver } = useDroppable({
    id: 'pool',
    disabled: answered,
  });

  const assignedRights = new Set(Object.values(assignment).filter(Boolean) as string[]);
  const poolItems = data.right.filter((r) => !assignedRights.has(r.id));
  const allAssigned = data.left.every((l) => assignment[l.id]);

  const handleSubmit = () => {
    if (allAssigned) submit(assignment);
  };
  const handleReset = () => {
    setAssignment(Object.fromEntries(data.left.map((l) => [l.id, null])));
    setPicked(null);
    reset();
  };

  const correctCount = data.left.filter(
    (l) => assignment[l.id] === data.correct[l.id],
  ).length;
  const partialNote =
    answered && result?.status === 'partial'
      ? `Верно соединено: ${correctCount} из ${data.left.length}.`
      : undefined;

  const chipState = (rightId: string, leftId?: string) => {
    if (!answered || !leftId) return '';
    return data.correct[leftId] === rightId ? 'mp-chip--correct' : 'mp-chip--wrong';
  };

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt="Соедините каждый термин с его определением:"
      status={status}
      canSubmit={allAssigned}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
      feedback={partialNote}
    >
      {!answered && (
        <p className="mp-hint">
          Перетащите карточку в слот — или кликните карточку, затем слот.
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="mp-board">
          {data.left.map((l) => {
            const rightId = assignment[l.id];
            const slotState = answered
              ? rightId === data.correct[l.id]
                ? 'mp-slot--correct'
                : 'mp-slot--wrong'
              : '';
            return (
              <Slot
                key={l.id}
                leftId={l.id}
                leftText={l.text}
                answered={answered}
                stateClass={slotState}
                onPlace={placeToSlot}
              >
                {rightId ? (
                  <Chip
                    rightId={rightId}
                    text={rightById[rightId]}
                    selected={picked === rightId}
                    answered={answered}
                    stateClass={chipState(rightId, l.id)}
                    onSelect={selectChip}
                  />
                ) : null}
              </Slot>
            );
          })}
        </div>

        <div
          ref={poolRef}
          className={`mp-pool ${poolOver ? 'mp-pool--over' : ''}`}
          onClick={placeToPool}
        >
          {poolItems.length === 0 ? (
            <span className="mp-pool__empty">все карточки расставлены</span>
          ) : (
            poolItems.map((r) => (
              <Chip
                key={r.id}
                rightId={r.id}
                text={r.text}
                selected={picked === r.id}
                answered={answered}
                stateClass=""
                onSelect={selectChip}
              />
            ))
          )}
        </div>
      </DndContext>
    </ExerciseShell>
  );
}
