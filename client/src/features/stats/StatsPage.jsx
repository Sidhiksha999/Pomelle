import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearHistory } from '../../store/statsSlice';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import { routeHref } from '../../components/hooks/useHashRoute';
import { swatchFor } from '../tasks/TaskItem';
import WeeklyChart from './WeeklyChart';
import { computeStats, formatMinutes } from './statsMath';
import './stats.css';

export default function StatsPage() {
  const dispatch = useDispatch();
  const theme = useCurrentTheme();
  const sessions = useSelector((s) => s.stats.sessions);
  const tasksDone = useSelector((s) => s.tasks.items.filter((t) => t.done).length);
  const copy = theme.voice.stats;

  // Recompute only when the session log changes.
  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const topSubject = stats.subjects[0]?.minutes || 1;

  const onClear = () => {
    if (window.confirm(copy.clearConfirm)) dispatch(clearHistory());
  };

  return (
    <section className="stats-page" aria-labelledby="stats-title">
      <header className="stats-hero">
        <div className="stats-hero__text">
          <h1 id="stats-title">{copy.title}</h1>
          {copy.intro && <p className="stats-hero__intro">{copy.intro}</p>}
        </div>
        <p className="stats-streak">
          <span className="stats-streak__number">{stats.streak}</span>
          <span className="stats-streak__label">{copy.streak}</span>
        </p>
      </header>

      {sessions.length === 0 ? (
        <div className="card stats-empty">
          <p>{copy.empty}</p>
          <a className="btn btn--primary" href={routeHref('timer')}>
            {theme.voice.start}
          </a>
        </div>
      ) : (
        <>
          <dl className="stats-figures">
            <div className="stats-figure">
              <dt>{copy.hours}</dt>
              <dd>{(stats.totalMinutes / 60).toFixed(1)}</dd>
            </div>
            <div className="stats-figure">
              <dt>{copy.today}</dt>
              <dd>{stats.todayCount}</dd>
            </div>
            <div className="stats-figure">
              <dt>{copy.week}</dt>
              <dd>{formatMinutes(stats.weekMinutes)}</dd>
            </div>
            <div className="stats-figure">
              <dt>{copy.tasksDone}</dt>
              <dd>{tasksDone}</dd>
            </div>
          </dl>

          <div className="stats-grid">
            <section className="card stats-card stats-card--chart" aria-labelledby="chart-heading">
              <h2 id="chart-heading">{copy.chartTitle}</h2>
              <WeeklyChart days={stats.week} variant={theme.chart} title={copy.chartTitle} />
            </section>

            <section className="card stats-card stats-card--subjects" aria-labelledby="subjects-heading">
              <h2 id="subjects-heading">{copy.subjectsTitle}</h2>
              <ul className="subject-list">
                {stats.subjects.map((s) => (
                  <li key={s.name || '__none'} className="subject-row" data-swatch={swatchFor(s.name || copy.unsorted)}>
                    <span className="subject-row__name">{s.name || copy.unsorted}</span>
                    <span className="subject-row__time">{formatMinutes(s.minutes)}</span>
                    <span className="subject-row__track" aria-hidden="true">
                      <span className="subject-row__bar" style={{ width: `${(s.minutes / topSubject) * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <button type="button" className="btn btn--small btn--quiet stats-clear" onClick={onClear}>
            {copy.clear}
          </button>
        </>
      )}
    </section>
  );
}
