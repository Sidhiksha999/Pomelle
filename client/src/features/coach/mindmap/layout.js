// Places the nodes of a freshly generated mind map.
// The goal sits in the middle, main branches go round it in an oval, and
// each branch's topics fan out further away in the same direction.
// After that the student can drag anything wherever they like.

const BRANCH_RING = { rx: 300, ry: 200 };
const LEAF_RING = { rx: 560, ry: 380 };

/** A point on an oval around (0, 0). */
function onOval(ring, angle) {
  return { x: Math.round(ring.rx * Math.cos(angle)), y: Math.round(ring.ry * Math.sin(angle)) };
}

/**
 * Turn the AI's { goal, branches: [{ title, estimateHours, children }] }
 * into a flat node dictionary with positions.
 * `makeId` creates unique ids.
 */
export function layoutMindMap(map, makeId) {
  const nodes = {};
  const rootId = makeId();
  nodes[rootId] = { id: rootId, parentId: null, text: map.goal, hours: 0, done: false, branch: 0, x: 0, y: 0 };

  const count = map.branches.length;
  map.branches.forEach((branch, i) => {
    // Start at 12 o'clock and go clockwise.
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    const branchId = makeId();
    nodes[branchId] = {
      id: branchId,
      parentId: rootId,
      text: branch.title,
      hours: branch.estimateHours || 0,
      done: false,
      branch: i,
      ...onOval(BRANCH_RING, angle),
    };

    // Children share a slice of the circle centred on their branch.
    const slice = Math.min(Math.PI / 2.2, ((2 * Math.PI) / count) * 0.85);
    const kids = branch.children;
    kids.forEach((child, j) => {
      const offset = kids.length > 1 ? (j / (kids.length - 1) - 0.5) * slice : 0;
      const childId = makeId();
      nodes[childId] = {
        id: childId,
        parentId: branchId,
        text: child.title,
        hours: child.estimateHours || 0,
        done: false,
        branch: i,
        ...onOval(LEAF_RING, angle + offset),
      };
    });
  });

  return { rootId, nodes };
}

/**
 * Where to put a node added by hand: a step further out from the centre than
 * its parent, nudged sideways for each brother or sister it already has.
 */
export function positionForNewChild(parent, siblingCount) {
  const length = Math.hypot(parent.x, parent.y);
  // From the root, go straight down; otherwise continue away from the centre.
  const dir = length < 1 ? { x: 0, y: 1 } : { x: parent.x / length, y: parent.y / length };
  const side = { x: -dir.y, y: dir.x };
  const spread = (siblingCount % 2 === 0 ? 1 : -1) * Math.ceil(siblingCount / 2) * 90;
  return {
    x: Math.round(parent.x + dir.x * 220 + side.x * spread),
    y: Math.round(parent.y + dir.y * 170 + side.y * spread),
  };
}
