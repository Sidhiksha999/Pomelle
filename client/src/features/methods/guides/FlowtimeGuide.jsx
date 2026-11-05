import { useState } from 'react';
import MethodTimer from '../MethodTimer';

/** Rest is about a fifth of the time you worked, never less than 5 minutes. */
const restFor = (minutesWorked) => Math.max(5, Math.round(minutesWorked / 5));

/**
 * Flowtime: a stopwatch for work. When focus fades you stop it, and the
 * break is sized to match how long you went.
 */
export default function FlowtimeGuide() {
  const [phase, setPhase] = useState('work'); // 'work' | 'rest'
  const [restMinutes, setRestMinutes] = useState(5);
  const [log, setLog] = useState([]); // [{ worked, rested }]

  const onWorkStopped = (minutes) => {
    const worked = Math.round(minutes); // 0 means under a minute (not added to stats)
    setRestMinutes(restFor(worked));
    setLog((entries) => [...entries, { worked, rested: restFor(worked) }]);
    setPhase('rest');
  };

  return (
    <div className="guide guide--flowtime">
      <h2>{phase === 'work' ? 'Work until your focus fades' : 'Rest, you earned it'}</h2>
      <p className="guide__tip">
        {phase === 'work'
          ? 'Start the stopwatch and stay with one task. When you catch your mind wandering, press “I’m losing focus”.'
          : `You focused for ${log.at(-1)?.worked || 'less than a'} minute${log.at(-1)?.worked === 1 ? '' : 's'}, so rest for about ${restMinutes}. Get up and move.`}
      </p>

      {phase === 'work' ? (
        <MethodTimer key="work" countUp label="Flow" countsAsFocus stopLabel="I’m losing focus" onDone={onWorkStopped} />
      ) : (
        <>
          <MethodTimer key={`rest-${log.length}`} minutes={restMinutes} label="Rest" onDone={() => setPhase('work')} />
          <button type="button" className="btn btn--small btn--quiet" onClick={() => setPhase('work')}>
            Skip the rest and flow again
          </button>
        </>
      )}

      {log.length > 0 && (
        <div className="guide__log">
          <h3>This session</h3>
          <ol>
            {log.map((entry, i) => (
              <li key={i}>
                Flow {i + 1}: {entry.worked > 0 ? `${entry.worked} min` : 'under a minute of'} focus → {entry.rested} min rest
              </li>
            ))}
          </ol>
          <p className="guide__note">
            Total focus: {log.reduce((sum, e) => sum + e.worked, 0)} minutes (added to your stats).
          </p>
        </div>
      )}
    </div>
  );
}
