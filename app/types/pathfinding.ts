export type Pos = [number, number]

export type Weights = {
    name: string;
    gWeight: number;
    hWeight: number;
};

export type AStarNode = {
    pos: Pos;
    gCost: number;
    hCost: number;
    fCost: number;
};

export type DiagonalConfig =
    | {
    allowed: true;
    cornerCutting: "strict" | "lax";
}
    | {
    allowed: false;
    cornerCutting?: never;
};


export interface PathData {
    pos: Pos;
    from?: Pos;
    step: number;
    edgeCost: number;
    gCost: number;
    hCost: number;
    fCost: number;
}


export type AStarData = {
    goalFound: boolean;
    path: PathData[];
    visitedOrder: Pos[];
    costs: number[][];
    costUpdateHistory: Record<string, number>;
    frontier: AStarNode[][];
    totalCost: number;
    steps: number;
    fallBack: Pos | null;
};