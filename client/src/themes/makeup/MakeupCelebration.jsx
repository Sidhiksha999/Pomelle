import { useState } from 'react';
import { Sparkle } from './MakeupArt';

// A glossy shimmer sweeps across the screen while sparkles pop and fade.

function makeSparkles(count) {
  return Array.from({ length: count }, () => ({
    left: 4 + Math.random() * 92,
    top: 6 + Math.random() * 80,
    size: 14 + Math.round(Math.random() * 26),
    delay: Math.random() * 1.4,
  }));
}

export default function MakeupCelebration() {
  const [sparkles] = useState(() => makeSparkles(26));
  return (
    <div className="celebration makeup-shimmer" aria-hidden="true">
      <span className="makeup-shimmer__sweep" />
      {sparkles.map((s, i) => (
        <Sparkle
          key={i}
          className="makeup-shimmer__sparkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
