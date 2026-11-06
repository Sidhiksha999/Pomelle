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

// At night (Settings → Night look) a crescent moon and a few slow stars
// appear too. They are always rendered; cat.css shows them only at night.
function Star({ style }) {
  return (
    <svg className="cat-star" style={style} viewBox="0 0 20 20">
      {/* a soft four-point twinkle */}
      <path d="M10 0c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z" />
    </svg>
  );
}

const STARS = [
  { left: '12%', top: '14%' },
  { left: '30%', top: '9%' },
  { left: '55%', top: '6%' },
  { left: '88%', top: '22%' },
  { left: '72%', top: '48%' },
  { left: '6%', top: '42%' },
];

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
      <div className="cat-night">
        <svg className="cat-moon" viewBox="0 0 80 80">
          <circle className="cat-moon__glow" cx="40" cy="40" r="38" />
          {/* a crescent: a full circle with a bite taken out by a mask */}
          <mask id="cat-moon-bite">
            <rect width="80" height="80" fill="#fff" />
            <circle cx="52" cy="30" r="20" fill="#000" />
          </mask>
          <circle className="cat-moon__body" cx="40" cy="40" r="22" mask="url(#cat-moon-bite)" />
          <circle className="cat-moon__crater" cx="30" cy="48" r="3" />
          <circle className="cat-moon__crater" cx="25" cy="38" r="2" />
        </svg>
        {STARS.map((p, i) => (
          <Star key={i} style={p} />
        ))}
      </div>
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
