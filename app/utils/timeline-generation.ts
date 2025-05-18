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


export function isPathSnapshot(step: SnapshotStep): step is PathSnapshot {
    return step.type === "path"
}

export function isFrontierSnapshot(step: SnapshotStep): step is FrontierSnapshot {
    return step.type === "frontier"
}

export function isVisitedSnapshot(step: SnapshotStep): step is VisitedSnapshot {
    return step.type === "visited"
}


export function isPathStep(step: FlattenedStep): step is PathStep {
    return step.type === "path"
}

export function isFrontierStep(step: FlattenedStep): step is FrontierStep {
    return step.type === "frontier"
}

export function isVisitedStep(step: FlattenedStep): step is VisitedStep {
    return step.type === "visited"
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
