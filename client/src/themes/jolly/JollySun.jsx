// The Jolly mascot: a little sun whose face follows what the timer is doing.
//   idle      → happy and bobbing
//   focus     → determined eyebrows, rays slowly spinning
//   paused    → sleepy, drifting off
//   break     → giggling and bouncing
//   celebrate → big jump after a finished session

function moodFor(status, isBreak, celebrating) {
  if (celebrating) return 'party';
  if (status === 'paused') return 'sleepy';
  if (status === 'running') return isBreak ? 'giggly' : 'focused';
  return 'happy';
}

function Face({ mood }) {
  switch (mood) {
    case 'focused':
      return (
        <>
          <path d="M44 47l11 3.5M76 47l-11 3.5" className="sun-line" />
          <circle cx="50" cy="58" r="3.4" className="sun-ink" />
          <circle cx="70" cy="58" r="3.4" className="sun-ink" />
          <path d="M53 70q7 3 14 0" className="sun-line" />
        </>
      );
    case 'sleepy':
      return (
        <>
          <path d="M44 57q6 5 12 0M64 57q6 5 12 0" className="sun-line" />
          <ellipse cx="60" cy="70" rx="3.2" ry="3.8" className="sun-ink" />
        </>
      );
    case 'giggly':
    case 'party':
      return (
        <>
          <path d="M44 59q6-7 12 0M64 59q6-7 12 0" className="sun-line" />
          <path d="M47 65h26q0 13-13 13t-13-13z" className="sun-mouth" />
        </>
      );
    default:
      return (
        <>
          <circle cx="50" cy="57" r="3.4" className="sun-ink" />
          <circle cx="70" cy="57" r="3.4" className="sun-ink" />
          <path d="M48 66q12 11 24 0" className="sun-line" />
        </>
      );
  }
}

export default function JollySun({ status, isBreak, celebrating }) {
  const mood = moodFor(status, isBreak, celebrating);
  return (
    <div className="jolly-sun" data-mood={mood} aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <g className="jolly-sun__rays">
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x="56.5"
              y="3"
              width="7"
              height="17"
              rx="3.5"
              transform={`rotate(${i * 30} 60 60)`}
              className={i % 2 ? 'sun-ray sun-ray--alt' : 'sun-ray'}
            />
          ))}
        </g>
        {/* At night (Settings → Night look) jolly.css hides the rays and shows
            this glow and the craters, so the sun becomes a smiling moon. */}
        <circle cx="60" cy="60" r="44" className="sun-moon-glow" />
        <g className="jolly-sun__body">
          <circle cx="60" cy="60" r="31" className="sun-disc" />
          <circle cx="74" cy="44" r="4.5" className="sun-crater" />
          <circle cx="44" cy="78" r="3" className="sun-crater" />
          <circle cx="82" cy="56" r="2.2" className="sun-crater" />
          <ellipse cx="42" cy="66" rx="5.5" ry="3.5" className="sun-cheek" />
          <ellipse cx="78" cy="66" rx="5.5" ry="3.5" className="sun-cheek" />
          <Face mood={mood} />
        </g>
        {mood === 'sleepy' && (
          <g className="jolly-sun__z">
            <text x="92" y="30">z</text>
            <text x="102" y="16">z</text>
          </g>
        )}
      </svg>
    </div>
  );
}
