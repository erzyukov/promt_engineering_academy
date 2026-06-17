import { useParams, Link } from 'react-router-dom';
import { getArticle } from '../content/registry';

export function Article() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;

  if (!article) {
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
      <h1>{article.title}</h1>
      <p className="article__summary">{article.summary}</p>
      <div className="article__placeholder">
        <p>
          📝 Текст статьи и интерактивные упражнения появятся на этапе наполнения
          контентом (Фаза 4).
        </p>
      </div>
    </article>
  );
}
