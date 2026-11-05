// The quietest celebration: a single hairline fades in and out at the top.

export default function MinimalCelebration() {
  return (
    <div className="celebration min-celebration" aria-hidden="true">
      <span className="min-celebration__line" />
    </div>
  );
}
