import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBlock, deleteBlock, updateBlock } from '../../../store/methodsSlice';
import { useNow } from '../../../components/hooks/useNow';
import Icon from '../../../components/Icon';
import { dayKey } from '../../stats/statsMath';
import { applyRhythm } from '../applyRhythm';

const PX_PER_MINUTE = 1.1;
const NO_BLOCKS = []; // one shared empty list, so the selector result stays stable
const DURATIONS = [15, 25, 30, 45, 50, 60, 90, 120];

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toClock = (minutes) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** Time-blocking: plan today as blocks on a timeline, then work block by block. */
export default function TimeBlockGuide() {
  const dispatch = useDispatch();
  const timerSettings = useSelector((s) => s.timer.settings);
  const today = dayKey(Date.now());
  const blocks = useSelector((s) => s.methods.blocks[today] || NO_BLOCKS);
  const now = useNow(60000);
  const nowMinutes = new Date(now).getHours() * 60 + new Date(now).getMinutes();

  const nextFree = blocks.length ? toClock(Math.max(...blocks.map((b) => toMinutes(b.start) + b.minutes))) : toClock(Math.ceil(nowMinutes / 15) * 15);
  const [label, setLabel] = useState('');
  const [start, setStart] = useState(nextFree);
  const [minutes, setMinutes] = useState(50);

  // The visible part of the day: from the earliest block (or 8:00) to the latest (or 18:00).
  const dayStart = Math.min(8 * 60, ...blocks.map((b) => toMinutes(b.start))) - 30;
  const dayEnd = Math.max(18 * 60, ...blocks.map((b) => toMinutes(b.start) + b.minutes)) + 30;
  const hours = [];
  for (let m = Math.ceil(dayStart / 60) * 60; m <= dayEnd; m += 60) hours.push(m);

  const overlaps = blocks.some((a, i) =>
    blocks.some((b, j) => i < j && toMinutes(a.start) < toMinutes(b.start) + b.minutes && toMinutes(b.start) < toMinutes(a.start) + a.minutes),
  );

  const add = (event) => {
    event.preventDefault();
    if (!label.trim()) return;
    dispatch(addBlock({ day: today, start, minutes, label: label.trim() }));
    setLabel('');
    setStart(toClock(toMinutes(start) + minutes));
  };

  return (
    <div className="guide guide--blocks">
      <form className="block-form" onSubmit={add}>
        <div className="field block-form__label">
          <label className="field__label" htmlFor="block-label">
            Block
          </label>
          <input id="block-label" className="input" maxLength={60} placeholder="e.g. Biology problem set" value={label} onChange={(event) => setLabel(event.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="block-start">
            Starts
          </label>
          <input id="block-start" className="input" type="time" value={start} onChange={(event) => setStart(event.target.value || start)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="block-length">
            Length
          </label>
          <select id="block-length" className="input" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn--primary btn--small" disabled={!label.trim()}>
          <Icon name="plus" /> Add block
        </button>
      </form>

      {overlaps && <p className="guide__note">Two blocks overlap. Move one so each hour has a single job.</p>}
      {blocks.length === 0 && <p className="guide__note">No blocks yet. Start with your hardest task, early in the day, and leave gaps for breaks.</p>}

      <div className="timeline" style={{ height: (dayEnd - dayStart) * PX_PER_MINUTE }}>
        {hours.map((m) => (
          <div key={m} className="timeline__hour" style={{ top: (m - dayStart) * PX_PER_MINUTE }}>
            <span>{toClock(m)}</span>
          </div>
        ))}
        {nowMinutes > dayStart && nowMinutes < dayEnd && (
          <div className="timeline__now" style={{ top: (nowMinutes - dayStart) * PX_PER_MINUTE }} aria-label={`Now, ${toClock(nowMinutes)}`} />
        )}
        <ol className="timeline__blocks">
          {blocks.map((block, i) => {
            const top = (toMinutes(block.start) - dayStart) * PX_PER_MINUTE;
            const end = toMinutes(block.start) + block.minutes;
            return (
              <li
                key={block.id}
                className={`time-block series-${(i % 6) + 1}${block.done ? ' is-done' : ''}`}
                style={{ top, height: Math.max(34, block.minutes * PX_PER_MINUTE - 3) }}
              >
                <label className="time-block__check">
                  <input
                    type="checkbox"
                    checked={block.done}
                    onChange={(event) => dispatch(updateBlock({ day: today, id: block.id, changes: { done: event.target.checked } }))}
                  />
                  <span className="visually-hidden">Done</span>
                </label>
                <span className="time-block__text">
                  <span className="time-block__label">{block.label}</span>
                  <span className="time-block__time">
                    {block.start}–{toClock(end)} · {block.minutes} min
                  </span>
                </span>
                <span className="time-block__actions">
                  {!block.done && (
                    <button
                      type="button"
                      className="task__btn"
                      aria-label={`Start a ${block.minutes}-minute focus session for “${block.label}” (sets the timer’s focus length)`}
                      title="Start this block (sets the timer’s focus length)"
                      onClick={() => dispatch(applyRhythm(timerSettings, { focusMinutes: Math.min(180, block.minutes) }))}
                    >
                      <Icon name="play" filled />
                    </button>
                  )}
                  <button type="button" className="task__btn" aria-label={`Delete “${block.label}”`} onClick={() => dispatch(deleteBlock({ day: today, id: block.id }))}>
                    <Icon name="trash" />
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
