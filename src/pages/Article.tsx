import { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticle } from '../content/registry';
import { articleComponents } from '../content/articleComponents';

export function Article() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;
  const Content = slug ? articleComponents[slug] : undefined;

  if (!article || !Content) {
    return (
      <div className="container article">
        <p>Статья не найдена.</p>
        <Link to="/" className="article__back">
          ← Ко всем статьям
        </Link>
      </div>
    );
  }

  return (
    <article className="container article">
      <Link to="/" className="article__back">
        ← Ко всем статьям
      </Link>
      <p className="article__meta">
        Статья {article.order} · {article.readingTime} мин чтения
      </p>
      <Suspense fallback={<p className="article__loading">Загрузка…</p>}>
        <Content />
      </Suspense>
    </article>
  );
}
