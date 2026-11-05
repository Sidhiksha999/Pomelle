import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, clearCompleted } from '../../store/tasksSlice';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import Icon from '../../components/Icon';
import TaskItem from './TaskItem';
import './tasks.css';

/**
 * The task list next to the timer. Pick a task with the target button and
 * every focus session you finish is credited to it.
 */
export default function TaskList() {
  const dispatch = useDispatch();
  const { voice } = useCurrentTheme();
  const { items, activeId } = useSelector((s) => s.tasks);
  const pastSessions = useSelector((s) => s.stats.sessions);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [estimate, setEstimate] = useState(1);

  // Subjects you've used before, offered as suggestions while typing.
  const knownSubjects = useMemo(() => {
    const all = [...items.map((t) => t.subject), ...pastSessions.map((s) => s.subject)];
    return [...new Set(all.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [items, pastSessions]);

  // Unfinished tasks first, finished ones sink to the bottom.
  const ordered = [...items.filter((t) => !t.done), ...items.filter((t) => t.done)];
  const doneCount = items.length - items.filter((t) => !t.done).length;

  const onSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    dispatch(addTask({ title, subject, estimate }));
    setTitle('');
    setEstimate(1);
    // The subject is kept, since several tasks in a row often share one.
  };

  return (
    <section className="card task-list" aria-labelledby="task-list-title">
      <div className="task-list__head">
        <h2 id="task-list-title">{voice.tasks.title}</h2>
        {items.length > 0 && (
          <span className="task-list__count">
            {items.length - doneCount}/{items.length}
          </span>
        )}
      </div>

      <form className="task-form" onSubmit={onSubmit}>
        <label className="visually-hidden" htmlFor="task-title">
          New task
        </label>
        <input
          id="task-title"
          className="input task-form__title"
          value={title}
          maxLength={120}
          placeholder={voice.tasks.placeholder}
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className="task-form__row">
          <label className="visually-hidden" htmlFor="task-subject">
            Subject
          </label>
          <input
            id="task-subject"
            className="input task-form__subject"
            value={subject}
            maxLength={40}
            list="task-subjects"
            placeholder={voice.tasks.subjectPlaceholder}
            onChange={(event) => setSubject(event.target.value)}
          />
          <datalist id="task-subjects">
            {knownSubjects.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <label className="task-form__estimate">
            <span className="visually-hidden">{voice.tasks.estimateLabel}</span>
            <input
              className="input"
              type="number"
              min="1"
              max="12"
              value={estimate}
              onChange={(event) => setEstimate(Math.min(12, Math.max(1, Number(event.target.value) || 1)))}
            />
            <span className="task-form__hint" aria-hidden="true">
              <Icon name="target" />
            </span>
          </label>
          <button type="submit" className="btn btn--primary btn--small" disabled={!title.trim()}>
            <Icon name="plus" />
            {voice.tasks.add}
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="task-list__empty">{voice.tasks.empty}</p>
      ) : (
        <ul className="task-list__items">
          {ordered.map((task) => (
            <TaskItem key={task.id} task={task} active={task.id === activeId} />
          ))}
        </ul>
      )}

      {doneCount > 0 && (
        <button type="button" className="btn btn--small btn--quiet task-list__clear" onClick={() => dispatch(clearCompleted())}>
          {voice.tasks.clearDone}
        </button>
      )}
    </section>
  );
}
