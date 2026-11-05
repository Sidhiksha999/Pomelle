import { useSelector } from 'react-redux';
import { getTheme } from '../../themes';

/** The full theme object (voice, face, colors…) for the active theme. */
export function useCurrentTheme() {
  const id = useSelector((s) => s.theme.current);
  return getTheme(id);
}
