// Little illustrations for each study method, drawn as SVG on a 120×90 canvas.
// Colors come from CSS classes in methods.css that read the theme's series
// colors, so each drawing changes with the theme.

const ART = {
  pomodoro: (
    <>
      <circle cx="60" cy="50" r="28" className="art-fill-1" />
      <path d="M48 24c6 4 18 4 24 0M60 22v-8M60 14c4-4 10-4 12 0" className="art-line art-line--2" />
      <path d="M60 36v15l10 6" className="art-line" />
      <path d="M44 66c4 6 12 10 22 9" className="art-line art-line--soft" />
    </>
  ),
  '52-17': (
    <>
      <rect x="14" y="26" width="58" height="38" rx="8" className="art-fill-1" />
      <rect x="78" y="34" width="28" height="22" rx="6" className="art-fill-3" />
      <text x="43" y="51" className="art-text">52</text>
      <text x="92" y="50" className="art-text art-text--small">17</text>
      <path d="M72 45h6" className="art-line" />
    </>
  ),
  ultradian: (
    <>
      <path d="M6 58c12 0 14-32 27-32s15 32 27 32 14-32 27-32 15 32 27 32" className="art-line art-line--thick" />
      <circle cx="33" cy="26" r="5" className="art-fill-2" />
      <circle cx="87" cy="26" r="5" className="art-fill-2" />
      <path d="M6 70h108" className="art-line art-line--soft" />
    </>
  ),
  flowtime: (
    <>
      <path d="M8 48c14-14 26 14 40 0s26 14 40 0 18 6 24 2" className="art-line art-line--thick art-line--2" />
      <circle cx="96" cy="30" r="13" className="art-fill-1" />
      <path d="M96 22v8l5 3M96 15v-3" className="art-line" />
      <path d="M14 66c12-8 24 8 36 0" className="art-line art-line--soft" />
    </>
  ),
  kaizen: (
    <>
      <path d="M12 76h16v-10h16v-10h16v-10h16v-10h16v-10h16" className="art-line art-line--thick" />
      <circle cx="100" cy="16" r="6" className="art-fill-2" />
      <path d="M28 76v-10M44 66v-10M60 56v-10M76 46v-10M92 36v-10" className="art-line art-line--soft" />
    </>
  ),
  shuhari: (
    <>
      <circle cx="34" cy="45" r="16" className="art-fill-1" />
      <path d="M62 30a16 16 0 1 1 0 30" className="art-line art-line--thick art-line--2" />
      <path d="M92 45a14 14 0 1 0 14-14" className="art-line art-line--thick art-line--3" strokeDasharray="3 6" />
      <text x="34" y="81" className="art-text art-text--tiny">shu</text>
      <text x="66" y="81" className="art-text art-text--tiny">ha</text>
      <text x="96" y="81" className="art-text art-text--tiny">ri</text>
    </>
  ),
  feynman: (
    <>
      <path d="M14 18h66a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H40l-14 12v-12H14a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z" className="art-fill-3" />
      <circle cx="47" cy="34" r="9" className="art-fill-1" />
      <path d="M43 44h8M44 48h6" className="art-line" />
      <path d="M96 22l8-6M100 36h10M96 50l8 6" className="art-line art-line--2" />
    </>
  ),
  'active-recall': (
    <>
      <rect x="20" y="26" width="52" height="36" rx="5" className="art-fill-3" transform="rotate(-8 46 44)" />
      <rect x="28" y="22" width="52" height="36" rx="5" className="art-fill-1" />
      <path d="M40 36h28M40 44h18" className="art-line" />
      <path d="M92 26a18 18 0 1 1-6 30" className="art-line art-line--2" />
      <path d="M84 50l2 7 7-2" className="art-line art-line--2" />
    </>
  ),
  cornell: (
    <>
      <rect x="24" y="8" width="72" height="76" rx="4" className="art-paper" />
      <path d="M46 8v58M24 66h72" className="art-line art-line--2" />
      <path d="M30 22h10M30 32h10M52 20h36M52 28h30M52 36h36M52 44h22M30 74h50" className="art-line art-line--soft" />
    </>
  ),
  sq3r: (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={10 + i * 21} y={60 - i * 10} width="18" height={14 + i * 10} rx="4" className={`art-fill-${(i % 3) + 1}`} />
      ))}
      <circle cx="96" cy="16" r="8" className="art-line" />
      <path d="M102 22l7 7" className="art-line" />
    </>
  ),
  blurting: (
    <>
      <rect x="14" y="14" width="44" height="62" rx="4" className="art-paper" />
      <path d="M20 26c6-4 10 4 16 0s10 4 16 0M20 38c8 3 12-3 20 0s8 2 12 0M20 50c5-3 9 3 14 0" className="art-line art-line--2" />
      <rect x="64" y="14" width="44" height="62" rx="4" className="art-fill-3" />
      <path d="M72 30h28M72 40h22M72 50h28" className="art-line art-line--soft" />
      <path d="M58 45h6" className="art-line" />
    </>
  ),
  'time-blocking': (
    <>
      <rect x="16" y="8" width="88" height="76" rx="6" className="art-paper" />
      <rect x="30" y="16" width="66" height="14" rx="4" className="art-fill-1" />
      <rect x="30" y="34" width="66" height="22" rx="4" className="art-fill-2" />
      <rect x="30" y="60" width="66" height="16" rx="4" className="art-fill-3" />
      <path d="M20 22h6M20 44h6M20 68h6" className="art-line art-line--soft" />
    </>
  ),
  eisenhower: (
    <>
      <rect x="22" y="8" width="37" height="36" rx="4" className="art-fill-1" />
      <rect x="61" y="8" width="37" height="36" rx="4" className="art-fill-2" />
      <rect x="22" y="46" width="37" height="36" rx="4" className="art-fill-3" />
      <rect x="61" y="46" width="37" height="36" rx="4" className="art-paper" />
      <path d="M34 26l4 4 8-9" className="art-line" />
    </>
  ),
};

export default function MethodArt({ id, className = '' }) {
  return (
    <svg className={`method-art ${className}`} viewBox="0 0 120 90" aria-hidden="true" focusable="false">
      {ART[id]}
    </svg>
  );
}
