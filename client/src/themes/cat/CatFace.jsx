import CatMascot from './CatMascot';
import { pointOnCircle } from '../ringMath';

// Cat timer face: twelve paw prints walk around the clock and fill in as
// time passes. A curly cat tail rides the ring to show exactly where we are,
// and the cat herself lounges against the bottom-left of the dial.

const PAWS = 12;
const RING = 118;

function catPose(status, mode, justStarted, justCompleted) {
  if (justCompleted) return 'curled';
  if (status === 'running') {
    if (mode !== 'focus') return 'purr';
    return justStarted ? 'stretch' : 'awake';
  }
  return 'sleep';
}

export default function CatFace({ progress, timeText, mode, status, modeLabel, justStarted, justCompleted }) {
  const pose = catPose(status, mode, justStarted, justCompleted);
  return (
    <div className={`face cat-face is-${status}`}>
      <svg className="face__dial" viewBox="0 0 300 300" aria-hidden="true">
        <circle cx="150" cy="150" r="142" className="cat-plate" />
        <circle cx="150" cy="150" r={RING} className="cat-track" />

        {Array.from({ length: PAWS }, (_, i) => {
          // Paws sit between the hours so the tail has room at 12 o'clock.
          const fraction = (i + 0.5) / PAWS;
          const { x, y } = pointOnCircle(150, 150, RING, fraction);
          const done = progress >= fraction;
          // Rotate each paw so its toes point along the path, as if walking clockwise.
          const angle = fraction * 360 + 90;
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${angle})`}
              className={done ? 'cat-paw is-done' : 'cat-paw'}
            >
              <ellipse cx="0" cy="3" rx="7" ry="6" />
              <circle cx="-7.5" cy="-4.5" r="2.8" />
              <circle cx="-2.6" cy="-9.4" r="2.8" />
              <circle cx="2.6" cy="-9.4" r="2.8" />
              <circle cx="7.5" cy="-4.5" r="2.8" />
            </g>
          );
        })}

        {/* The tail pointer: rotated to the current progress */}
        <g transform={`rotate(${progress * 360} 150 150)`} className="cat-tail-pointer">
          <g className="cat-tail-pointer__sway">
            <path d="M150 52c0-14 14-18 12-32-1-9-12-11-15-4" />
            <path d="M147 16c3-7 14-5 15 4" className="cat-tail-pointer__tip" />
          </g>
        </g>
      </svg>

      <div className="face__center">
        <span className="face__digits">{timeText}</span>
        <span className="face__mode">{modeLabel}</span>
      </div>

      <CatMascot pose={pose} />
    </div>
  );
}
