// Pomelle's own icon set, drawn by hand as SVG paths (24×24 grid).
// Lines are slightly imperfect on purpose so they feel drawn, not stamped.
// Every icon uses currentColor, and each theme sets the line weight with
// the --icon-stroke CSS variable.

const PATHS = {
  play: <path d="M7.5 4.8c0-.9 1-1.4 1.7-.9l9.6 6.6c.7.5.7 1.4 0 1.9l-9.6 6.8c-.7.5-1.7 0-1.7-.9z" />,
  pause: (
    <>
      <path d="M8.2 5.2v13.6" />
      <path d="M15.8 5v13.8" />
    </>
  ),
  skip: (
    <>
      <path d="M5.5 5.6 13 11.7a.5.5 0 0 1 0 .8L5.5 18.4" />
      <path d="M18.4 5.3v13.5" />
    </>
  ),
  reset: (
    <>
      <path d="M4.6 12.2a7.4 7.4 0 1 0 2.3-5.5" />
      <path d="M6.6 3.6v3.6h3.7" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7.2h9.5M17.6 7.2H20" />
      <circle cx="15.5" cy="7.2" r="2.1" />
      <path d="M4 16.8h2.6M10.7 16.8H20" />
      <circle cx="8.6" cy="16.8" r="2.1" />
    </>
  ),
  close: (
    <>
      <path d="M6.2 6.1 17.9 17.8" />
      <path d="M17.7 6 6.1 17.9" />
    </>
  ),
  refresh: (
    <>
      <path d="M19.2 11.6a7.2 7.2 0 0 0-12.6-4.5L5 8.8" />
      <path d="M4.8 4.6v4.3h4.3" />
      <path d="M4.8 12.6a7.2 7.2 0 0 0 12.6 4.4l1.6-1.7" />
      <path d="M19.2 19.4v-4.2h-4.3" />
    </>
  ),
  star: (
    <path d="M12 3.6l2.4 5.1 5.5.7-4 3.9 1 5.5L12 16.2l-4.9 2.6 1-5.5-4-3.9 5.5-.7z" strokeLinejoin="round" />
  ),
  heart: (
    <path d="M12 19.6s-7.4-4.4-7.4-9.6A4 4 0 0 1 12 7.9a4 4 0 0 1 7.4 2.1c0 5.2-7.4 9.6-7.4 9.6z" strokeLinejoin="round" />
  ),
  paw: (
    <>
      <path d="M12 12.4c2.9 0 5.4 2.6 5.4 4.7 0 1.7-1.5 2.4-2.8 2.1-1-.2-1.6-.6-2.6-.6s-1.6.4-2.6.6c-1.3.3-2.8-.4-2.8-2.1 0-2.1 2.5-4.7 5.4-4.7z" />
      <ellipse cx="5.6" cy="10.3" rx="1.7" ry="2.2" />
      <ellipse cx="9.2" cy="6.2" rx="1.7" ry="2.3" />
      <ellipse cx="14.8" cy="6.2" rx="1.7" ry="2.3" />
      <ellipse cx="18.4" cy="10.3" rx="1.7" ry="2.2" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="9" r="1.9" />
      <path d="M12 7.1c-1.2-2.4.1-4 0-4 0 0 1.2 1.6 0 4zM13.8 8.4c1.9-1.9 3.8-1.3 3.8-1.3s-.8 1.9-3.8 1.3zM13.3 10.6c2.6.4 3 2.4 3 2.4s-2 .1-3-2.4zM10.7 10.6c-1 2.5-3 2.4-3 2.4s.4-2 3-2.4zM10.2 8.4c-3 .6-3.8-1.3-3.8-1.3s1.9-.6 3.8 1.3z" strokeLinejoin="round" />
      <path d="M12 10.9c.2 3.4-.3 6.4-.1 9.4" />
      <path d="M11.9 16.6c-1.7-1.6-3.6-1.5-3.6-1.5s.8 2 3.6 1.5zM12 15c1.4-1.5 3.3-1.6 3.3-1.6s-.6 2-3.3 1.6z" strokeLinejoin="round" />
    </>
  ),
  check: <path d="M5 12.6l4.4 4.3L19.2 7" />,
  book: (
    <>
      <path d="M4.5 5.6c2.6-.9 5.2-.6 7.5 1v12.6c-2.3-1.6-4.9-1.9-7.5-1z" strokeLinejoin="round" />
      <path d="M19.5 5.6c-2.6-.9-5.2-.6-7.5 1v12.6c2.3-1.6 4.9-1.9 7.5-1z" strokeLinejoin="round" />
    </>
  ),
  pencil: (
    <>
      <path d="M15.6 4.8l3.6 3.6L8.7 18.9l-4.5 1 1-4.6z" strokeLinejoin="round" />
      <path d="M13.4 7l3.6 3.6" />
    </>
  ),
  trash: (
    <>
      <path d="M4.6 6.8h14.8" />
      <path d="M9.4 6.6V4.8h5.2v1.8" />
      <path d="M6.4 7l.9 12.2c.1.9.7 1.4 1.5 1.4h6.4c.8 0 1.4-.5 1.5-1.4L17.6 7" strokeLinejoin="round" />
      <path d="M10.2 10.6v6.2M13.8 10.6v6.2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="7.8" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5.2v13.7" />
      <path d="M5.1 12.1h13.8" />
    </>
  ),
  bell: (
    <>
      <path d="M6.4 16.6V11a5.6 5.6 0 0 1 11.2 0v5.6l1.4 1.6H5z" strokeLinejoin="round" />
      <path d="M10.2 20.2a2 2 0 0 0 3.6 0" />
    </>
  ),
};

/**
 * <Icon name="play" /> — decorative by default (hidden from screen readers).
 * Pass `label` when the icon is the only thing describing a control.
 * `filled` fills the shape too (used for "favorited" states).
 */
export default function Icon({ name, label, filled = false, className = '' }) {
  return (
    <svg
      className={`icon icon--${name} ${className}`}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      style={{ strokeWidth: 'var(--icon-stroke, 2)' }}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
