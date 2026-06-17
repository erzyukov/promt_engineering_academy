import { NavLink, Link } from 'react-router-dom';

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link';

export function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand">
          <span className="header__logo" aria-hidden="true">⌘</span>
          <span>Prompt Engineering Academy</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" className={navClass} end>
            Статьи
          </NavLink>
          <NavLink to="/about" className={navClass}>
            О проекте
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
