import { useState } from 'react';

// Petals drift slowly down the screen, swaying as they fall.

const PETAL_COLORS = ['#C9A2AB', '#B7B3C4', '#E3C08D', '#D8B8B2', '#9AAE94'];

function makePetals(count) {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 4.5 + Math.random() * 2,
    sway: 30 + Math.round(Math.random() * 60),
    size: 12 + Math.round(Math.random() * 10),
    color: PETAL_COLORS[i % PETAL_COLORS.length],
  }));
}

export default function AestheticCelebration() {
  const [petals] = useState(() => makePetals(22));
  return (
    <div className="celebration ae-petals" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="ae-petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.7,
            background: p.color,
            '--sway': `${p.sway}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
