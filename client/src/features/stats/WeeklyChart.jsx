import { formatMinutes } from './statsMath';

// A hand-drawn SVG bar chart of the last seven days. Each theme picks a bar
// style (theme.chart):
//   chunky   → Jolly: sticker bars with a hard ink shadow
//   lipstick → Makeup: each bar is a lipstick, the bullet rises with the time
//   paws     → Cat: soft pill bars topped with a paw print
//   hatched  → Aesthetic: pencil-hatched bars
//   line     → Minimalist: hairline outlines

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 34, right: 12, bottom: 36, left: 12 };
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;
const COL_W = (WIDTH - PAD.left - PAD.right) / 7;

/** Round the top of the scale up to a tidy number (at least one hour). */
function niceMax(maxMinutes) {
  const step = maxMinutes > 240 ? 60 : 30;
  return Math.max(60, Math.ceil(maxMinutes / step) * step);
}

function Bar({ variant, x, y, w, h, index, isToday }) {
  const bottom = y + h;
  switch (variant) {
    case 'chunky':
      return (
        <g className={`chart-bar chart-bar--chunky series-${(index % 6) + 1}`}>
          <rect x={x + 4} y={y + 4} width={w} height={h} rx="9" className="chart-bar__shadow" />
          <rect x={x} y={y} width={w} height={h} rx="9" className="chart-bar__fill" />
        </g>
      );
    case 'lipstick': {
      // The tube is fixed at the bottom; the bullet fills the rest with a slanted tip.
      const tube = Math.min(h, 24);
      const tubeTop = bottom - tube;
      const tip = Math.min(10, Math.max(0, h - tube));
      const inset = w * 0.14;
      return (
        <g className={`chart-bar chart-bar--lipstick${isToday ? ' is-today' : ''}`}>
          {h > tube && (
            <path
              className="chart-bar__bullet"
              d={`M${x + inset} ${tubeTop} V${y + tip} L${x + w - inset} ${y} V${tubeTop} Z`}
            />
          )}
          <rect x={x} y={tubeTop} width={w} height={tube} rx="3" className="chart-bar__tube" />
        </g>
      );
    }
    case 'paws': {
      const cx = x + w / 2;
      return (
        <g className={`chart-bar chart-bar--paws${isToday ? ' is-today' : ''}`}>
          <rect x={x} y={y} width={w} height={h} rx={Math.min(w / 2, h / 2)} className="chart-bar__fill" />
          <g transform={`translate(${cx - 12} ${y - 28})`} className="chart-bar__paw">
            <ellipse cx="12" cy="15" rx="5" ry="4.2" />
            <ellipse cx="5.6" cy="9.4" rx="2" ry="2.6" />
            <ellipse cx="9.6" cy="5.4" rx="2" ry="2.6" />
            <ellipse cx="14.4" cy="5.4" rx="2" ry="2.6" />
            <ellipse cx="18.4" cy="9.4" rx="2" ry="2.6" />
          </g>
        </g>
      );
    }
    case 'hatched':
      return (
        <g className={`chart-bar chart-bar--hatched${isToday ? ' is-today' : ''}`}>
          <rect x={x} y={y} width={w} height={h} fill="url(#chart-hatch)" className="chart-bar__fill" />
        </g>
      );
    default:
      return (
        <rect
          x={x + 0.5}
          y={y + 0.5}
          width={w - 1}
          height={Math.max(0, h - 1)}
          className={`chart-bar chart-bar--line${isToday ? ' is-today' : ''}`}
        />
      );
  }
}

export default function WeeklyChart({ days, variant, title }) {
  const max = niceMax(Math.max(...days.map((d) => d.minutes)));
  const barW = COL_W * (variant === 'line' ? 0.36 : 0.52);
  const baseline = PAD.top + PLOT_H;
  const total = days.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <figure className={`weekly-chart weekly-chart--${variant}`}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby="weekly-chart-title weekly-chart-desc"
      >
        <title id="weekly-chart-title">{title}</title>
        <desc id="weekly-chart-desc">
          {`${formatMinutes(total)} of focus over the last seven days. ` +
            days.map((d) => `${d.fullLabel}: ${formatMinutes(d.minutes)}`).join(', ')}
        </desc>
        <defs>
          <pattern id="chart-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <line x1="0" y1="0" x2="0" y2="7" className="chart-hatch-line" />
          </pattern>
          <linearGradient id="chart-bullet" x1="0" x2="1">
            <stop offset="0" stopColor="#6e2039" />
            <stop offset="0.45" stopColor="#a23a5d" />
            <stop offset="1" stopColor="#7d2944" />
          </linearGradient>
        </defs>

        {/* scale: a dashed line at the top value, and the baseline */}
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={PAD.top} y2={PAD.top} className="chart-grid chart-grid--top" />
        <text x={WIDTH - PAD.right} y={PAD.top - 8} textAnchor="end" className="chart-scale">
          {formatMinutes(max)}
        </text>
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={baseline} y2={baseline} className="chart-grid" />

        {days.map((day, i) => {
          const h = day.minutes > 0 ? Math.max(6, (day.minutes / max) * PLOT_H) : 0;
          const x = PAD.left + i * COL_W + (COL_W - barW) / 2;
          const y = baseline - h;
          const cx = PAD.left + i * COL_W + COL_W / 2;
          return (
            <g key={day.key} className={day.isToday ? 'chart-day is-today' : 'chart-day'} style={{ '--i': i }}>
              {h > 0 && <Bar variant={variant} x={x} y={y} w={barW} h={h} index={i} isToday={day.isToday} />}
              {day.minutes > 0 && (
                <text x={cx} y={y - (variant === 'paws' ? 34 : 8)} textAnchor="middle" className="chart-value">
                  {formatMinutes(day.minutes)}
                </text>
              )}
              <text x={cx} y={HEIGHT - 10} textAnchor="middle" className="chart-label">
                {day.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
