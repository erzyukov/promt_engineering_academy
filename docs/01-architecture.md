# 01. Архитектура

## Принципы

1. **Один контракт для всех упражнений.** Любой компонент-упражнение принимает данные одной формы и сообщает результат одной формы. Это позволяет тест-режиму работать с любым компонентом единообразно.
2. **Композиция вместо наследования.** В React нет «базового класса» — общую логику выносим в хук `useExercise` и обёртку `ExerciseShell`, а конкретные компоненты отвечают только за свой UI и правило проверки.
3. **Режим — это контекст, а не другой компонент.** Один и тот же `MultipleChoice` работает и в тексте статьи, и внутри теста. Разница — лишь в том, обёрнут ли он в `QuizProvider`.
4. **Проверка — чистая функция.** `validate(answer, data) → result`. Никаких сайд-эффектов, легко тестировать, работает офлайн.

---

## Модель компонента упражнения

### Базовые типы (`src/exercises/core/types.ts`)

```ts
// Статус ответа
export type ExerciseStatus = 'idle' | 'correct' | 'partial' | 'incorrect';

// Результат проверки — единый для всех типов упражнений
export interface ExerciseResult {
  id: string;
  status: ExerciseStatus;
  score: number;      // нормализованный балл 0..1 (для частичной правильности)
  maxScore: number;   // обычно 1; вес упражнения в тесте можно поднять
}

// Общие пропсы любого упражнения
export interface ExerciseProps<TData> {
  id: string;
  data: TData;
  // необязательно: явно задать режим. По умолчанию определяется наличием QuizContext
  mode?: 'inline' | 'quiz';
}
```

Каждый конкретный тип данных расширяет общий паттерн, например:

```ts
export interface MultipleChoiceData {
  question: string;
  options: { id: string; text: string }[];
  correct: string[];          // один id = single-select, несколько = multi-select
  explanation?: string;       // показывается после ответа
}
```

### Машина состояний

```
        ┌─────────┐  выбор ответа   ┌──────────┐  «Проверить»   ┌──────────────────────────┐
        │  idle   │ ───────────────▶│ answered │ ──────────────▶│ correct / partial /       │
        │(не отв.)│                 │(готов)   │   validate()   │ incorrect (показ feedback)│
        └─────────┘                 └──────────┘                └──────────────────────────┘
                                                                         │
                                                                  «Попробовать снова»
                                                                  (только в инлайн-режиме) │
                                                                         ▼
                                                                       idle
```

- В **инлайн-режиме** после ответа доступна кнопка «Попробовать снова» (сброс в `idle`).
- В **тест-режиме** ответ фиксируется и уходит в общий подсчёт; повтор — только если тест это разрешает.

---

## Базовый слой

### `useExercise` — общий хук (`src/exercises/core/useExercise.ts`)

Сердце системы. Инкапсулирует состояние и связь с тест-режимом, чтобы конкретные компоненты были максимально тонкими.

```ts
function useExercise<TAnswer>(params: {
  id: string;
  validate: (answer: TAnswer) => ExerciseResult;  // правило проверки конкретного типа
}) {
  const quiz = useContext(QuizContext);   // null в инлайн-режиме
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const [result, setResult] = useState<ExerciseResult | null>(null);

  function submit(answer: TAnswer) {
    const r = params.validate(answer);
    setStatus(r.status);
    setResult(r);
    quiz?.report(r);          // в тест-режиме — отдаём результат наверх
  }

  function reset() { setStatus('idle'); setResult(null); }

  return { status, result, submit, reset, isQuiz: quiz !== null };
}
```

### `ExerciseShell` — общая обёртка (`src/exercises/core/ExerciseShell.tsx`)

Единый визуальный «корпус» упражнения: заголовок/иконка типа, слот для интерактивной части, кнопка «Проверить», блок обратной связи. Гарантирует единый вид и UX у всех типов.

```
┌─ ExerciseShell ─────────────────────────────┐
│ [иконка типа]  Вопрос / формулировка          │
│ ┌─────────────────────────────────────────┐  │
│ │  {children} — UI конкретного упражнения  │  │
│ └─────────────────────────────────────────┘  │
│ [ Проверить ]                                  │
│ ┌─ feedback (после ответа) ────────────────┐  │
│ │ ✓ Верно  /  ✗ Неверно  /  ◐ Частично     │  │
│ │ Объяснение: …                            │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### `validators.ts` — переиспользуемые правила проверки

Набор чистых функций, из которых собираются `validate` конкретных компонентов:
- `exactMatch(answer, correct)` — точное совпадение (TrueFalse, single MultipleChoice, FillTheBlank).
- `setMatch(answer[], correct[])` — частичный балл = доля верных при отсутствии лишних (multi MultipleChoice).
- `orderMatch(answer[], correct[])` — доля позиций, стоящих на своём месте (OrderSteps).
- `pairsMatch(answer, correct)` — доля верно соединённых пар (MatchPairs).
- `checklistScore(text, criteria[])` — эвристика: сколько критериев выполнено (CaseStudy, PromptBuilder).

---

## Два режима работы

### Инлайн-режим
Компонент стоит прямо в тексте статьи (MDX). Полностью автономен: сам хранит состояние, сам показывает обратную связь. Общего счёта нет. `QuizContext === null`.

```mdx
Токен — это не слово, а кусочек слова. Проверим:

<MultipleChoice id="q-token-1" data={tokenQuestion} />

Идём дальше…
```

### Тест-режим
Несколько упражнений обёрнуты в `<Quiz>`. Тот через `QuizProvider` раздаёт `QuizContext`, собирает результаты, считает баллы и навигацию.

```mdx
<Quiz id="final-llm" title="Итоговый тест по статье">
  <MultipleChoice id="f1" data={q1} />
  <MatchPairs    id="f2" data={q2} />
  <OrderSteps    id="f3" data={q3} />
</Quiz>
```

### Как один компонент работает в обоих режимах
Компонент **не знает**, в каком он режиме. Он всегда зовёт `submit(answer)` из `useExercise`. Хук сам решает:
- есть `QuizContext` → результат уходит в `quiz.report()` (тест-режим);
- нет контекста → результат остаётся локальным, рисуется только своя обратная связь (инлайн).

Это и есть ответ на «как передавать результаты»: **React Context** для тест-режима, ничего — для инлайна. Не нужны ни глобальный event bus, ни проп-дриллинг.

---

## Система оценки

- Каждое упражнение возвращает **нормализованный балл `score` ∈ [0;1]** и `maxScore` (вес).
- **Частичная правильность** поддерживается там, где осмысленна:
  - `MatchPairs` — 3 из 4 пар = `0.75`;
  - `OrderSteps` — доля шагов на верных позициях;
  - `MultipleChoice` (multi) — доля верно отмеченных без штрафных лишних (лишний выбор → 0 за пункт).
  - `TrueFalse`, `FillTheBlank`, single `MultipleChoice` — бинарно (0 или 1).
- Статус для UI выводится из балла: `1 → correct`, `0 → incorrect`, иначе `partial`.
- **Агрегация в тесте:** `Σ(score·maxScore) / Σ(maxScore)` → процент. Итог + разбивка по вопросам в `QuizSummary`.

> Базовое требование («верно/неверно после ответа») закрывается статусом. Частичный балл — это надстройка, которая включается там, где она уместна, и не усложняет простые типы.

---

## UX обратной связи

| Состояние | Цвет/иконка | Что показываем |
|---|---|---|
| `idle` | нейтральный | только вопрос и интерактив |
| `correct` | зелёный ✓ | «Верно» + объяснение (почему это правильный ответ) |
| `partial` | янтарный ◐ | «Частично: X из Y» + что именно не так |
| `incorrect` | красный ✗ | «Неверно» + объяснение + (в инлайне) «Попробовать снова» |

Принципы: обратная связь **немедленная** (после «Проверить»), **объясняющая** (не просто «неверно», а почему), **неблокирующая** в инлайне (можно повторить и читать дальше).

---

## Поток данных

```
Данные упражнения (TS/MDX)
        │ data
        ▼
  <Component data> ──uses──▶ useExercise ──validate()──▶ ExerciseResult
        │                         │
        │ children                │ report() (если есть контекст)
        ▼                         ▼
  ExerciseShell (UI+feedback)  QuizContext ──▶ Quiz: счёт, прогресс, QuizSummary
```

---

## Структура папок (целевая)

```
promt_engineering_academy/
├─ .github/workflows/deploy.yml        # автодеплой на Pages
├─ docs/                               # этот план
├─ index.html
├─ vite.config.ts                      # base: '/promt_engineering_academy/'
├─ package.json
├─ src/
│  ├─ main.tsx, App.tsx, router.tsx    # HashRouter, layout
│  ├─ exercises/
│  │  ├─ core/                         # types, useExercise, ExerciseShell, validators, QuizContext
│  │  ├─ MultipleChoice/
│  │  ├─ TrueFalse/
│  │  ├─ FillTheBlank/
│  │  ├─ MatchPairs/
│  │  ├─ OrderSteps/
│  │  ├─ SpotTheHallucination/
│  │  ├─ PromptBuilder/
│  │  ├─ CaseStudy/
│  │  └─ PromptRefinementLadder/       # кастомный компонент
│  ├─ quiz/                            # Quiz, ProgressBar, QuizSummary
│  ├─ content/
│  │  ├─ articles/*.mdx                # статьи
│  │  └─ registry.ts                   # список статей для навигации
│  ├─ components/                      # Layout, Header, Nav, ArticleCard
│  ├─ pages/                           # Home, Article, About
│  ├─ hooks/                           # useLocalProgress и т.п.
│  └─ styles/                          # CSS-переменные, темы
└─ ...
```

---

## Технологии и библиотеки

| Назначение | Выбор | Почему |
|---|---|---|
| Сборка/дев-сервер | **Vite** | быстрый, простой конфиг `base` для Pages |
| UI | **React 18 + TypeScript** | компонентная модель идеально ложится на «набор переиспользуемых упражнений» |
| Контент | **MDX** (`@mdx-js/rollup`) | проза и упражнения в одном файле — органичная интеграция |
| Роутинг | **react-router-dom** (`HashRouter`) | работает на статике Pages без 404 на под-маршрутах |
| Drag-and-drop | **@dnd-kit/core** | для `MatchPairs`, `OrderSteps`, `PromptBuilder`; доступнее и легче, чем react-dnd |
| Хранение прогресса | **localStorage** (свой хук) | без бэкенда, переживает перезагрузку |
| Стили | **CSS Modules + CSS-переменные** | изоляция стилей компонентов, лёгкая темизация, без тяжёлых зависимостей |

> Никаких серверных зависимостей — весь функционал работает на статике GitHub Pages.
