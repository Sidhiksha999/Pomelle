import { circleDash } from '../ringMath';

// Minimalist timer face: a hairline circle, one thin accent arc, and large
// thin numerals. Nothing else.

const RADIUS = 140;

export default function MinimalFace({ progress, timeText, status, modeLabel }) {
  return (
    <div className={`face minimal-face is-${status}`}>
      <svg className="face__dial" viewBox="0 0 300 300" aria-hidden="true">
        <circle cx="150" cy="150" r={RADIUS} className="min-track" />
        <circle
          cx="150"
          cy="150"
          r={RADIUS}
          className="min-progress"
          transform="rotate(-90 150 150)"
          style={{ ...circleDash(RADIUS, progress), opacity: progress > 0 ? 1 : 0 }}
        />
      </svg>
      <div className="face__center">
        <span className="face__digits">{timeText}</span>
        <span className="face__mode">{modeLabel}</span>
      </div>
    </div>
  );
}
