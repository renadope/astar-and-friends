import type {
  AStarData,
  AStarNode,
  CostHistory,
  DiagonalConfig,
  PathData,
  Pos,
  Weights,
} from '~/types/pathfinding';
import {
  checkPosEquality,
  isNodePassable,
  isValidGridIndex,
  isValidGridOfNumbers,
  isValidNode,
  stringifyPos,
} from '~/utils/grid-helpers';
import { isNullOrUndefined, ResultErr, ResultOk } from '~/utils/helpers';
import type { Result } from '~/types/helpers';
import { makeNode } from '~/queue/helpers';
import { PriorityQueue } from '~/queue/priority-queue';

/*NOTE:I realized, when storing the heuristic, we didnt store the weighted heuristic
 * So yes, technically we calculate the f score correctly
 * but the h score is stored as the non-weighted value
 * currently in our ui when i realized this, i just multiplied it there,
 * however if we do end up changing it here, remember to remove that multiplication in the tooltip */

export const fourDirection = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
export const diagonals = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

export function aStar(
  grid: number[][],
  start: Pos,
  goal: Pos,
  heuristic: (a: Pos, b: Pos) => number,
  allowDiagonal: DiagonalConfig,
  weights: Weights = { gWeight: 1, hWeight: 1, name: 'AStar' }
): Result<AStarData> {
  function heuristicFromNodeToGoal(node: Pos) {
    return heuristic(node, goal);
  }

  if (!isValidGridOfNumbers(grid)) {
    return ResultErr(new Error('grid should only consist of numbers'));
  }

  if (!isValidNode(grid, start[0], start[1])) {
    return ResultErr(new Error('Invalid Start'));
  }
  if (!isValidNode(grid, goal[0], goal[1])) {
    return ResultErr(new Error('Invalid Goal'));
  }
  const visited: Set<string> = new Set<string>();
  const startAndGoalSame = checkPosEquality(start, goal);
  const [startR, startC] = start;
  let goalFound = false;
  const visitedOrder: AStarNode[] = [];
  const frontier: AStarNode[][] = [];
  const prev = new Map<string, string>();
  const updatesPerStep = new Map<number, number>();
  const costUpdateHistory = new Map<string, CostHistory[]>();
  const costs: typeof grid = grid.map((row) => row.map(() => Infinity));
  const startGCost = grid[startR][startC];
  const startHCost = heuristicFromNodeToGoal(start);
  const startFCost = calculateFCost(weights, startGCost, startHCost);

  costs[startR][startC] = startGCost;

  const startNode: AStarNode = {
    pos: [startR, startC],
    gCost: startGCost,
    hCost: startHCost,
    fCost: startFCost,
  };

  if (startAndGoalSame) {
    return ResultOk({
      goalFound: true,
      path: [
        {
          pos: [...start],
          step: 0,
          edgeCost: grid[startR][startC],
          gCost: startGCost,
          hCost: startHCost,
          fCost: startFCost,
        },
      ],
      costs: costs,
      visitedOrder: [startNode],
      costUpdateHistory: {},
      updatesPerStep: {},
      frontier: [[startNode]],
      totalCost: costs[startR][startC],
      steps: 0,
      fallBack: null,
      prevMap: prev,
    });
  }

  const node = makeNode(startNode, startFCost, stringifyPos(startR, startC));

  const openSet = new PriorityQueue<AStarNode>((a, b) => a.priority - b.priority);
  openSet.enqueue(node);

  const deltas = allowDiagonal.allowed ? [...fourDirection, ...diagonals] : [...fourDirection];

  let step = 0;
  while (!openSet.isEmpty()) {
    const currSet = openSet.toArray();
    frontier.push(currSet.map((st) => st.value));
    const minNode = openSet.dequeue();

    if (isNullOrUndefined(minNode)) {
      throw new Error('should not happen, as we are only looping if there is content in the queue');
    }

    step++;
    visitedOrder.push(minNode.value);

    const [currRow, currCol] = minNode.value.pos;
    visited.add(stringifyPos(currRow, currCol));
    if (currRow === goal[0] && currCol === goal[1]) {
      goalFound = true;
      break;
    }

    const currNodeCost = minNode.value.gCost;
    for (const delta of deltas) {
      const rowDelta = delta[0];
      const colDelta = delta[1];

      const isDiagonal = Math.abs(rowDelta) === 1 && Math.abs(colDelta) === 1;

      if (isDiagonal) {
        const sideACoordinates = [currRow + rowDelta, currCol];
        const sideBCoordinates = [currRow, currCol + colDelta];

        const sideA = isValidGridIndex(grid, currRow + rowDelta, currCol)
          ? grid[sideACoordinates[0]][sideACoordinates[1]]
          : undefined;

        const sideB = isValidGridIndex(grid, currRow, currCol + colDelta)
          ? grid[sideBCoordinates[0]][sideBCoordinates[1]]
          : undefined;

        if (isNullOrUndefined(sideA) && isNullOrUndefined(sideB)) {
          continue;
        }

        const sideAIsWall = !isNullOrUndefined(sideA) && !isNodePassable(sideA);
        const sideBIsWall = !isNullOrUndefined(sideB) && !isNodePassable(sideB);

        const cantGoDiagonal =
          allowDiagonal.cornerCutting === 'lax'
            ? sideAIsWall && sideBIsWall
            : sideAIsWall || sideBIsWall;

        if (cantGoDiagonal) {
          continue;
        }
      }
      const moveMultiplier =
        isAllowedDiagonalConfig(allowDiagonal) && isDiagonal ? allowDiagonal.diagonalMultiplier : 1;

      const neighborRow = currRow + rowDelta;
      const neighborCol = currCol + colDelta;
      const neighborID = stringifyPos(neighborRow, neighborCol);

      if (isValidNode(grid, neighborRow, neighborCol) && !visited.has(neighborID)) {
        const neighborID = stringifyPos(neighborRow, neighborCol);
        const neighborDist = grid[neighborRow][neighborCol] * moveMultiplier;
        const neighborCost = costs[neighborRow][neighborCol];
        const neighborG = currNodeCost + neighborDist;
        if (neighborG < neighborCost) {
          costs[neighborRow][neighborCol] = neighborG;
          const history = costUpdateHistory.get(neighborID) ?? [];
          history.push({ step: step, gCost: neighborG });
          costUpdateHistory.set(neighborID, history);
          updatesPerStep.set(step, (updatesPerStep.get(step) ?? 0) + 1);
          prev.set(neighborID, stringifyPos(currRow, currCol));
          const h = heuristicFromNodeToGoal([neighborRow, neighborCol]);

          const fCost = calculateFCost(weights, neighborG, h);
          const updatedNode: AStarNode = {
            pos: [neighborRow, neighborCol],
            hCost: h,
            gCost: neighborG,
            fCost,
          };
          const node = makeNode(updatedNode, fCost, neighborID);
          if (openSet.contains(neighborID)) {
            openSet.updateNode(node);
          } else {
            openSet.enqueue(node);
          }
        }
      }
    }
  }

  if (!goalFound) {
    let minH = Infinity;
    let closest: Pos | undefined = undefined;
    if (weights.hWeight > 0) {
      for (let i = 0; i < visitedOrder.length; i++) {
        const h = heuristicFromNodeToGoal(visitedOrder[i].pos) * weights.hWeight;
        if (h < minH) {
          minH = h;
          closest = [...visitedOrder[i].pos];
        }
      }
      if (closest) {
        goal = [...closest];
      }

      /**
       * In a case where there is no heuristic, we are at BFS or Dijkstra algorithm
       * First idea was to take the one with the lowest gCost, but that just ends up always being the first node
       * I figured a clearer way to represent the fallback was the so called deepest / last node it explored
       * So it becomes start to last node visited under this situation where the goal isnt found
       * and there is no heuristic to guide
       * **/
    } else {
      if (visitedOrder.length > 0) {
        goal = [...visitedOrder[visitedOrder.length - 1].pos];
      }
    }
  }

  /**
   * Some notes on Algorithm Behavior for Fallback Goals
   *
   * When the original goal is not found, we have two different concerns:
   *
   * 1. Algorithm Correctness:
   *    - Only the final path and total cost matter
   *    - The specific goal reached (fallback or not) is not relevant to correctness
   *
   * 2. Visual Representation:
   *    - For UI playback purposes, we treat the fallback goal as if it were
   *      the originally intended goal and recompute the hCost and fCost,
   *      gCost is unaffected and preserves the correct score.
   * This ensures the visualization aligns with how the algorithm would have behaved if the fallback goal had been the
   * target from the get-go.
   *
   */
  if (!goalFound) {
    for (let i = 0; i < visitedOrder.length; i++) {
      const v = visitedOrder[i];
      const h = heuristic(v.pos, goal);
      visitedOrder[i].fCost = calculateFCost(weights, costs[v.pos[0]][v.pos[1]], h);
      visitedOrder[i].hCost = h;
    }
    // The algorithm fully exhausts the frontier queue when the **original** goal is unreachable.
    // But for playback and UI accuracy, we still update heuristic and fCost for frontier elements.
    for (let i = 0; i < frontier.length; i++) {
      const frontierElements = frontier[i];
      for (let j = 0; j < frontierElements.length; j++) {
        const frontierEle = frontierElements[j];
        const h = heuristic(frontierEle.pos, goal);
        frontierEle.fCost = calculateFCost(
          weights,
          costs[frontierEle.pos[0]][frontierEle.pos[1]],
          h
        );
        frontierEle.hCost = h;
      }
    }
  }

  const allPathData = reconstructPath(grid, costs, prev, heuristicFromNodeToGoal, weights, goal);
  const data: AStarData = {
    goalFound: goalFound,
    path: allPathData,
    visitedOrder: visitedOrder,
    frontier: frontier,
    costs: costs,
    costUpdateHistory: Object.fromEntries(costUpdateHistory),
    updatesPerStep: Object.fromEntries(updatesPerStep),
    //the goal becomes the fallback if not found otherwise if it's found just return null as there is no fallback
    fallBack: !goalFound ? goal : null,
    steps: allPathData.length - 1,
    totalCost: allPathData[allPathData.length - 1].gCost,
    prevMap: prev,
  };
  return ResultOk<AStarData>(data);
}

export function reconstructPath(
  grid: number[][],
  costs: number[][],
  prev: Map<string, string>,
  heuristicFromNodeToGoal: (node: Pos) => number,
  weights: Weights,
  goal: Pos
): PathData[] {
  let current: string | undefined = stringifyPos(goal[0], goal[1]);
  const path: string[] = [];
  while (!isNullOrUndefined(current)) {
    path.push(current);
    current = prev.get(current);
  }
  const actualPath = path.reverse().map((coords) => {
    const [r, c] = coords.split(',').map((val) => Number(val));
    return [r, c];
  });
  const allPathData: PathData[] = [];
  let step: number = 0;
  for (let i = 0; i < actualPath.length; i++) {
    const row = actualPath[i][0];
    const col = actualPath[i][1];
    let from: Pos | undefined = undefined;
    if (i > 0) {
      const [r, c] = actualPath[i - 1];
      from = [r, c];
    }
    const h = heuristicFromNodeToGoal([row, col]);
    const g = costs[row][col];
    const f = calculateFCost(weights, g, h);
    const pathData: PathData = {
      from: from,
      pos: [row, col],
      step: step++,
      edgeCost: grid[row][col],
      gCost: g,
      hCost: h,
      fCost: f,
    };
    allPathData.push(pathData);
  }
  return allPathData;
}

export function calculateFCost(weights: Weights, gCost: number, hCost: number): number {
  return weights.gWeight * gCost + weights.hWeight * hCost;
}

export function isAllowedDiagonalConfig(config: DiagonalConfig): config is {
  allowed: true;
  cornerCutting: 'lax' | 'strict';
  diagonalMultiplier: number;
} {
  return config.allowed;
}

export function getAlgorithmName(gWeight: number, hWeight: number): string {
  const g = gWeight;
  const h = hWeight;

  if (g === 0 && h === 0) {
    return 'Breadth-First Search (BFS)';
  }

  if (g === 0 && h > 0) {
    // return h === 1 ? "Greedy Best-First Search" : `Greedy BFS (×${h})`;
    return h === 1 ? 'Greedy Best-First Search' : `Greedy BFS`;
  }

  if (g > 0 && h === 0) {
    // return g === 1 ? "Dijkstra's Algorithm" : `Weighted Dijkstra (×${g})`;
    return g === 1 ? "Dijkstra's Algorithm" : `Weighted Dijkstra`;
  }

  if (g === 1 && h === 1) {
    return 'A* Search';
  }
  if (g !== 1 && h !== 1 && g === h) {
    // return `Aggressive ${g}x A* Search `;
    return `Aggressive A* Search `;
  }

  // return `Weighted A* (g×${g}, h×${h})`;
  return `Weighted A*`;
}
