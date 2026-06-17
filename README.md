# Prompt Engineering Academy

Образовательный портал по промпт-инжинирингу, где теория переплетена с практикой:
читаешь абзац — тут же закрепляешь интерактивным упражнением, а в конце статьи
проходишь тест с подсчётом баллов. Все упражнения **статические** — проверка идёт
в браузере, без обращения к реальному AI.

🔗 **Демо:** https://erzyukov.github.io/promt_engineering_academy/

## Стек

- **React 18 + TypeScript**
- **Vite** — сборка и dev-сервер
- **MDX** — статьи (Markdown со встроенными React-компонентами)
- **react-router-dom** (`HashRouter` — для работы на GitHub Pages)
- **@dnd-kit** — drag-and-drop, **lucide-react** — иконки
- **GitHub Actions → GitHub Pages** — автодеплой при пуше в `main`

## Запуск

```bash
npm install
npm run dev       # http://localhost:5173/promt_engineering_academy/
npm run build     # прод-сборка в dist/
npm run preview   # локальный предпросмотр собранной версии
```

## Структура

```
src/
├─ exercises/        # упражнения: core/ (движок) + папка на каждый тип
├─ quiz/             # тест-режим: Quiz, ProgressBar, QuizSummary, scoring
├─ content/          # articles/*.mdx, registry.ts, articleComponents.ts
├─ pages/            # Home, Article, About, Playground, NotFound
├─ components/       # Layout, Header, Footer
├─ hooks/            # useLocalProgress (прогресс в localStorage)
└─ styles/           # global.css (дизайн-токены)
docs/                # план и архитектура (см. docs/overview.md)
```

## Доступные компоненты-упражнения

| Компонент | Что делает | Группа |
|---|---|---|
| `MultipleChoice` | выбор одного или нескольких вариантов | базовый |
| `TrueFalse` | верно/неверно с объяснением | базовый |
| `FillTheBlank` | заполнить пропуски в тексте | базовый |
| `MatchPairs` | соединить пары (drag-and-drop + клик) | базовый |
| `OrderSteps` | расставить шаги по порядку (drag-and-drop) | базовый |
| `SpotTheHallucination` | найти выдумку в «ответе AI» | продвинутый |
| `PromptBuilder` | собрать промпт из блоков + предпросмотр | продвинутый |
| `CaseStudy` | улучшить слабый промпт (проверка эвристиками) | продвинутый |
| `PromptRefinementLadder` | ⭐ пошаговое улучшение промпта (кастомный) | кастомный |
| `Quiz` | тест-режим: последовательность + прогресс + сводка | контейнер |

Все типы можно посмотреть на одной странице — `/#/playground` («Демо» в шапке).

## Как добавить новую статью

1. **Создайте MDX-файл** `src/content/articles/<slug>.mdx`. В начале импортируйте нужные
   компоненты и пишите прозу, вставляя упражнения прямо в текст:

   ```mdx
   import { MultipleChoice, TrueFalse } from '../../exercises';
   import { Quiz } from '../../quiz';

   # Заголовок статьи

   Текст абзаца...

   <MultipleChoice
     id="<slug>-q1"
     data={{
       question: 'Вопрос?',
       options: [
         { id: 'a', text: 'Вариант A' },
         { id: 'b', text: 'Вариант B' },
       ],
       correct: ['b'],
       explanation: 'Почему B верно.',
     }}
   />
   ```

2. **Зарегистрируйте ленивый импорт** в `src/content/articleComponents.ts`:

   ```ts
   '<slug>': lazy(() => import('./articles/<slug>.mdx')),
   ```

3. **Добавьте метаданные** в `src/content/registry.ts` (`slug`, `title`, `summary`,
   `order`, `readingTime`, `quizId`).

4. **Финальный тест** — оберните набор упражнений в `<Quiz>`; используйте тот же
   `quizId`, что и в реестре, чтобы прогресс отмечался на главной:

   ```mdx
   ## Проверь себя

   <Quiz id="quiz-<slug>" title="Итоговый тест">
     <TrueFalse id="<slug>-f1" data={{ /* ... */ }} />
   </Quiz>
   ```

> У каждого `id` упражнения должно быть уникальное значение в пределах страницы.

## Документация

Архитектура, спецификация компонентов и дорожная карта — в каталоге [`docs/`](./docs)
(оглавление — [`docs/overview.md`](./docs/overview.md)).

---

Учебный проект.
