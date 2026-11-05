import { Brush, NailPolish, Palette, Perfume, Sparkle } from './MakeupArt';

// A vanity table scattered around the page edges: perfume, a brush,
// nail polish and an eyeshadow palette, with a few sparkles twinkling.

export default function MakeupBackdrop() {
  return (
    <div className="backdrop makeup-backdrop" aria-hidden="true">
      <span className="mk-blush-glow mk-blush-glow--1" />
      <span className="mk-blush-glow mk-blush-glow--2" />
      <Perfume className="mk-deco mk-deco--perfume" />
      <Brush className="mk-deco mk-deco--brush" />
      <NailPolish className="mk-deco mk-deco--polish" />
      <Palette className="mk-deco mk-deco--palette" />
      {[1, 2, 3, 4, 5].map((n) => (
        <Sparkle key={n} className={`mk-twinkle mk-twinkle--${n}`} />
      ))}
    </div>
  );
}
