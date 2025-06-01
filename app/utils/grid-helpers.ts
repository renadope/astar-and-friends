import type {Pos} from "~/types/pathfinding";
import {isNullOrUndefined} from "~/utils/helpers";
import type {Nullish} from "~/types/helpers";

export function isValidGridIndex(
    grid: unknown[][],
    row: number,
    col: number,
): boolean {
    return isValidPos([row, col]) && row < grid.length && col < grid[row].length;
}

export function stringifyPos(...pos: number[]): string {
    return pos.join(",");
}

export function parsePos(key: string): number[] {
    return key.split(",").map(Number);
}

export function checkPosEquality(a: Pos, b: Pos): boolean {
    if (!isValidPos(a) || !isValidPos(b)) {
        return false
    }
    return a[0] === b[0] && a[1] === b[1];
}

export function isNodePassable(val: number): boolean {
    return Number.isFinite(val) && val > 0;
}

export function isValidNode(grid: number[][], row: number, col: number) {
    return isValidGridIndex(grid, row, col) && isNodePassable(grid[row][col]);
}

export function isSamePos(a?: Pos | null, b?: Pos | null): boolean {
    if (!isValidPos(a) || !isValidPos(b)) {
        return false
    }
    return a[0] === b[0] && a[1] === b[1];
}

export function isValidPos(pos?: Nullish<Pos>): pos is Pos {
    return !isNullOrUndefined(pos)
        && Array.isArray(pos)
        && pos.length === 2
        && Number.isInteger(pos[0]) && Number.isInteger(pos[1])
        && pos[0] >= 0 && pos[1] >= 0
}