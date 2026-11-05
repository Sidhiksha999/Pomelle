// Small hand-drawn pieces for the Aesthetic theme.

/** A pressed flower with a bent stem and two leaves. */
export function PressedFlower({ className = '', petal = '#C9A2AB', center = '#E3C08D' }) {
  return (
    <svg className={`ae-flower ${className}`} viewBox="0 0 80 120" aria-hidden="true">
      <path d="M40 46c-2 22 4 40-2 70" className="ae-flower__stem" />
      <path d="M39 80c-12-8-24-6-26-4 6 8 18 10 26 4z" className="ae-flower__leaf" />
      <path d="M40 66c10-10 22-10 26-8-4 8-16 12-26 8z" className="ae-flower__leaf" />
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="40"
          cy="30"
          rx="8"
          ry="14"
          fill={petal}
          className="ae-flower__petal"
          transform={`rotate(${angle} 40 42) translate(0 -2)`}
        />
      ))}
      <circle cx="40" cy="42" r="6" fill={center} className="ae-flower__center" />
    </svg>
  );
}

/**
 * A moon in one of four phases, drawn around (0, 0) with radius r.
 * phase: 'first' (right half lit), 'full', 'last' (left half lit), 'new'.
 */
export function Moon({ phase, r = 9, lit }) {
  const halfRight = `M0 ${-r}A${r} ${r} 0 0 1 0 ${r}Z`;
  const halfLeft = `M0 ${-r}A${r} ${r} 0 0 0 0 ${r}Z`;
  return (
    <g className={lit ? 'ae-moon is-lit' : 'ae-moon'}>
      <circle r={r} className="ae-moon__disc" />
      {phase === 'first' && <path d={halfRight} className="ae-moon__light" />}
      {phase === 'last' && <path d={halfLeft} className="ae-moon__light" />}
      {phase === 'full' && <circle r={r} className="ae-moon__light" />}
    </g>
  );
}
