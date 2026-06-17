import { Link } from 'react-router-dom';
import Demo from '../content/playground.mdx';

/**
 * Технический стенд для проверки компонентов-упражнений (Фаза 1+).
 * Не входит в основную навигацию контента — служебная страница разработки.
 */
export function Playground() {
  return (
    <div className="container article">
      <Link to="/" className="article__back">
        ← На главную
      </Link>
      <Demo />
    </div>
  );
}
