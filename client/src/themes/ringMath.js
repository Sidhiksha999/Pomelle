// Little geometry helpers shared by the timer faces.

/**
 * Dash settings that make an SVG circle look like a progress arc.
 * A dash as long as the whole circle, pushed back by the part not done yet.
 */
export function circleDash(radius, progress) {
  const circumference = 2 * Math.PI * radius;
  return {
    strokeDasharray: circumference,
    strokeDashoffset: circumference * (1 - progress),
  };
}

/**
 * A point on a circle. `fraction` 0 is 12 o'clock and goes clockwise,
 * so 0.25 is 3 o'clock, 0.5 is 6 o'clock and so on.
 */
export function pointOnCircle(cx, cy, radius, fraction) {
  const angle = fraction * Math.PI * 2;
  return {
    x: cx + radius * Math.sin(angle),
    y: cy - radius * Math.cos(angle),
  };
}
