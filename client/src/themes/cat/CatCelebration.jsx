// A little cat trots across the bottom of the screen, leaving paw prints,
// while a few hearts float up. Purely decorative.

const STEPS = 12;

export default function CatCelebration() {
  return (
    <div className="celebration cat-parade" aria-hidden="true">
      {Array.from({ length: STEPS }, (_, i) => (
        <svg
          key={i}
          className="cat-parade__paw"
          viewBox="0 0 24 24"
          style={{
            left: `${6 + i * 7.6}%`,
            bottom: i % 2 ? '7%' : '11%',
            animationDelay: `${i * 0.18}s`,
          }}
        >
          <ellipse cx="12" cy="15" rx="5" ry="4.2" />
          <ellipse cx="5.6" cy="9.4" rx="2" ry="2.6" />
          <ellipse cx="9.6" cy="5.4" rx="2" ry="2.6" />
          <ellipse cx="14.4" cy="5.4" rx="2" ry="2.6" />
          <ellipse cx="18.4" cy="9.4" rx="2" ry="2.6" />
        </svg>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <svg
          key={`h${i}`}
          className="cat-parade__heart"
          viewBox="0 0 24 24"
          style={{ left: `${18 + i * 12}%`, animationDelay: `${0.4 + i * 0.35}s` }}
        >
          <path d="M12 20s-7-4.4-7-9.4A3.8 3.8 0 0 1 12 8.4a3.8 3.8 0 0 1 7 2.2c0 5-7 9.4-7 9.4z" />
        </svg>
      ))}
    </div>
  );
}
