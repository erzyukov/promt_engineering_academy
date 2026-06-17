import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Article } from './pages/Article';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

// Демо-стенд грузим лениво — он тянет все компоненты и не нужен на первичной загрузке.
const Playground = lazy(() =>
  import('./pages/Playground').then((m) => ({ default: m.Playground })),
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="article/:slug" element={<Article />} />
        <Route path="about" element={<About />} />
        <Route
          path="playground"
          element={
            <Suspense fallback={<p className="container article__loading">Загрузка…</p>}>
              <Playground />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
