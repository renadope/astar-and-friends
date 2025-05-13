import type {Pos} from "~/types/pathfinding";

export function isValidGridIndex(
    grid: unknown[][],
    row: number,
    col: number,
): boolean {
    const invalidRow = row < 0 || row >= grid.length;
    if (invalidRow) {
        return false;
    }
    const invalidCol = col < 0 || col >= grid[row].length;
    return !invalidCol;
}

export function stringifyPos(...pos: number[]): string {
    return pos.join(",");
}

export function checkPosEquality(a: Pos, b: Pos): boolean {
    return a[0] === b[0] && a[1] === b[1];
}