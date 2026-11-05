import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { setTheme } from '../store/themeSlice';
import { THEMES, svgToDataUri } from '../themes';
import { useCurrentTheme } from './hooks/useCurrentTheme';
import { useReducedMotion } from './hooks/useReducedMotion';
import './ThemePicker.css';

/**
 * The theme switcher in the header.
 *
 * Switching is animated: a circle in the new theme's color grows out of the
 * button you clicked ("cover"), the theme changes underneath it, and then the
 * circle fades away ("reveal"). With reduced motion the switch is instant.
 */
export default function ThemePicker() {
  const dispatch = useDispatch();
  const current = useCurrentTheme();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [wipe, setWipe] = useState(null); // { theme, x, y, phase: 'cover' | 'reveal' }
  const rootRef = useRef(null);
  const toggleRef = useRef(null);

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (theme, event) => {
    setOpen(false);
    toggleRef.current?.focus();
    if (theme.id === current.id) return;
    if (reducedMotion) {
      dispatch(setTheme(theme.id));
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setWipe({
      theme,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      phase: 'cover',
    });
  };

  // Move the wipe to its next phase. Called when the CSS animation ends, or by
  // the safety timeout below if the browser never fires animationend
  // (for example when the tab is hidden mid-switch).
  const wipeRef = useRef(null);
  wipeRef.current = wipe; // always the latest wipe, readable from callbacks

  const advanceWipe = useCallback(() => {
    const w = wipeRef.current;
    if (!w) return;
    if (w.phase === 'cover') {
      dispatch(setTheme(w.theme.id));
      setWipe({ ...w, phase: 'reveal' });
    } else {
      setWipe(null);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!wipe) return undefined;
    const id = setTimeout(advanceWipe, wipe.phase === 'cover' ? 900 : 800);
    return () => clearTimeout(id);
  }, [wipe, advanceWipe]);

  const onWipeAnimationEnd = (event) => {
    // Only react to the overlay's own animation, not the emblem inside it.
    if (event.target === event.currentTarget) advanceWipe();
  };

  return (
    <div className="theme-picker" ref={rootRef}>
      <button
        ref={toggleRef}
        type="button"
        className="btn btn--small theme-picker__toggle"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <img src={svgToDataUri(current.icon)} alt="" width="22" height="22" />
        <span>
          <span className="visually-hidden">Theme: </span>
          {current.name}
        </span>
      </button>

      {open && (
        <div className="theme-picker__menu card" role="group" aria-label="Choose a theme">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className="theme-picker__option"
              data-option={theme.id}
              aria-pressed={theme.id === current.id}
              onClick={(event) => choose(theme, event)}
            >
              <span className="theme-picker__swatch" style={{ background: theme.themeColor }}>
                <img src={svgToDataUri(theme.icon)} alt="" width="30" height="30" />
              </span>
              <span className="theme-picker__text">
                <span className="theme-picker__name">{theme.name}</span>
                <span className="theme-picker__tagline">{theme.tagline}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {wipe &&
        createPortal(
          <div
            className={`theme-wipe is-${wipe.phase}`}
            style={{ '--wipe-color': wipe.theme.themeColor, '--x': `${wipe.x}px`, '--y': `${wipe.y}px` }}
            onAnimationEnd={onWipeAnimationEnd}
            aria-hidden="true"
          >
            <img className="theme-wipe__emblem" src={svgToDataUri(wipe.theme.icon)} alt="" />
          </div>,
          document.body,
        )}
    </div>
  );
}
