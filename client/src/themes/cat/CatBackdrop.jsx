// Cozy corner: a trail of faint paw prints wandering across the page,
// a ball of yarn with a loose thread, and a soft warm glow.

function Paw({ style }) {
  return (
    <svg className="cat-trail-paw" style={style} viewBox="0 0 24 24">
      <ellipse cx="12" cy="15" rx="5" ry="4.2" />
      <ellipse cx="5.6" cy="9.4" rx="2" ry="2.6" />
      <ellipse cx="9.6" cy="5.4" rx="2" ry="2.6" />
      <ellipse cx="14.4" cy="5.4" rx="2" ry="2.6" />
      <ellipse cx="18.4" cy="9.4" rx="2" ry="2.6" />
    </svg>
  );
}

// Positions along a lazy S-curve, alternating left and right feet.
const TRAIL = [
  { left: '4%', top: '78%', r: 40 },
  { left: '8%', top: '71%', r: 30 },
  { left: '11%', top: '80%', r: 50 },
  { left: '16%', top: '73%', r: 35 },
  { left: '19%', top: '84%', r: 60 },
  { left: '24%', top: '78%', r: 55 },
];

export default function CatBackdrop() {
  return (
    <div className="backdrop cat-backdrop" aria-hidden="true">
      <span className="cat-glow cat-glow--1" />
      <span className="cat-glow cat-glow--2" />
      {TRAIL.map((p, i) => (
        <Paw key={i} style={{ left: p.left, top: p.top, transform: `rotate(${p.r}deg)` }} />
      ))}
      <svg className="cat-yarn" viewBox="0 0 160 120">
        <path className="cat-yarn__thread" d="M60 92c-20 10-40 4-52 18" />
        <circle cx="96" cy="70" r="40" className="cat-yarn__ball" />
        <path className="cat-yarn__line" d="M62 54c18 10 40 8 66-6M58 74c24 14 50 12 76-4M70 102c14-26 38-48 62-52M86 32c-8 24-6 52 6 76" />
      </svg>
    </div>
  );
}
