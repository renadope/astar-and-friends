export type Pos = [number, number];

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
      cornerCutting: 'strict' | 'lax';
      diagonalMultiplier: number;
    }
  | {
      allowed: false;
      cornerCutting?: never;
    };

export type PathData = {
  pos: Pos;
  from?: Pos;
  step: number;
  edgeCost: number;
  gCost: number;
  hCost: number;
  fCost: number;
};

export type AStarData = {
  goalFound: boolean;
  path: PathData[];
  visitedOrder: AStarNode[];
  costs: number[][];
  costUpdateHistory: Record<string, CostHistory[]>;
  updatesPerStep: Record<number, number>;
  frontier: AStarNode[][];
  totalCost: number;
  steps: number;
  fallBack: Pos | null;
  prevMap: Map<string, string>;
};

export type CostHistory = {
  step: number;
  gCost: number;
};
