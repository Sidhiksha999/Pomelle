import { Lipstick, Sparkle } from './MakeupArt';
import { circleDash, pointOnCircle } from '../ringMath';

// Makeup timer face: an open compact mirror. The rose-gold case has a hinge
// on top, the mirror reflects a soft streak of light, and the progress ring
// is a glossy lip-gloss swirl with a sparkle riding its tip.
// A lipstick beside it twists up as the session goes on.

const RADIUS = 110;

export default function MakeupFace({ progress, timeText, mode, status, modeLabel, justCompleted }) {
  const isBreak = mode !== 'focus';
  const tip = pointOnCircle(150, 170, RADIUS, progress);
  return (
    <div className={`face makeup-face is-${status} ${isBreak ? 'is-break' : 'is-focus'} ${justCompleted ? 'is-celebrating' : ''}`}>
      <svg className="face__dial" viewBox="0 0 300 320" aria-hidden="true">
        <defs>
          <linearGradient id="mk-rosegold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F3D3C4" />
            <stop offset="0.35" stopColor="#C98A8F" />
            <stop offset="0.6" stopColor="#E9BCAE" />
            <stop offset="1" stopColor="#9E5A64" />
          </linearGradient>
          <radialGradient id="mk-mirror" cx="0.42" cy="0.38" r="0.7">
            <stop offset="0" stopColor="#FFFBF8" />
            <stop offset="0.7" stopColor="#FBEDE6" />
            <stop offset="1" stopColor="#F1DCCF" />
          </radialGradient>
          <linearGradient id="mk-gloss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8C2F4E" />
            <stop offset="0.55" stopColor="#C4567A" />
            <stop offset="1" stopColor="#E99AB0" />
          </linearGradient>
          <linearGradient id="mk-gloss-break" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B76E79" />
            <stop offset="1" stopColor="#F3DFC1" />
          </linearGradient>
          <clipPath id="mk-mirror-clip">
            <circle cx="150" cy="170" r="124" />
          </clipPath>
        </defs>

        {/* hinge and case */}
        <rect x="124" y="12" width="52" height="20" rx="8" fill="url(#mk-rosegold)" className="mk-outline" />
        <circle cx="150" cy="170" r="146" fill="url(#mk-rosegold)" className="mk-outline mk-case-ring" />
        <circle cx="150" cy="170" r="134" className="mk-inner-rim" />

        {/* the mirror and its moving reflection */}
        <circle cx="150" cy="170" r="124" fill="url(#mk-mirror)" />
        <g clipPath="url(#mk-mirror-clip)">
          <rect className="mk-reflection" x="60" y="20" width="34" height="320" transform="rotate(28 150 170)" />
        </g>

        {/* lip-gloss swirl progress */}
        <circle cx="150" cy="170" r={RADIUS} className="mk-track" />
        <circle
          cx="150"
          cy="170"
          r={RADIUS}
          className="mk-progress"
          stroke={isBreak ? 'url(#mk-gloss-break)' : 'url(#mk-gloss)'}
          transform="rotate(-90 150 170)"
          style={{ ...circleDash(RADIUS, progress), opacity: progress > 0 ? 1 : 0 }}
        />
        <circle
          cx="150"
          cy="170"
          r={RADIUS + 3}
          className="mk-progress-sheen"
          transform="rotate(-90 150 170)"
          style={{ ...circleDash(RADIUS + 3, progress), opacity: progress > 0 ? 0.7 : 0 }}
        />
        {progress > 0 && progress < 1 && (
          <g transform={`translate(${tip.x - 9} ${tip.y - 9})`}>
            <path className="mk-tip-sparkle" d="M9 0c.4 4 1.6 6.6 9 9-7.4 2.4-8.6 5-9 9-.4-4-1.6-6.6-9-9 7.4-2.4 8.6-5 9-9z" />
          </g>
        )}
      </svg>

      <div className="face__center makeup-face__center">
        <span className="face__mode">{modeLabel}</span>
        <span className="face__digits">{timeText}</span>
      </div>

      <Lipstick rise={isBreak ? 1 : progress} className="makeup-face__lipstick" />
      <Sparkle className="makeup-face__sparkle makeup-face__sparkle--1" />
      <Sparkle className="makeup-face__sparkle makeup-face__sparkle--2" />
    </div>
  );
}
