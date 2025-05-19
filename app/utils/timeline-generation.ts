import type {AStarNode, PathData} from "~/types/pathfinding";

export type FrontierSnapshot = {
    type: "frontier"
    nodes: AStarNode[]
}
export type VisitedSnapshot = {
    type: "visited"
    node: AStarNode
}
export type PathSnapshot = {
    type: "path",
    node: PathData,
}
export type SnapshotStep = FrontierSnapshot | VisitedSnapshot | PathSnapshot

export function isFrontierSnapshot(step: SnapshotStep | FlattenedStep): step is FrontierSnapshot {
    return step.type === "frontier" && 'nodes' in step && !('node' in step)
}

export function isVisitedSnapshot(step: SnapshotStep | FlattenedStep): step is VisitedSnapshot {
    return step.type === "visited" && 'node' in step && !('nodes' in step)
}

export function isPathSnapshot(step: SnapshotStep | FlattenedStep): step is PathSnapshot {
    return step.type === "path" && 'node' in step && !('nodes' in step)
}
// im realzing theres an overlap between path snapsot and path flattened step, hopefully not an issue
export function isSnapshotStep(step:SnapshotStep | FlattenedStep):step is SnapshotStep{
    return isFrontierSnapshot(step) || isVisitedSnapshot(step) || isPathSnapshot(step)
}

export function buildTimeline(visitedOrder: AStarNode[],
                              frontierOrder: AStarNode[][],
                              pathData: PathData[]): SnapshotStep[] {

    const timeline: SnapshotStep [] = []
    if (visitedOrder.length !== frontierOrder.length) {
        throw new Error("both should have the same length")
    }
    for (let i = 0; i < visitedOrder.length; i++) {
        const visitedSnapshot = visitedOrder[i]
        const frontierSnapshot = frontierOrder[i]
        timeline.push({type: "frontier", nodes: frontierSnapshot})
        timeline.push({type: "visited", node: visitedSnapshot})
    }
    for (let i = 0; i < pathData.length; i++) {
        const pathNode = pathData[i]
        timeline.push({type: "path", node: pathNode})
    }
    return timeline
}

export type FrontierStep = {
    type: "frontier";
    node: AStarNode;
    snapShotStep: number
};

export type VisitedStep = {
    type: "visited";
    node: AStarNode;
    snapShotStep: number
};

export type PathStep = {
    type: "path";
    node: PathData;
};

export type FlattenedStep = FrontierStep | VisitedStep | PathStep;


export function isFrontierStep(step: FlattenedStep | SnapshotStep): step is FrontierStep {
    return step.type === "frontier" && 'node' in step && 'snapShotStep' in step
}

export function isVisitedStep(step: FlattenedStep | SnapshotStep): step is VisitedStep {
    return step.type === "visited" && 'node' in step && 'snapShotStep' in step
}

export function isPathStep(step: FlattenedStep | SnapshotStep): step is PathStep {
    return step.type === "path" && 'node' in step && !('snapShotStep' in step)
}

export function isFlattenedStep(step: FlattenedStep | SnapshotStep): step is FlattenedStep {
    return isFrontierStep(step) || isVisitedStep(step) || isPathStep(step)
}


export function flattenedTimeline(timeline: SnapshotStep[]): FlattenedStep[] {
    let snapshotStep = 0;

    const flattenedSteps: FlattenedStep[] = []
    for (let i = 0; i < timeline.length; i++) {
        const node = timeline[i]
        if (isVisitedSnapshot(node)) {
            flattenedSteps.push({type: 'visited', node: node.node, snapShotStep: snapshotStep});
            snapshotStep++
        } else if (isFrontierSnapshot(node)) {
            for (const frontierNode of node.nodes) {
                flattenedSteps.push({type: 'frontier', node: frontierNode, snapShotStep: snapshotStep});
            }
        } else if (isPathSnapshot(node)) {
            flattenedSteps.push({type: 'path', node: node.node});
        }


    }
    return flattenedSteps
}
