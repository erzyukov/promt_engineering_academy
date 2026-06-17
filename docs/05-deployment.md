# 05. Деплой на GitHub Pages

Портал — статика, поэтому GitHub Pages подходит полностью. Бэкенд не нужен. Ниже — что настроить, чтобы автодеплой работал при каждом пуше в `main`.

## 1. Конфиг Vite — базовый путь

Сайт живёт в подпапке `…/promt_engineering_academy/`, поэтому **обязательно** задать `base`, иначе ассеты не найдутся (белый экран).

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';

export default defineConfig({
  base: '/promt_engineering_academy/',
  plugins: [mdx(), react()],
});
```

## 2. Роутинг — HashRouter

На GitHub Pages нет серверных rewrite'ов: прямая ссылка на под-маршрут с `BrowserRouter` даёт 404 при перезагрузке. `HashRouter` хранит маршрут в `#` и работает на статике без костылей.

```tsx
// src/main.tsx
import { HashRouter } from 'react-router-dom';
// <HashRouter><App /></HashRouter>
// URL'ы вида:  …/promt_engineering_academy/#/article/how-llms-work
```

## 3. GitHub Actions — автодеплой

Файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build          # → создаёт dist/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## 4. Настройки репозитория (один раз)

1. GitHub → репозиторий → **Settings → Pages**.
2. **Source: GitHub Actions** (не «Deploy from a branch»).
3. После первого успешного запуска workflow сайт будет доступен по адресу
   `https://erzyukov.github.io/promt_engineering_academy/`.

## 5. Локальная проверка перед пушем

```bash
npm run build      # собрать
npm run preview    # поднять локально собранную версию (учитывает base)
```

Если `preview` открывается корректно — деплой на Pages тоже сработает.

## 6. Частые грабли

| Симптом | Причина | Решение |
|---|---|---|
| Белый экран, 404 на JS/CSS | не задан `base` | прописать `base: '/promt_engineering_academy/'` |
| 404 при перезагрузке статьи | `BrowserRouter` на Pages | использовать `HashRouter` |
| Картинки/MDX-ассеты не грузятся | абсолютные пути от `/` | импортировать ассеты через Vite (`import img from './x.png'`) |
| Workflow падает на `npm ci` | нет `package-lock.json` | закоммитить lock-файл |
| Pages не обновляется | Source стоит на ветке | переключить Source на **GitHub Actions** |

---

## .gitignore (минимум)

```
node_modules/
dist/
.DS_Store
*.local
```

> Деплой настраивается в **Фазе 0** дорожной карты — раньше любого контента, чтобы каждая последующая фаза сразу проверялась «вживую» на Pages.
