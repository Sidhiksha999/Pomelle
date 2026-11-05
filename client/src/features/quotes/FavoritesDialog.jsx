import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../../store/themeSlice';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import Icon from '../../components/Icon';

/** The list of saved quotes and jokes for the active theme. */
export default function FavoritesDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const dispatch = useDispatch();
  const theme = useCurrentTheme();
  const favorites = useSelector((s) => s.theme.favorites).filter((f) => f.themeId === theme.id);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="dialog favorites-dialog"
      aria-labelledby="favorites-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="dialog__header">
        <h2 id="favorites-title">{theme.voice.favoritesTitle}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>
      <div className="dialog__body">
        {favorites.length === 0 ? (
          <p className="favorites-empty">{theme.voice.favoritesEmpty}</p>
        ) : (
          <ul className="favorites-list">
            {favorites.map((f) => (
              <li key={f.text} className="favorites-item">
                <span className="favorites-item__kind">{f.kind === 'quote' ? theme.voice.quoteLabel : theme.voice.jokeLabel}</span>
                <p className="favorites-item__text">{f.text}</p>
                <button
                  type="button"
                  className="btn btn--small btn--quiet"
                  onClick={() => dispatch(toggleFavorite({ themeId: f.themeId, kind: f.kind, text: f.text }))}
                >
                  <Icon name="close" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
