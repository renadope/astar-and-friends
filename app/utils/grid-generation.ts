//The first number represents the cost that we want to select, and the second number represents the odds of that cost being selected
import type { Pos } from '~/types/pathfinding';
import type { CostAndWeight, CostAndWeightFunc } from '~/utils/grid-weights';
import {
  isPosInbounds,
  isSamePos,
  isValidPos,
  isValidRectangularGridOfNumbers,
} from '~/utils/grid-helpers';

export type CDFEntry = {
  cost: number;
  threshold: number;
};
export type CDF = CDFEntry[];

export function generateRandomCostGrid(
  size: number,
  getCostAndWeight: CostAndWeightFunc,
  st?: Pos,
  goal?: Pos
): number[][] {
  const start: Pos = st ?? [0, 0];
  const end: Pos = goal ?? [size - 1, size - 1];

  const grid: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      const terrainWeight = getTerrainWeight(getCostAndWeight, r, c, size);
      const isStart = r === start[0] && c === start[1];
      const isGoal = r === end[0] && c === end[1];
      if (isStart || isGoal) {
        //Perhaps later on, we generate the positive number in a range
        row.push(1);
      } else {
        row.push(terrainWeight);
      }
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Generates a rows x cols grid of terrain weights.
 * Start and goal positions are assigned a flat cost of 1.
 */
function generateRandomCostGridRowsCols(
  rows: number,
  cols: number,
  getCostAndWeight: CostAndWeightFunc,
  st: Pos,
  goal: Pos
): number[][] {
  if (rows < 1 || cols < 1) {
    throw new Error('invalid dims');
  }
  if (!isValidPos(st) || !isValidPos(goal)) {
    throw new Error('start or goal is not a valid position');
  }
  if (!isPosInbounds(st, rows, cols) || !isPosInbounds(goal, rows, cols)) {
    throw new Error('start or goal cannot be placed on this grid');
  }
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const terrainWeight = getTerrainWeight(getCostAndWeight, r, c, rows * cols);
      const isStart = isSamePos([r, c], st);
      const isGoal = isSamePos([r, c], goal);
      if (isStart || isGoal) {
        row.push(1);
      } else {
        row.push(terrainWeight);
      }
    }
    grid.push(row);
  }
  //putting this as we have not tested this function yet, will remove after testing
  if (!isValidRectangularGridOfNumbers(grid)) {
    throw new Error('Generated grid is invalid.');
  }
  return grid;
}

export function generateRandomCostGriForPathFinding(
  rows: number,
  cols: number,
  getCostAndWeight: CostAndWeightFunc,
  st: Pos,
  goal: Pos
): number[][] {
  if (rows <= 1 || cols <= 1) {
    throw new Error('must be larger than a 1x1 grid, otherwise start===goal');
  }
  if (!isValidPos(st) || !isValidPos(goal)) {
    throw new Error('start or goal is not a valid position');
  }
  if (isSamePos(st, goal)) {
    throw new Error('start and goal should not be the same in the explicit case');
  }
  if (!isPosInbounds(st, rows, cols) || !isPosInbounds(goal, rows, cols)) {
    throw new Error('start or goal cannot be placed on this grid');
  }

  return generateRandomCostGridRowsCols(rows, cols, getCostAndWeight, st, goal);
}

export function getTerrainWeight(
  func: CostAndWeightFunc,
  r: number,
  c: number,
  size: number
): number {
  const cdf: CDF = buildCDF(func(r, c, size));
  const roll = Math.random();
  const terrainWeight = cdf.find((costAndThreshold) => roll <= costAndThreshold.threshold);
  return terrainWeight ? terrainWeight.cost : 1;
}

export function buildCDF(costAndWeight: CostAndWeight): CDF {
  //Sorting makes it more consistent
  //We don't need to create the entries array, could have just manipulated the object directly,
  //but I wanted the sorted order of the costs so that we can see it the same each time
  const entries = Object.entries(costAndWeight)
    .map(([cost, weight]) => {
      return {
        cost: Number(cost),
        weight: weight,
      };
    })
    .sort((a, b) => a.cost - b.cost);
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let cumulative = 0;
  return entries.map(({ cost, weight }) => {
    cumulative += weight;
    return {
      cost: cost,
      //normalizing the cumulative sum so that they all always add up to 1
      threshold: cumulative / total,
    };
  });
}
