import { Moon, PressedFlower } from './AestheticArt';
import { pointOnCircle } from '../ringMath';

// Aesthetic timer face: a polaroid taped to the page. Inside the photo, a
// pencil-drawn circle fills in with dusty mauve ink, and four moon phases
// sit at the quarter marks, lighting up as you pass them.
// The mode label is handwritten on the polaroid's bottom strip.

/**
 * Builds a slightly wobbly circle path, like one drawn by hand.
 * It starts at 12 o'clock and goes clockwise so the progress dash starts at the top.
 */
function wobblyCircle(cx, cy, r, seed) {
  const points = [];
  for (let deg = 0; deg <= 360; deg += 3) {
    const t = (deg * Math.PI) / 180;
    const wobble = 2.2 * Math.sin(3 * t + seed) + 1.3 * Math.cos(5 * t + seed * 2) + 0.7 * Math.sin(9 * t);
    const radius = r + wobble;
    const angle = t - Math.PI / 2;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${points.join('L')}`;
}

// These never change, so build them once when the file loads.
const TRACK = wobblyCircle(150, 150, 112, 0.6);
const TRACK_SKETCH = wobblyCircle(150, 150, 114, 2.4);

const MOONS = [
  { fraction: 0.25, phase: 'first' },
  { fraction: 0.5, phase: 'full' },
  { fraction: 0.75, phase: 'last' },
  { fraction: 1, phase: 'new' },
];

export default function AestheticFace({ progress, timeText, mode, status, modeLabel }) {
  const isBreak = mode !== 'focus';
  return (
    <div className={`face aesthetic-face is-${status} ${isBreak ? 'is-break' : 'is-focus'}`}>
      <span className="washi washi--face" aria-hidden="true" />
      <div className="aesthetic-face__photo">
        <svg className="face__dial" viewBox="0 0 300 300" aria-hidden="true">
          <path d={TRACK_SKETCH} className="ae-track ae-track--sketch" />
          <path d={TRACK} className="ae-track" />
          <path
            d={TRACK}
            pathLength="100"
            className="ae-progress"
            style={{ strokeDasharray: 100, strokeDashoffset: 100 * (1 - progress), opacity: progress > 0 ? 1 : 0 }}
          />
          {MOONS.map((m) => {
            const { x, y } = pointOnCircle(150, 150, 136, m.fraction);
            return (
              <g key={m.phase} transform={`translate(${x} ${y})`}>
                <Moon phase={m.phase} lit={progress >= m.fraction - 0.001} />
              </g>
            );
          })}
        </svg>
        <div className="face__center">
          <span className="face__digits">{timeText}</span>
        </div>
      </div>
      <p className="aesthetic-face__caption">{modeLabel}</p>
      <PressedFlower className="aesthetic-face__flower" />
    </div>
  );
}
