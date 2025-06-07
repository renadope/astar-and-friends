import type { Pos } from '~/types/pathfinding';
import { isNodePassable } from '~/utils/grid-helpers';
import {
  type FlattenedStep,
  isFrontierSnapshot,
  isFrontierStep,
  isPathSnapshot,
  isVisitedSnapshot,
  isVisitedStep,
  type SnapshotStep,
} from '~/utils/timeline-generation';
import { isNullOrUndefined } from '~/utils/helpers';
import type { CellData } from '~/cell-data/types';

export function initCellData(weightGrid: number[][], start?: Pos, goal?: Pos): CellData[][] {
  const st = start ?? [0, 0];
  const end = goal ?? [weightGrid.length - 1, weightGrid[weightGrid.length - 1].length - 1];
  return weightGrid.map((row, r) => {
    return row.map((weight, c) => {
      const cellData: CellData = {
        pos: [r, c],
        cost: weight,
        h: undefined,
        f: undefined,
        costUpdateHistory: undefined,
        step: undefined,
        snapShotStep: undefined,
        state: isNodePassable(weight)
          ? r === st[0] && c === st[1]
            ? 'start'
            : r === end[0] && c === end[1]
              ? 'goal'
              : 'empty'
          : 'wall',
      };
      return cellData;
    });
  });
}

export function updateCellDataSnapshotStep(
  timeline: SnapshotStep[],
  cellData: CellData[][]
): CellData[][] {
  if (isNullOrUndefined(timeline) || timeline.length === 0) {
    return cellData;
  }
  let snapshotStep = 0;
  const newCellData = copyCellData(cellData);
  for (let i = 0; i < timeline.length; i++) {
    const node = timeline[i];
    if (isNullOrUndefined(node)) {
      continue;
    }
    if (isFrontierSnapshot(node)) {
      const nodes = node.nodes;
      for (let j = 0; j < nodes.length; j++) {
        const frontier = nodes[j];
        const [r, c] = frontier.pos;
        const cell = newCellData[r][c];
        cell.state = 'frontier';
        cell.pos = [r, c];
        cell.g = frontier.gCost;
        cell.h = frontier.hCost;
        cell.f = frontier.fCost;
        cell.step = i;
        cell.snapShotStep = snapshotStep;
        cell.costUpdateHistory = undefined;
      }
    } else if (isVisitedSnapshot(node) || isPathSnapshot(node)) {
      const [r, c] = node.node.pos;
      const cell = newCellData[r][c];
      cell.state = node.type;
      cell.pos = [r, c];
      cell.g = node.node.gCost;
      cell.h = node.node.hCost;
      cell.f = node.node.fCost;
      cell.step = i;
      cell.snapShotStep = isPathSnapshot(node) ? undefined : snapshotStep;
      cell.costUpdateHistory = undefined;

      if (isVisitedSnapshot(node)) {
        snapshotStep++;
      }
    }
  }
  return newCellData;
}

export function updateCellDataFlattenedStep(
  timeline: FlattenedStep[],
  cellData: CellData[][]
): CellData[][] {
  const newCellData = copyCellData(cellData);
  for (let i = 0; i < timeline.length; i++) {
    const timeLineNode = timeline[i];
    if (isNullOrUndefined(timeLineNode)) {
      continue;
    }
    const [r, c] = timeLineNode.node.pos;
    const cell = newCellData[r][c];
    if (isNullOrUndefined(cell)) {
      continue;
    }
    cell.state = timeLineNode.type;
    cell.pos = [r, c];
    cell.g = timeLineNode.node.gCost;
    cell.h = timeLineNode.node.hCost;
    cell.f = timeLineNode.node.fCost;
    cell.step = i;
    cell.snapShotStep =
      isFrontierStep(timeLineNode) || isVisitedStep(timeLineNode)
        ? timeLineNode.snapShotStep
        : undefined;
    cell.costUpdateHistory = undefined;
  }
  return newCellData;
}

export function copyCellData(cellData: CellData[][]): CellData[][] {
  return cellData.map((row) => row.map((cell) => ({ ...cell }) as CellData));
}
