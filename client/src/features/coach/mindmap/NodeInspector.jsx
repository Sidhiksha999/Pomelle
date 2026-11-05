import { useDispatch } from 'react-redux';
import { addChildNode, deleteNode, updateNode } from '../../../store/coachSlice';
import { useCurrentTheme } from '../../../components/hooks/useCurrentTheme';
import Icon from '../../../components/Icon';
import { startPomodoroOn } from '../startPomodoro';

/** The edit panel for the selected bubble. */
export default function NodeInspector({ map, nodeId, onSelect }) {
  const dispatch = useDispatch();
  const { voice } = useCurrentTheme();
  const node = map.nodes[nodeId];

  if (!node) {
    return (
      <aside className="card node-inspector node-inspector--empty">
        <p>Select a bubble to edit it, mark it done or start a Pomodoro on it.</p>
      </aside>
    );
  }

  const isRoot = node.id === map.rootId;
  const parent = map.nodes[node.parentId];
  const childCount = Object.values(map.nodes).filter((n) => n.parentId === node.id).length;
  const change = (changes) => dispatch(updateNode({ mapId: map.id, nodeId: node.id, changes }));

  const addChild = () => {
    const action = addChildNode({ mapId: map.id, parentId: node.id, text: isRoot ? 'New branch' : 'New topic' });
    dispatch(action);
    onSelect(action.payload.id);
  };

  const remove = () => {
    const sure = childCount === 0 || window.confirm(`Delete “${node.text}” and the ${childCount} bubble(s) under it?`);
    if (!sure) return;
    dispatch(deleteNode({ mapId: map.id, nodeId: node.id }));
    onSelect(node.parentId);
  };

  const startPomodoro = () => {
    // A topic's subject is its main branch; a branch is its own subject.
    const branch = isRoot || parent?.id === map.rootId ? node : parent;
    const taskId = dispatch(
      startPomodoroOn({ title: node.text, subject: (isRoot ? map.title : branch.text).slice(0, 40), existingTaskId: node.taskId }),
    );
    change({ taskId });
  };

  return (
    <aside className="card node-inspector" aria-labelledby="inspector-title">
      <h3 id="inspector-title" className="node-inspector__title">
        {isRoot ? 'Your goal' : parent?.id === map.rootId ? 'Branch' : 'Topic'}
      </h3>

      <div className="field">
        <label className="field__label" htmlFor="node-text">
          Text
        </label>
        <textarea
          id="node-text"
          className="input node-inspector__text"
          rows={2}
          maxLength={120}
          value={node.text}
          onChange={(event) => change({ text: event.target.value })}
        />
      </div>

      {!isRoot && (
        <div className="node-inspector__row">
          <div className="field">
            <label className="field__label" htmlFor="node-hours">
              Hours (estimate)
            </label>
            <input
              id="node-hours"
              className="input"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={node.hours}
              onChange={(event) => change({ hours: Math.max(0, Number(event.target.value) || 0) })}
            />
          </div>
          <label className="node-inspector__done">
            <input type="checkbox" checked={node.done} onChange={(event) => change({ done: event.target.checked })} />
            Done
          </label>
        </div>
      )}

      <div className="node-inspector__actions">
        <button type="button" className="btn btn--primary btn--small" onClick={startPomodoro}>
          <Icon name="play" filled />
          {voice.coach.startPomodoro}
        </button>
        <button type="button" className="btn btn--small" onClick={addChild}>
          <Icon name="plus" />
          {isRoot ? 'Add branch' : 'Add sub-topic'}
        </button>
        {!isRoot && (
          <button type="button" className="btn btn--small btn--quiet" onClick={remove}>
            <Icon name="trash" />
            Delete
          </button>
        )}
      </div>
    </aside>
  );
}
