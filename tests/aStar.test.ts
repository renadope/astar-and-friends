import type {Pos, Weights} from "~/types/pathfinding";
import {describe, expect, it} from "vitest";
import {aStar, calculateFCost} from "~/services/aStar";
import {manhattan} from "~/utils/heuristics";

type fCostTableTests = {
    g: number,
    h: number,
    weights: Weights,
    expected: number
}
describe('fCost', () => {
    //just a smoke test to make sure our costs are being calculated correctly
    const tests: fCostTableTests[] = [
        {g: 1, h: 1, weights: {gWeight: 1, hWeight: 1, name: "AStar"}, expected: 2},
        {g: 2, h: 1, weights: {gWeight: 1, hWeight: 1, name: "AStar"}, expected: 3},
        {g: 2, h: 2, weights: {gWeight: 1, hWeight: 1, name: "AStar"}, expected: 4},
        {g: 2, h: 10, weights: {gWeight: 1, hWeight: 1, name: "AStar"}, expected: 12},
        {g: 0, h: 0, weights: {gWeight: 1, hWeight: 1, name: "AStar"}, expected: 0},
        {g: 1, h: 1, weights: {gWeight: 0, hWeight: 0, name: "BFS"}, expected: 0},
        {g: 12, h: 13.454, weights: {gWeight: 0, hWeight: 0, name: "BFS"}, expected: 0},
        {g: 0.1, h: 0.9, weights: {gWeight: 0, hWeight: 0, name: "BFS"}, expected: 0},
        {g: 5434, h: 1000, weights: {gWeight: 0, hWeight: 0, name: "BFS"}, expected: 0},
        {g: 1, h: 1000, weights: {gWeight: 1, hWeight: 0, name: "Greedy-BFS"}, expected: 1},
        {g: 7, h: 1000, weights: {gWeight: 1, hWeight: 0, name: "Greedy-BFS"}, expected: 7},
        {g: 10, h: 999, weights: {gWeight: 1, hWeight: 0, name: "Dijkstra"}, expected: 10},
        {g: 0, h: 50, weights: {gWeight: 1, hWeight: 0, name: "Dijkstra"}, expected: 0},
        {g: 999, h: 1, weights: {gWeight: 0, hWeight: 1, name: "Greedy-BFS"}, expected: 1},
        {g: 20, h: 0.5, weights: {gWeight: 0, hWeight: 1, name: "Greedy-BFS"}, expected: 0.5},
        {g: 2, h: 5, weights: {gWeight: 0.5, hWeight: 2, name: "Weighted-A*"}, expected: 11},
        {g: 3, h: 3, weights: {gWeight: 2, hWeight: 0.5, name: "Weighted-A*"}, expected: 7.5},
        {g: 7, h: 2, weights: {gWeight: 1.2, hWeight: 1.5, name: "Weighted-A*"}, expected: 7 * 1.2 + 2 * 1.5},
        {g: 1e6, h: 1e6, weights: {gWeight: 1.5, hWeight: 2.5, name: "Stress-Test"}, expected: 1e6 * 1.5 + 1e6 * 2.5}
    ]

    it.each(tests)('should return $expected for calculateFCost($weights,$g,$h)', ({g, h, weights, expected}) => {
        expect(calculateFCost(weights, g, h)).toBeCloseTo(expected)
    });
})

describe("aStar", () => {

    describe("aStar - bad start and goal positions", () => {

        let invalidPositions: number[][] = []
        let weightGrid: number[][] = []

        beforeEach(() => {
            invalidPositions = Array.from({length: 10}, (_, i) => generateInvalidCoords(i))
            weightGrid = [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ];
            const outOfBoundsRow = weightGrid.length + 1
            const outOfBoundsCol = weightGrid[weightGrid.length - 1].length + 1
            invalidPositions.push([outOfBoundsRow, outOfBoundsCol])
            invalidPositions.push([0, outOfBoundsCol])
            invalidPositions.push([outOfBoundsRow, 0])
            //just add some more based on the out of bounds row or out of bounds column
            for (let i = 0; i < 20; i++) {
                const roll = Math.random() * 100
                if (roll < 25) {
                    invalidPositions.push([outOfBoundsRow + i, outOfBoundsCol])
                } else if (roll < 50) {
                    invalidPositions.push([outOfBoundsRow, outOfBoundsCol + i])
                } else if (roll < 75) {
                    invalidPositions.push([outOfBoundsRow + i, outOfBoundsCol + i])
                } else if (roll < 87.5) {
                    invalidPositions.push([0, outOfBoundsCol + i])
                } else {
                    invalidPositions.push([outOfBoundsRow + i, 0])
                }
            }
        })

        it('should return success=false when start position is outside grid', () => {
            invalidPositions.forEach(([row, col], index) => {
                const res = aStar(
                    weightGrid,
                    [row, col],
                    [weightGrid.length - 1, weightGrid[weightGrid.length - 1].length - 1],
                    manhattan,
                    {allowed: false},
                    {gWeight: 1, hWeight: 1, name: "AStar"},
                );
                expect(res.success, `Failed for position [${row}, ${col}] at index ${index}`).toBeFalsy();
            });
        });

        it('should return success=false when goal position is outside grid', () => {
            invalidPositions.forEach(([row, col], index) => {
                const res = aStar(
                    weightGrid,
                    [0, 0],
                    [row, col],
                    manhattan,
                    {allowed: false},
                    {gWeight: 1, hWeight: 1, name: "AStar"},
                );
                expect(res.success, `Failed for position [${row}, ${col}] at index ${index}`).toBeFalsy();
            });
        });

    })
    describe("aStar - start and goal is an impassable position", () => {
        let weightGrid: number[][] = []
        beforeEach(() => {
            weightGrid = [
                [0, 1, 1],
                [1, 1, 1],
                [1, 1, 0],
                [1, 1, 1]
            ];
        })
        it('should return success=false when start position is impassable', () => {
            const res = aStar(
                weightGrid,
                [0, 0],
                [1, 1],
                manhattan,
                {allowed: false},
                {gWeight: 1, hWeight: 1, name: "AStar"},
            );
            expect(res.success,).toBeFalsy();
        });

        it('should return success=false when goal position is impassable', () => {
            const res = aStar(
                weightGrid,
                [1, 1],
                [2, 2],
                manhattan,
                {allowed: false},
                {gWeight: 1, hWeight: 1, name: "AStar"},
            );
            expect(res.success,).toBeFalsy();
        });
    })
    describe("aStar - start and goal is the same position", () => {
        let weightGrid: number[][] = []
        beforeEach(() => {
            weightGrid = [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ];
        })
        it('should return success=true and path containing only the start position', () => {
            const res = aStar(
                weightGrid,
                [1, 1],
                [1, 1],
                manhattan,
                {allowed: false},
                {gWeight: 1, hWeight: 1, name: "AStar"},
            );
            expect(res.success).toBeTruthy();
            expect(res.value).toBeDefined();
            expect(res.value?.path).toHaveLength(1);
            expect(res.value?.path[0].pos[0]).toBe(1)
            expect(res.value?.path[0].pos[1]).toBe(1)
        });
        it('should return success=true and path containing only the start position', () => {
            const res = aStar(
                weightGrid,
                [1, 2],
                [1, 2],
                manhattan,
                {allowed: false},
                {gWeight: 1, hWeight: 1, name: "AStar"},
            );
            expect(res.success).toBeTruthy();
            expect(res.value).toBeDefined();
            expect(res.value?.path).toHaveLength(1);
            expect(res.value?.path[0].pos[0]).toBe(1)
            expect(res.value?.path[0].pos[1]).toBe(2)
        });
    })

})



function generateInvalidCoords(i: number): Pos {
    if (i === 0) {
        return [0, -1]
    }
    const roll = Math.random() * 100
    if (roll < 30) {
        return [i, -i]
    } else if (roll < 60) {
        return [-i, i]
    }
    return [-i, -i]
}