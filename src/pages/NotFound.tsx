import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="container article">
      <h1>404</h1>
      <p>Такой страницы нет.</p>
      <Link to="/" className="article__back">
        ← На главную
      </Link>
    </div>
  );
}
