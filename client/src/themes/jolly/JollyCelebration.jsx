import { useState } from 'react';

// Confetti! Each piece gets a random position, color, spin and drift once,
// when the celebration appears. The falling itself is a CSS animation.

const COLORS = ['#FFC93C', '#E8432C', '#4FB3F6', '#7FD8B4', '#2B1B0E', '#FF9EB0'];
const SHAPES = ['rect', 'circle', 'ribbon'];

function makePieces(count) {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.7,
    duration: 2.2 + Math.random() * 1.4,
    spin: Math.round(Math.random() * 900 - 450),
    drift: Math.round((Math.random() * 2 - 1) * 140),
    size: 8 + Math.round(Math.random() * 8),
    color: COLORS[i % COLORS.length],
    shape: SHAPES[i % SHAPES.length],
  }));
}

export default function JollyCelebration() {
  // useState with a function runs makePieces only once for this celebration.
  const [pieces] = useState(() => makePieces(64));
  return (
    <div className="celebration jolly-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti confetti--${p.shape}`}
          style={{
            left: `${p.left}%`,
            '--delay': `${p.delay}s`,
            '--duration': `${p.duration}s`,
            '--spin': `${p.spin}deg`,
            '--drift': `${p.drift}px`,
            '--size': `${p.size}px`,
            '--color': p.color,
          }}
        />
      ))}
    </div>
  );
}
