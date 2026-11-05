import JollySun from './JollySun';
import { circleDash, pointOnCircle } from '../ringMath';

// Jolly timer face: a chunky "sticker plate" with a candy-striped track,
// a thick tomato progress arc (mint during breaks) and the sun mascot
// peeking over the top-right edge.

const RADIUS = 116;

export default function JollyFace({ progress, timeText, mode, status, modeLabel, justCompleted }) {
  const isBreak = mode !== 'focus';
  return (
    <div className={`face jolly-face is-${status} ${isBreak ? 'is-break' : 'is-focus'}`}>
      <svg className="face__dial" viewBox="0 0 300 300" aria-hidden="true">
        <circle className="jolly-face__shadow" cx="156" cy="158" r="140" />
        <circle className="jolly-face__plate" cx="150" cy="150" r="140" />
        <circle className="jolly-face__track" cx="150" cy="150" r={RADIUS} />
        <circle
          className="jolly-face__progress"
          cx="150"
          cy="150"
          r={RADIUS}
          transform="rotate(-90 150 150)"
          style={{ ...circleDash(RADIUS, progress), opacity: progress > 0 ? 1 : 0 }}
        />
        {/* Twelve candy dots around the edge, like the hours on a clock */}
        {Array.from({ length: 12 }, (_, i) => {
          const { x, y } = pointOnCircle(150, 150, 133, i / 12);
          return <circle key={i} cx={x} cy={y} r="3.4" className="jolly-face__tick" />;
        })}
      </svg>
      <div className="face__center">
        <span className="face__digits">{timeText}</span>
        <span className="face__mode">{modeLabel}</span>
      </div>
      <JollySun status={status} isBreak={isBreak} celebrating={justCompleted} />
    </div>
  );
}
