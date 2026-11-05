import { useDispatch } from 'react-redux';
import { updateNode } from '../../../store/coachSlice';

// The same mind map as a nested checklist. Easier on small screens and with
// a keyboard or screen reader.

function OutlineItem({ map, node, selectedId, onSelect }) {
  const dispatch = useDispatch();
  const children = Object.values(map.nodes).filter((n) => n.parentId === node.id);
  const isRoot = node.id === map.rootId;

  return (
    <li className={`mm-outline__item series-${(node.branch % 6) + 1}`}>
      <div className="mm-outline__row">
        {!isRoot && (
          <input
            type="checkbox"
            checked={node.done}
            aria-label={`Mark “${node.text}” as done`}
            onChange={(event) =>
              dispatch(updateNode({ mapId: map.id, nodeId: node.id, changes: { done: event.target.checked } }))
            }
          />
        )}
        <button
          type="button"
          className={`mm-outline__name${node.done ? ' is-done' : ''}`}
          aria-pressed={node.id === selectedId}
          onClick={() => onSelect(node.id)}
        >
          {node.text}
        </button>
        {node.hours > 0 && <span className="mm-outline__hours">{node.hours}h</span>}
      </div>
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <OutlineItem key={child.id} map={map} node={child} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function MindMapOutline({ map, selectedId, onSelect }) {
  return (
    <ul className="mm-outline">
      <OutlineItem map={map} node={map.nodes[map.rootId]} selectedId={selectedId} onSelect={onSelect} />
    </ul>
  );
}
