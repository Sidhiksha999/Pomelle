import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addKaizenStep, updateKaizenStep } from '../../../store/methodsSlice';
import { dayKey } from '../../stats/statsMath';
import Icon from '../../../components/Icon';
import MethodTimer from '../MethodTimer';

/** Days in a row (ending today or yesterday) with a finished Kaizen step. */
function kaizenStreak(entries) {
  const doneDays = new Set(entries.filter((e) => e.done).map((e) => e.day));
  const day = new Date();
  if (!doneDays.has(dayKey(day.getTime()))) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (doneDays.has(dayKey(day.getTime()))) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

/** Kaizen: one tiny step today, ten minutes on it, one note to do 1% better tomorrow. */
export default function KaizenGuide() {
  const dispatch = useDispatch();
  const entries = useSelector((s) => s.methods.kaizen);
  const today = dayKey(Date.now());
  const todays = entries.find((e) => e.day === today);
  const [step, setStep] = useState('');
  const streak = kaizenStreak(entries);
  const yesterdayTip = entries.find((e) => e.day !== today && e.better)?.better;

  const update = (changes) => dispatch(updateKaizenStep({ id: todays.id, changes }));

  return (
    <div className="guide guide--kaizen">
      <div className="kaizen-streak">
        <span className="kaizen-streak__number">{streak}</span>
        <span>{streak === 1 ? 'day' : 'days'} in a row</span>
      </div>

      {!todays ? (
        <form
          className="guide__form"
          onSubmit={(event) => {
            event.preventDefault();
            if (step.trim()) dispatch(addKaizenStep({ day: today, step: step.trim() }));
          }}
        >
          {yesterdayTip && (
            <p className="guide__note">
              Last time you said you could do better by: <em>{yesterdayTip}</em>
            </p>
          )}
          <label className="field__label" htmlFor="kaizen-step">
            Today’s tiny step (so small it feels almost silly)
          </label>
          <input
            id="kaizen-step"
            className="input"
            maxLength={120}
            placeholder="e.g. Read one page of chapter 3"
            value={step}
            onChange={(event) => setStep(event.target.value)}
          />
          <button type="submit" className="btn btn--primary" disabled={!step.trim()}>
            Commit to it
          </button>
        </form>
      ) : (
        <div className="guide__form">
          <p className="kaizen-today">
            Today: <strong>{todays.step}</strong>
          </p>
          <MethodTimer minutes={10} label="Just 10 minutes" countsAsFocus onDone={() => update({ done: true })} />
          <label className="kaizen-done">
            <input type="checkbox" checked={todays.done} onChange={(event) => update({ done: event.target.checked })} />
            I did my tiny step today
          </label>
          <label className="field__label" htmlFor="kaizen-better">
            Tomorrow I could be 1% better by…
          </label>
          <textarea
            id="kaizen-better"
            className="input"
            rows={2}
            maxLength={200}
            value={todays.better}
            onChange={(event) => update({ better: event.target.value })}
          />
        </div>
      )}

      {entries.length > 1 && (
        <div className="guide__log">
          <h3>Recent steps</h3>
          <ul>
            {entries
              .filter((e) => e.day !== today)
              .slice(0, 7)
              .map((e) => (
                <li key={e.id} className={e.done ? 'is-done' : ''}>
                  <span className="guide__log-date">{e.day}</span>
                  {e.done ? <Icon name="check" label="done" /> : <span className="visually-hidden">not done</span>}
                  {e.step}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
