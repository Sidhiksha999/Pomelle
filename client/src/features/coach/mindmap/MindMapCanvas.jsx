import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { moveNode } from '../../../store/coachSlice';
import Icon from '../../../components/Icon';

// The interactive mind map, drawn with SVG.
//
// Coordinates: every node has a "world" position (x, y) with the goal at (0, 0).
// `view` says how the world is shown on screen: shifted by (x, y) pixels and
// scaled by k. So a node appears at screen point (view.x + node.x * k, view.y + node.y * k).
//
// Gestures:
//   drag a bubble      → move that node
//   drag the background → pan
//   mouse wheel / pinch → zoom around the pointer

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.5;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// Bubble sizes for the centre, main branches and sub-topics.
const SIZES = [
  { w: 230, h: 140 },
  { w: 190, h: 120 },
  { w: 170, h: 110 },
];

export function nodeDepth(map, node) {
  let depth = 0;
  let current = node;
  while (current?.parentId && depth < 3) {
    depth += 1;
    current = map.nodes[current.parentId];
  }
  return Math.min(depth, 2);
}

/** A smooth S-shaped curve between two points. */
function linkPath(a, b) {
  const midX = a.x + (b.x - a.x) / 2;
  return `M${a.x} ${a.y} C${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
}

function MapNode({ map, node, selected, onSelect, onNudge }) {
  const depth = nodeDepth(map, node);
  const { w, h } = SIZES[depth];
  const series = (node.branch % 6) + 1;

  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(node.id);
      return;
    }
    // Arrow keys move the node, as a keyboard alternative to dragging.
    const step = event.shiftKey ? 60 : 20;
    const moves = { ArrowUp: [0, -step], ArrowDown: [0, step], ArrowLeft: [-step, 0], ArrowRight: [step, 0] };
    if (moves[event.key]) {
      event.preventDefault();
      onNudge(node, ...moves[event.key]);
    }
  };

  return (
    <foreignObject x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} className="mm-fo">
      <div className="mm-node-wrap">
        <div
          className={`mm-node depth-${depth} series-${series}${node.done ? ' is-done' : ''}${selected ? ' is-selected' : ''}`}
          data-node-id={node.id}
          role="button"
          tabIndex={0}
          aria-pressed={selected}
          aria-label={`${node.text}${node.hours ? `, about ${node.hours} hours` : ''}${node.done ? ', done' : ''}`}
          onKeyDown={onKeyDown}
          onFocus={() => onSelect(node.id)}
        >
          <span className="mm-node__text">{node.text}</span>
          {(node.hours > 0 || node.done) && (
            <span className="mm-node__meta">
              {node.hours > 0 && <span className="mm-node__hours">{node.hours}h</span>}
              {node.done && (
                <span className="mm-node__done">
                  <Icon name="check" />
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </foreignObject>
  );
}

export default function MindMapCanvas({ map, selectedId, onSelect }) {
  const dispatch = useDispatch();
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState({ x: 0, y: 0, k: 0.6 });
  const gesture = useRef(null);
  const pointers = useRef(new Map());
  const nodesRef = useRef(map.nodes);
  nodesRef.current = map.nodes;

  // Keep track of the canvas size in pixels.
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  /** Zoom and centre so every node is visible. */
  const fit = useCallback(() => {
    if (!size.w || !size.h) return;
    const nodes = Object.values(nodesRef.current);
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - 130;
    const maxX = Math.max(...xs) + 130;
    const minY = Math.min(...ys) - 90;
    const maxY = Math.max(...ys) + 90;
    const k = clamp(Math.min(size.w / (maxX - minX), size.h / (maxY - minY)), MIN_ZOOM, 1.1);
    setView({ k, x: size.w / 2 - ((minX + maxX) / 2) * k, y: size.h / 2 - ((minY + maxY) / 2) * k });
  }, [size.w, size.h]);

  // Fit when a different map opens or the canvas changes size.
  useEffect(fit, [map.id, fit]);

  /** Zoom by `factor`, keeping the point (px, py) on screen still. */
  const zoomAt = useCallback((factor, px, py) => {
    setView((v) => {
      const k = clamp(v.k * factor, MIN_ZOOM, MAX_ZOOM);
      const ratio = k / v.k;
      return { k, x: px - (px - v.x) * ratio, y: py - (py - v.y) * ratio };
    });
  }, []);

  // The wheel listener must be "non-passive" so it can stop the page scrolling.
  useEffect(() => {
    const svg = svgRef.current;
    const onWheel = (event) => {
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      zoomAt(Math.exp(-event.deltaY * 0.0015), event.clientX - rect.left, event.clientY - rect.top);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (event) => {
    // Keep receiving moves even if the pointer leaves the canvas mid-drag.
    try {
      svgRef.current.setPointerCapture(event.pointerId);
    } catch {
      // Some pointers (e.g. synthetic ones) can't be captured; dragging still works.
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    // Two fingers: pinch to zoom.
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { type: 'pinch', distance: Math.hypot(a.x - b.x, a.y - b.y) };
      return;
    }

    const nodeEl = event.target.closest?.('[data-node-id]');
    if (nodeEl) {
      const node = nodesRef.current[nodeEl.dataset.nodeId];
      onSelect(node.id);
      gesture.current = { type: 'drag', id: node.id, startX: event.clientX, startY: event.clientY, nodeX: node.x, nodeY: node.y, k: view.k };
    } else {
      gesture.current = { type: 'pan', startX: event.clientX, startY: event.clientY, viewX: view.x, viewY: view.y };
    }
  };

  const onPointerMove = (event) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const g = gesture.current;
    if (!g) return;

    if (g.type === 'pinch' && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = svgRef.current.getBoundingClientRect();
      zoomAt(distance / g.distance, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
      g.distance = distance;
    } else if (g.type === 'drag') {
      const dx = (event.clientX - g.startX) / g.k;
      const dy = (event.clientY - g.startY) / g.k;
      dispatch(moveNode({ mapId: map.id, nodeId: g.id, x: g.nodeX + dx, y: g.nodeY + dy }));
    } else if (g.type === 'pan') {
      setView((v) => ({ ...v, x: g.viewX + event.clientX - g.startX, y: g.viewY + event.clientY - g.startY }));
    }
  };

  const onPointerUp = (event) => {
    pointers.current.delete(event.pointerId);
    gesture.current = null;
  };

  const nudge = (node, dx, dy) => dispatch(moveNode({ mapId: map.id, nodeId: node.id, x: node.x + dx, y: node.y + dy }));

  const nodes = Object.values(map.nodes);
  // Draw deeper nodes first so the centre is always on top.
  const drawOrder = [...nodes].sort((a, b) => nodeDepth(map, b) - nodeDepth(map, a));

  return (
    <div ref={wrapRef} className="mindmap-canvas">
      <svg
        ref={svgRef}
        className="mindmap-canvas__svg"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="group"
        aria-label={`Mind map for ${map.title}. Tab through the bubbles; arrow keys move the selected one.`}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          <g className="mm-links">
            {nodes
              .filter((n) => n.parentId && map.nodes[n.parentId])
              .map((n) => (
                <path
                  key={n.id}
                  d={linkPath(map.nodes[n.parentId], n)}
                  className={`mm-link series-${(n.branch % 6) + 1}${n.parentId === map.rootId ? ' is-main' : ''}`}
                />
              ))}
          </g>
          {drawOrder.map((node) => (
            <MapNode
              key={node.id}
              map={map}
              node={node}
              selected={node.id === selectedId}
              onSelect={onSelect}
              onNudge={nudge}
            />
          ))}
        </g>
      </svg>

      <div className="mindmap-canvas__controls">
        <button type="button" className="icon-btn" aria-label="Zoom in" onClick={() => zoomAt(1.25, size.w / 2, size.h / 2)}>
          <Icon name="plus" />
        </button>
        <button type="button" className="icon-btn" aria-label="Zoom out" onClick={() => zoomAt(0.8, size.w / 2, size.h / 2)}>
          <Icon name="minus" />
        </button>
        <button type="button" className="btn btn--small" onClick={fit}>
          Fit
        </button>
      </div>
      <p className="mindmap-canvas__hint" aria-hidden="true">
        Drag bubbles to move them · drag the background to pan · scroll to zoom
      </p>
    </div>
  );
}
