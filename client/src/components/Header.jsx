import ThemePicker from './ThemePicker';
import Icon from './Icon';
import { useCurrentTheme } from './hooks/useCurrentTheme';
import { svgToDataUri } from '../themes';
import './Header.css';

export default function Header({ onOpenSettings }) {
  const theme = useCurrentTheme();
  return (
    <header className="site-header">
      <a className="brand" href="#main" aria-label="Pomelle, go to the timer">
        <img className="brand__mark" src={svgToDataUri(theme.icon)} alt="" width="34" height="34" />
        <span className="brand__name">Pomelle</span>
      </a>
      <div className="site-header__actions">
        <ThemePicker />
        <button type="button" className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
          <Icon name="settings" />
        </button>
      </div>
    </header>
  );
}
