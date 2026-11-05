import { useEffect, useRef, useState } from 'react';
import { PressedFlower } from './AestheticArt';
import { useReducedMotion } from '../../components/hooks/useReducedMotion';

// A lo-fi window: golden-hour sky, two layers of soft hills, rain sliding
// down the glass, and a warm beam of light falling across the page.
// Moving the mouse shifts the layers a little (parallax). The layers are
// moved with CSS variables, so React doesn't re-render on every mouse move.

function makeDrops(count) {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 3.5 + Math.random() * 4,
    length: 10 + Math.round(Math.random() * 14),
  }));
}

function makeBeads(count) {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.round(Math.random() * 3),
  }));
}

export default function AestheticBackdrop() {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [drops] = useState(() => makeDrops(28));
  const [beads] = useState(() => makeBeads(30));

  useEffect(() => {
    if (reducedMotion) return undefined;
    let frame = 0;
    const onMove = (event) => {
      // Wait for the next animation frame so we update at most once per frame.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5; // -0.5 … 0.5
        const y = event.clientY / window.innerHeight - 0.5;
        rootRef.current?.style.setProperty('--mx', x.toFixed(3));
        rootRef.current?.style.setProperty('--my', y.toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="backdrop aesthetic-backdrop" aria-hidden="true">
      <div className="ae-beam" />

      <div className="ae-window">
        <div className="ae-window__glass">
          <div className="ae-sky ae-layer" style={{ '--depth': 4 }} />
          <div className="ae-sun ae-layer" style={{ '--depth': 6 }} />
          <svg className="ae-hills ae-hills--far ae-layer" style={{ '--depth': 10 }} viewBox="0 0 400 120" preserveAspectRatio="none">
            <path d="M0 70c40-20 80-28 130-14s80 20 130 0 100-26 140-8v72H0z" />
          </svg>
          <svg className="ae-hills ae-hills--near ae-layer" style={{ '--depth': 18 }} viewBox="0 0 400 120" preserveAspectRatio="none">
            <path d="M0 92c50-24 110-24 160-6s90 18 140-2 70-18 100-8v44H0z" />
          </svg>
          <div className="ae-fog" />
          {beads.map((b, i) => (
            <span key={`b${i}`} className="ae-bead" style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size }} />
          ))}
          {drops.map((d, i) => (
            <span
              key={i}
              className="ae-drop"
              style={{
                left: `${d.left}%`,
                height: d.length,
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.duration}s`,
              }}
            />
          ))}
        </div>
        <div className="ae-window__frame" />
        <div className="ae-window__sill">
          <svg className="ae-plant" viewBox="0 0 60 70">
            <path d="M30 40c-2-14-14-22-22-20 2 10 10 18 22 20zM30 40c2-16 12-26 22-26 0 12-8 22-22 26zM30 42c0-14 2-26 0-38" />
            <path d="M14 42h32l-4 26H18z" className="ae-plant__pot" />
          </svg>
        </div>
      </div>

      <PressedFlower className="ae-deco-flower ae-deco-flower--1" petal="#B7B3C4" center="#E3C08D" />
      <PressedFlower className="ae-deco-flower ae-deco-flower--2" petal="#C9A2AB" center="#9AAE94" />
    </div>
  );
}
