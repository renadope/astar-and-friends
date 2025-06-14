import type { Pos } from '~/types/pathfinding';
import { isNullOrUndefined } from '~/utils/helpers';
import type { Nullish } from '~/types/helpers';

export function isValidGridIndex(grid: unknown, row: number, col: number): boolean {
  return (
    !isNullOrUndefined(grid) &&
    isValidPos([row, col]) &&
    isValidGridStructure(grid) &&
    row < grid.length &&
    Array.isArray(grid[row]) &&
    col < grid[row].length
  );
}

export function isValidGridStructure(grid: unknown): grid is unknown[][] {
  return Array.isArray(grid) && grid.every((row) => Array.isArray(row));
}

export function isValidNonEmptyGridStructure(grid: unknown): grid is unknown[][] {
  return isValidGridStructure(grid) && grid.length > 0;
}

export function isValidGridOfNumbers(grid: unknown): grid is number[][] {
  return (
    isValidNonEmptyGridStructure(grid) &&
    grid.every((row) => row.length > 0 && row.every((ele) => typeof ele === 'number'))
  );
}

export function isValidRectangularGridOfNumbers(grid: unknown): grid is number[][] {
  if (isValidGridOfNumbers(grid)) {
    const firstLen = grid[0].length;
    return grid.every((row) => row.length === firstLen);
  }
  return false;
}

export function stringifyPos(...pos: number[]): string {
  return pos.join(',');
}

export function parsePos(key: string): number[] {
  return key.split(',').map(Number);
}

export function checkPosEquality(a: Pos, b: Pos): boolean {
  return isSamePos(a, b);
}

export function isNodePassable(val: number): boolean {
  return Number.isFinite(val) && val > 0;
}

export function isValidNode(grid: number[][], row: number, col: number) {
  return isValidGridIndex(grid, row, col) && isNodePassable(grid[row][col]);
}

export function isSamePos(a?: Pos | null, b?: Pos | null): boolean {
  if (!isValidPos(a) || !isValidPos(b)) {
    return false;
  }
  return a[0] === b[0] && a[1] === b[1];
}

export function isValidPos(pos?: Nullish<Pos>): pos is Pos {
  return (
    !isNullOrUndefined(pos) &&
    Array.isArray(pos) &&
    pos.length === 2 &&
    Number.isInteger(pos[0]) &&
    Number.isInteger(pos[1]) &&
    pos[0] >= 0 &&
    pos[1] >= 0
  );
}
