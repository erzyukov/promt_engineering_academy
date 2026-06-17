import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical, ListOrdered } from 'lucide-react';
import { ExerciseShell } from '../core/ExerciseShell';
import { useExercise } from '../core/useExercise';
import { makeResult, orderMatch } from '../core/validators';
import type { ExerciseProps } from '../core/types';
import type { OrderStepsData } from './types';
import './OrderSteps.css';

const TYPE_META = {
  label: 'Расставь по порядку',
  icon: <ListOrdered size={18} />,
  accent: '#2563eb',
};

interface SortableStepProps {
  stepId: string;
  text: string;
  index: number;
  total: number;
  answered: boolean;
  stateClass: string;
  onMove: (index: number, dir: -1 | 1) => void;
}

function SortableStep({
  stepId,
  text,
  index,
  total,
  answered,
  stateClass,
  onMove,
}: SortableStepProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stepId, disabled: answered });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`order-item ${stateClass} ${isDragging ? 'order-item--dragging' : ''}`}
    >
      <span className="order-item__num" aria-hidden="true">
        {index + 1}
      </span>
      {!answered ? (
        <button
          type="button"
          className="order-item__handle"
          aria-label="Перетащить шаг"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>
      ) : (
        <span className="order-item__handle order-item__handle--static" aria-hidden="true">
          <GripVertical size={18} />
        </span>
      )}
      <span className="order-item__text">{text}</span>
      {!answered && (
        <span className="order-item__moves">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            aria-label="Переместить вверх"
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            aria-label="Переместить вниз"
          >
            <ArrowDown size={16} />
          </button>
        </span>
      )}
    </li>
  );
}

export function OrderSteps({ id, data }: ExerciseProps<OrderStepsData>) {
  const [order, setOrder] = useState<string[]>(() => data.steps.map((s) => s.id));

  const textById = useMemo(
    () => Object.fromEntries(data.steps.map((s) => [s.id, s.text])),
    [data.steps],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const validate = useCallback(
    (answer: string[]) => makeResult(id, orderMatch(answer, data.correctOrder)),
    [id, data.correctOrder],
  );

  const { status, answered, isQuiz, result, submit, reset } = useExercise<string[]>({
    id,
    validate,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((prev) =>
        arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id))),
      );
    }
  };

  const onMove = (index: number, dir: -1 | 1) => {
    setOrder((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      return arrayMove(prev, index, target);
    });
  };

  const handleSubmit = () => submit(order);
  const handleReset = () => {
    setOrder(data.steps.map((s) => s.id));
    reset();
  };

  const correctCount = order.filter((sid, i) => sid === data.correctOrder[i]).length;
  const partialNote =
    answered && result?.status === 'partial'
      ? `На верных местах: ${correctCount} из ${data.correctOrder.length}.`
      : undefined;

  return (
    <ExerciseShell
      type={TYPE_META}
      prompt="Расставьте шаги в правильном порядке:"
      status={status}
      canSubmit={true}
      onSubmit={handleSubmit}
      onReset={handleReset}
      isQuiz={isQuiz}
      explanation={data.explanation}
      feedback={partialNote}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="order-list">
            {order.map((sid, i) => {
              const stateClass = answered
                ? sid === data.correctOrder[i]
                  ? 'order-item--correct'
                  : 'order-item--wrong'
                : '';
              return (
                <SortableStep
                  key={sid}
                  stepId={sid}
                  text={textById[sid]}
                  index={i}
                  total={order.length}
                  answered={answered}
                  stateClass={stateClass}
                  onMove={onMove}
                />
              );
            })}
          </ol>
        </SortableContext>
      </DndContext>
    </ExerciseShell>
  );
}
