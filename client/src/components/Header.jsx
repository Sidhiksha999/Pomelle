import ThemePicker from './ThemePicker';
import Icon from './Icon';
import { useCurrentTheme } from './hooks/useCurrentTheme';
import { routeHref } from './hooks/useHashRoute';
import { svgToDataUri } from '../themes';
import './Header.css';

const NAV = [
  { route: 'timer', label: 'Timer' },
  { route: 'methods', label: 'Methods' },
  { route: 'coach', label: 'Coach' },
  { route: 'stats', label: 'Stats' },
];

export default function Header({ route, onOpenSettings }) {
  const theme = useCurrentTheme();
  return (
    <header className="site-header">
      <a className="brand" href={routeHref('timer')} aria-label="Pomelle, go to the timer">
        <img className="brand__mark" src={svgToDataUri(theme.icon)} alt="" width="34" height="34" />
        <span className="brand__name">Pomelle</span>
      </a>

      <nav className="site-nav" aria-label="Main">
        {NAV.map((item) => (
          <a
            key={item.route}
            className="site-nav__link"
            href={routeHref(item.route)}
            aria-current={route === item.route ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="site-header__actions">
        <ThemePicker />
        <button type="button" className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
          <Icon name="settings" />
        </button>
      </div>
    </header>
  );
}
