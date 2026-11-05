import { useDispatch, useSelector } from 'react-redux';
import { updateSettings } from '../../../store/timerSlice';
import Icon from '../../../components/Icon';
import { applyRhythm } from '../applyRhythm';

const TIPS = {
  pomodoro: 'Before you start, pick the one task this tomato is for. If a thought pops up, jot it down and get back to work.',
  '52-17': 'The 17-minute break is the secret. Leave your desk, and don’t replace work with your phone.',
  ultradian: 'Plan just three or four cycles a day. When you notice yawning or a wandering mind near the end, that’s the wave ending: rest.',
};

/** For methods that are a timer rhythm: set the main timer to it and go. */
export default function RhythmGuide({ method }) {
  const dispatch = useDispatch();
  const { rhythm } = method;
  const activeTask = useSelector((s) => s.tasks.items.find((t) => t.id === s.tasks.activeId));

  return (
    <div className="guide guide--rhythm">
      <h2>Your rhythm</h2>
      <div className="rhythm">
        <div className="rhythm__part">
          <span className="rhythm__number">{rhythm.focusMinutes}</span>
          <span className="rhythm__label">minutes focus</span>
        </div>
        <span className="rhythm__plus" aria-hidden="true">
          +
        </span>
        <div className="rhythm__part">
          <span className="rhythm__number">{rhythm.shortMinutes}</span>
          <span className="rhythm__label">minutes break</span>
        </div>
        {rhythm.longBreakEvery < 12 && (
          <p className="rhythm__long">
            and a {rhythm.longMinutes}-minute break after every {rhythm.longBreakEvery} rounds
          </p>
        )}
      </div>

      <p className="guide__tip">{TIPS[method.id]}</p>
      {activeTask && (
        <p className="guide__note">
          Sessions will count toward <strong>{activeTask.title}</strong>.
        </p>
      )}

      <div className="guide__actions">
        <button type="button" className="btn btn--primary" onClick={() => dispatch(applyRhythm(rhythm))}>
          <Icon name="play" filled />
          Use this rhythm and start
        </button>
        <button type="button" className="btn btn--small btn--quiet" onClick={() => dispatch(updateSettings(rhythm))}>
          Only change my timer settings
        </button>
      </div>
    </div>
  );
}
