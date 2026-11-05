import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteTask, setActiveTask, toggleTaskDone, updateTask } from '../../store/tasksSlice';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import Icon from '../../components/Icon';

/**
 * Turn a word into a swatch number from 1 to 6, always the same for the same
 * word, so every task with the same subject gets the same color.
 */
export function swatchFor(text) {
  let hash = 0;
  for (const char of text.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return (hash % 6) + 1;
}

export default function TaskItem({ task, active }) {
  const dispatch = useDispatch();
  const { voice } = useCurrentTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  const startEditing = () => {
    setDraft(task.title);
    setEditing(true);
  };

  const save = () => {
    const title = draft.trim();
    if (title && title !== task.title) dispatch(updateTask({ id: task.id, changes: { title } }));
    setEditing(false);
  };

  // Show at least as many marks as the estimate, more if it ran over.
  const marks = Math.min(12, Math.max(task.estimate, task.pomodoros));

  return (
    <li
      className={`task${task.done ? ' is-done' : ''}${active ? ' is-active' : ''}`}
      data-swatch={swatchFor(task.subject || task.title)}
    >
      <button
        type="button"
        className="task__check"
        aria-pressed={task.done}
        aria-label={`Mark “${task.title}” as ${task.done ? 'not done' : 'done'}`}
        onClick={() => dispatch(toggleTaskDone(task.id))}
      >
        {task.done && <Icon name="check" />}
      </button>

      <div className="task__body">
        {editing ? (
          <input
            className="input task__edit"
            value={draft}
            maxLength={120}
            aria-label="Edit task name"
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onBlur={save}
            onKeyDown={(event) => {
              if (event.key === 'Enter') save();
              if (event.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <span className="task__title">{task.title}</span>
        )}
        <span className="task__meta">
          {task.subject && <span className="task__subject">{task.subject}</span>}
          <span className="task__poms" role="img" aria-label={`${task.pomodoros} of ${task.estimate} pomodoros done`}>
            {Array.from({ length: marks }, (_, i) => (
              <span key={i} className={i < task.pomodoros ? 'task__pom is-filled' : 'task__pom'} />
            ))}
          </span>
          {active && <span className="task__now">{voice.tasks.activeLabel}</span>}
        </span>
      </div>

      <div className="task__actions">
        {!task.done && (
          <button
            type="button"
            className="task__btn"
            aria-pressed={active}
            aria-label={active ? voice.tasks.stopFocus : voice.tasks.focusOn}
            title={active ? voice.tasks.stopFocus : voice.tasks.focusOn}
            onClick={() => dispatch(setActiveTask(active ? null : task.id))}
          >
            <Icon name="target" />
          </button>
        )}
        <button type="button" className="task__btn" aria-label={`Rename “${task.title}”`} title="Rename" onClick={startEditing}>
          <Icon name="pencil" />
        </button>
        <button
          type="button"
          className="task__btn"
          aria-label={`Delete “${task.title}”`}
          title="Delete"
          onClick={() => dispatch(deleteTask(task.id))}
        >
          <Icon name="trash" />
        </button>
      </div>
    </li>
  );
}
