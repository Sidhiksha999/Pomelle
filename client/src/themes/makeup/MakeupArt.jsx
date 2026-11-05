// Hand-drawn makeup items for the Makeup theme. Each one is a small SVG
// component so it can be reused on the timer, in the backdrop and in cards.
// Colors come from CSS classes in makeup.css.

/** A four-point sparkle star. */
export function Sparkle({ className = '', style }) {
  return (
    <svg className={`mk-sparkle ${className}`} style={style} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1c.6 5.6 2.6 9.4 11 11-8.4 1.6-10.4 5.4-11 11-.6-5.6-2.6-9.4-11-11 8.4-1.6 10.4-5.4 11-11z" />
    </svg>
  );
}

/**
 * A lipstick whose bullet twists up as `rise` goes from 0 to 1.
 * On the timer, rise is the session progress.
 */
export function Lipstick({ rise = 1, className = '' }) {
  const offset = (1 - rise) * 46; // how far the bullet is still hidden in the tube
  return (
    <svg className={`mk-lipstick ${className}`} viewBox="0 0 60 160" aria-hidden="true">
      <defs>
        <clipPath id="mk-lipstick-clip">
          <rect x="0" y="0" width="60" height="86" />
        </clipPath>
      </defs>
      <g clipPath="url(#mk-lipstick-clip)">
        <g style={{ transform: `translateY(${offset}px)`, transition: 'transform 0.8s ease-out' }}>
          <path className="mk-bullet" d="M18 88V42q0-15 12-24l12 13v57z" />
          <path className="mk-bullet-shine" d="M22 82V44q0-10 6-17" />
        </g>
      </g>
      <rect className="mk-collar" x="14" y="84" width="32" height="14" rx="2" />
      <rect className="mk-case" x="10" y="97" width="40" height="60" rx="5" />
      <path className="mk-case-shine" d="M17 104v44" />
    </svg>
  );
}

export function Brush({ className = '' }) {
  return (
    <svg className={`mk-brush ${className}`} viewBox="0 0 40 200" aria-hidden="true">
      <path className="mk-bristles" d="M20 4c10 6 14 20 12 40-1 8-5 14-12 14S9 52 8 44C6 24 10 10 20 4z" />
      <path className="mk-bristles-tip" d="M20 4c6 4 9 12 9 22-4-4-7-4-9-4s-5 0-9 4c0-10 3-18 9-22z" />
      <rect className="mk-ferrule" x="11" y="56" width="18" height="22" rx="3" />
      <path className="mk-handle" d="M12 78h16l-4 116q-4 4-8 0z" />
    </svg>
  );
}

export function NailPolish({ className = '' }) {
  return (
    <svg className={`mk-polish ${className}`} viewBox="0 0 80 130" aria-hidden="true">
      <rect className="mk-polish-cap" x="27" y="4" width="26" height="50" rx="5" />
      <rect className="mk-polish-neck" x="31" y="52" width="18" height="10" />
      <path className="mk-polish-bottle" d="M14 62h52q8 0 8 10v42q0 12-12 12H18q-12 0-12-12V72q0-10 8-10z" />
      <path className="mk-polish-shine" d="M16 74v34" />
    </svg>
  );
}

export function Perfume({ className = '' }) {
  return (
    <svg className={`mk-perfume ${className}`} viewBox="0 0 100 140" aria-hidden="true">
      <circle className="mk-perfume-bulb" cx="16" cy="22" r="11" />
      <path className="mk-perfume-tube" d="M26 22q12 0 16 8" />
      <rect className="mk-perfume-cap" x="40" y="16" width="20" height="24" rx="3" />
      <path className="mk-perfume-bottle" d="M30 40h40l18 22v58q0 14-14 14H26q-14 0-14-14V62z" />
      <path className="mk-perfume-facet" d="M30 40 22 62h56L70 40M22 62l8 72M78 62l-8 72" />
      <rect className="mk-perfume-label" x="34" y="82" width="32" height="20" rx="2" />
    </svg>
  );
}

export function Palette({ className = '' }) {
  const pans = ['#E6C3AE', '#F2B8C6', '#B76E79', '#8C2F4E', '#F3DFC1', '#C98A6B'];
  return (
    <svg className={`mk-palette ${className}`} viewBox="0 0 140 90" aria-hidden="true">
      <rect className="mk-palette-case" x="4" y="4" width="132" height="82" rx="12" />
      {pans.map((color, i) => (
        <g key={color}>
          <circle cx={28 + (i % 3) * 42} cy={i < 3 ? 28 : 62} r="15" fill={color} className="mk-pan" />
          <path
            d={`M${20 + (i % 3) * 42} ${i < 3 ? 22 : 56}q5-4 10-2`}
            className="mk-pan-shine"
          />
        </g>
      ))}
    </svg>
  );
}
