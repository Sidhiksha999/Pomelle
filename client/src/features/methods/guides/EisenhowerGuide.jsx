import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMatrixItem, clearDoneMatrixItems, deleteMatrixItem, updateMatrixItem } from '../../../store/methodsSlice';
import { addTask } from '../../../store/tasksSlice';
import Icon from '../../../components/Icon';

const QUADRANTS = [
  { id: 'do', name: 'Do first', hint: 'Urgent and important' },
  { id: 'schedule', name: 'Schedule', hint: 'Important, not urgent' },
  { id: 'delegate', name: 'Delegate or shrink', hint: 'Urgent, not important' },
  { id: 'drop', name: 'Drop', hint: 'Neither' },
];

/** Eisenhower matrix: sort everything on your mind into four boxes. */
export default function EisenhowerGuide() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.methods.matrix);
  const tasks = useSelector((s) => s.tasks.items);
  const taskTitles = tasks.map((t) => t.title);
  const [text, setText] = useState('');
  const [quadrant, setQuadrant] = useState('do');
  const [dragOver, setDragOver] = useState(null);

  const add = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    dispatch(addMatrixItem({ text: text.trim(), quadrant }));
    setText('');
  };

  const move = (id, to) => dispatch(updateMatrixItem({ id, changes: { quadrant: to } }));

  return (
    <div className="guide guide--matrix">
      <form className="guide__inline-form" onSubmit={add}>
        <label className="visually-hidden" htmlFor="matrix-text">
          Something on your mind
        </label>
        <input id="matrix-text" className="input" maxLength={100} placeholder="Something on your mind…" value={text} onChange={(event) => setText(event.target.value)} />
        <label className="visually-hidden" htmlFor="matrix-quadrant">
          Which box
        </label>
        <select id="matrix-quadrant" className="input matrix-select" value={quadrant} onChange={(event) => setQuadrant(event.target.value)}>
          {QUADRANTS.map((q) => (
            <option key={q.id} value={q.id}>
              {q.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn--small btn--primary" disabled={!text.trim()}>
          <Icon name="plus" /> Add
        </button>
      </form>
      <p className="guide__note">Drag items between boxes, or use each item’s menu.</p>

      <div className="matrix">
        <span className="matrix__axis matrix__axis--top" aria-hidden="true">
          urgent → not urgent
        </span>
        <span className="matrix__axis matrix__axis--side" aria-hidden="true">
          important → not important
        </span>
        {QUADRANTS.map((q) => {
          const inside = items.filter((i) => i.quadrant === q.id);
          return (
            <section
              key={q.id}
              className={`matrix__box matrix__box--${q.id}${dragOver === q.id ? ' is-over' : ''}`}
              aria-labelledby={`quad-${q.id}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(q.id);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(event) => {
                event.preventDefault();
                move(event.dataTransfer.getData('text/plain'), q.id);
                setDragOver(null);
              }}
            >
              <h3 id={`quad-${q.id}`}>
                {q.name}
                <span>{q.hint}</span>
              </h3>
              <ul>
                {inside.map((item) => {
                  const isTask = taskTitles.includes(item.text);
                  return (
                    <li
                      key={item.id}
                      className={`matrix-item${item.done ? ' is-done' : ''}`}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData('text/plain', item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        aria-label={`Mark “${item.text}” as done`}
                        onChange={(event) => dispatch(updateMatrixItem({ id: item.id, changes: { done: event.target.checked } }))}
                      />
                      <span className="matrix-item__text">{item.text}</span>
                      <select
                        className="matrix-item__move"
                        aria-label={`Move “${item.text}”`}
                        value={item.quadrant}
                        onChange={(event) => move(item.id, event.target.value)}
                      >
                        {QUADRANTS.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                      {(q.id === 'do' || q.id === 'schedule') && !item.done && (
                        <button
                          type="button"
                          className="task__btn"
                          disabled={isTask}
                          aria-label={isTask ? `“${item.text}” is already in your tasks` : `Add “${item.text}” to my tasks`}
                          title={isTask ? 'Already in your tasks' : 'Add to my tasks'}
                          onClick={() => dispatch(addTask({ title: item.text, subject: '', estimate: 1 }))}
                        >
                          <Icon name={isTask ? 'check' : 'target'} />
                        </button>
                      )}
                      <button type="button" className="task__btn" aria-label={`Delete “${item.text}”`} onClick={() => dispatch(deleteMatrixItem(item.id))}>
                        <Icon name="trash" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      {items.some((i) => i.done) && (
        <button type="button" className="btn btn--small btn--quiet" onClick={() => dispatch(clearDoneMatrixItems())}>
          Clear finished items
        </button>
      )}
    </div>
  );
}
