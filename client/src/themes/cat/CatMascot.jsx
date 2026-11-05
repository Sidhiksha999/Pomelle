// The resident cat. Her pose follows the timer:
//   sleep   → paused or waiting: head down, slow breathing, little z's
//   stretch → right after you press start (a long front-paw stretch)
//   awake   → focus running: sitting up, blinking, tail swishing
//   purr    → break running: happy eyes, gentle purr vibration
//   curled  → a session just finished: curled into a cozy ball

function LoafCat({ pose }) {
  const eyes =
    pose === 'awake' || pose === 'stretch' ? (
      <g className="cat-eyes">
        <ellipse cx="45" cy="64" rx="3.8" ry="5" className="cat-ink" />
        <ellipse cx="67" cy="64" rx="3.8" ry="5" className="cat-ink" />
        <circle cx="46.4" cy="62.2" r="1.3" fill="#fff" />
        <circle cx="68.4" cy="62.2" r="1.3" fill="#fff" />
      </g>
    ) : pose === 'purr' ? (
      <path d="M40 65q5-6 10 0M62 65q5-6 10 0" className="cat-line" />
    ) : (
      <path d="M40 64q5 5 10 0M62 64q5 5 10 0" className="cat-line" />
    );

  return (
    <>
      {/* tail first so the body overlaps it */}
      {pose === 'sleep' ? (
        <path d="M132 104c10 14-36 20-68 13" className="cat-tail cat-tail--wrapped" />
      ) : (
        <path d="M130 100c24-2 30-32 12-42" className="cat-tail" />
      )}
      <ellipse cx="88" cy="92" rx="50" ry="27" className="cat-body" />
      <path d="M78 68q5 8 0 14M93 66q5 8 0 15M108 69q5 8 0 14" className="cat-stripe" />
      {pose !== 'sleep' && (
        <>
          <ellipse cx="54" cy="114" rx="11" ry="6.5" className="cat-body" />
          <ellipse cx="76" cy="116" rx="11" ry="6.5" className="cat-body" />
        </>
      )}
      <g className="cat-head">
        <path d="M30 58 34 30l19 16z" className="cat-body" />
        <path d="M60 46l19-16 3 28z" className="cat-body" />
        <path d="M35 46l2-9 8 7z" className="cat-ear-inner" />
        <path d="M68 44l8-7 2 9z" className="cat-ear-inner" />
        <circle cx="56" cy="67" r="28" className="cat-body" />
        <path d="M50 44q6 4 12 0" className="cat-stripe" />
        {eyes}
        <ellipse cx="38" cy="76" rx="5" ry="3" className="cat-blush" />
        <ellipse cx="74" cy="76" rx="5" ry="3" className="cat-blush" />
        <path d="M52.5 72h7l-3.5 4z" className="cat-nose" />
        <path d="M56 76q-3 4-7 2M56 76q3 4 7 2" className="cat-line cat-line--thin" />
        <path d="M30 71H15M31 76l-13 4M82 71h15M81 76l13 4" className="cat-whisker" />
      </g>
      {pose === 'purr' && (
        <g className="cat-purr-lines">
          <path d="M14 46q-6 6 0 12" />
          <path d="M6 42q-8 10 0 20" />
        </g>
      )}
      {pose === 'sleep' && (
        <g className="cat-z">
          <text x="92" y="38">z</text>
          <text x="104" y="22">z</text>
        </g>
      )}
    </>
  );
}

function CurledCat() {
  return (
    <>
      <circle cx="86" cy="88" r="36" className="cat-body" />
      <path d="M70 60q6 6 4 14M92 54q6 7 3 15M110 64q4 8 0 15" className="cat-stripe" />
      <g className="cat-head cat-head--tucked">
        <path d="M44 72l2-20 14 10z" className="cat-body" />
        <path d="M66 60l14-8 0 18z" className="cat-body" />
        <circle cx="62" cy="84" r="22" className="cat-body" />
        <path d="M50 84q4 4 8 0M66 84q4 4 8 0" className="cat-line" />
        <path d="M59 91h5l-2.5 3z" className="cat-nose" />
        <ellipse cx="50" cy="92" rx="4" ry="2.4" className="cat-blush" />
        <ellipse cx="74" cy="92" rx="4" ry="2.4" className="cat-blush" />
      </g>
      <path d="M40 104c18 22 76 22 84-8" className="cat-tail" />
      <path d="M112 30c0-6 8-6 8 0 0-6 8-6 8 0 0 6-8 10-8 12 0-2-8-6-8-12z" className="cat-heart" />
    </>
  );
}

export default function CatMascot({ pose }) {
  return (
    <div className="cat-mascot" data-pose={pose} aria-hidden="true">
      <svg viewBox="0 0 160 130">{pose === 'curled' ? <CurledCat /> : <LoafCat pose={pose} />}</svg>
    </div>
  );
}
