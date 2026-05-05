import SearchDialog from './SearchDialog';
import ThemeToggle from './ThemeToggle';
import { navItems, SITE } from '../lib/site';

export default function Header() {
  return (
    <header className="site-header" data-pagefind-ignore>
      <a className="skip-link" href="#content">
        본문으로 이동
      </a>
      <nav className="nav-shell" aria-label="주요 메뉴">
        <a className="brand liquid-control" href="/" aria-label={`${SITE.title} 홈`}>
          <span className="brand-mark">p</span>
          <span>{SITE.title}</span>
        </a>

        <div className="nav-links">
          {navItems.map((item) => (
            <a className="nav-link liquid-control" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <SearchDialog />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
