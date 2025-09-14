import type { AStarNode, PathData } from '~/types/pathfinding';

export type FrontierSnapshot = {
  kind: 'snapshot';
  type: 'frontier';
  nodes: AStarNode[];
};
export type VisitedSnapshot = {
  kind: 'snapshot';
  type: 'visited';
  node: AStarNode;
};

export type PathStep = {
  type: 'path';
  node: PathData;
};

export type SnapshotStep = FrontierSnapshot | VisitedSnapshot | PathStep;

export function isFrontierSnapshot(step: SnapshotStep | FlattenedStep): step is FrontierSnapshot {
  return step.type === 'frontier' && step.kind === 'snapshot';
}

export function isVisitedSnapshot(step: SnapshotStep | FlattenedStep): step is VisitedSnapshot {
  return step.type === 'visited' && step.kind === 'snapshot';
}

export function isPathStep(step: SnapshotStep | FlattenedStep): step is PathStep {
  return step.type === 'path';
}

export function buildTimeline(
  visitedOrder: AStarNode[],
  frontierOrder: AStarNode[][],
  pathData: PathData[]
): SnapshotStep[] {
  const timeline: SnapshotStep[] = [];
  if (visitedOrder.length !== frontierOrder.length) {
    throw new Error('both visited and frontier should have the same length');
  }
  for (let i = 0; i < visitedOrder.length; i++) {
    const visitedSnapshot = visitedOrder[i];
    const frontierSnapshot = frontierOrder[i];
    timeline.push({ kind: 'snapshot', type: 'frontier', nodes: frontierSnapshot });
    timeline.push({ kind: 'snapshot', type: 'visited', node: visitedSnapshot });
  }
  for (let i = 0; i < pathData.length; i++) {
    const pathNode = pathData[i];
    timeline.push({ type: 'path', node: pathNode });
  }
  return timeline;
}

export type FrontierStep = {
  kind: 'flattened';
  type: 'frontier';
  node: AStarNode;
  snapShotStep: number;
};

export type VisitedStep = {
  kind: 'flattened';
  type: 'visited';
  node: AStarNode;
  snapShotStep: number;
};

export type FlattenedStep = FrontierStep | VisitedStep | PathStep;

export function isFrontierStep(step: FlattenedStep | SnapshotStep): step is FrontierStep {
  return step.type === 'frontier' && step.kind === 'flattened';
}

export function isVisitedStep(step: FlattenedStep | SnapshotStep): step is VisitedStep {
  return step.type === 'visited' && step.kind === 'flattened';
}

export function flattenedTimeline(timeline: SnapshotStep[]): FlattenedStep[] {
  let snapshotStep = 0;

  const flattenedSteps: FlattenedStep[] = [];
  for (let i = 0; i < timeline.length; i++) {
    const node: SnapshotStep = timeline[i];
    if (isVisitedSnapshot(node)) {
      flattenedSteps.push({
        kind: 'flattened',
        type: 'visited',
        node: node.node,
        snapShotStep: snapshotStep,
      });
      snapshotStep++;
    } else if (isFrontierSnapshot(node)) {
      for (const frontierNode of node.nodes) {
        flattenedSteps.push({
          kind: 'flattened',
          type: 'frontier',
          node: frontierNode,
          snapShotStep: snapshotStep,
        });
      }
    } else if (isPathStep(node)) {
      flattenedSteps.push({ type: 'path', node: node.node });
    }
  }
  return flattenedSteps;
}
