import type {PathData, Pos, Weights} from "~/types/pathfinding";
import {describe, expect, it} from "vitest";
import {aStar, calculateFCost} from "~/services/aStar";
import {manhattan} from "~/utils/heuristics";
import {isSamePos} from "~/utils/grid-helpers";
import type {Nullish} from "~/types/helpers";

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
    describe("aStar - cases where goal is not found", () => {
        describe("aStar - no diagonal allowed, gWeight = 1 and hWeight = 1, manhattan heuristic", () => {
            it('should return a fallback goal in pos 1,3', () => {
                const weightGrid: number[][] = [
                    [1, 1, 1, 1],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                ]
                const naturalEnd: Pos = [weightGrid.length - 1, weightGrid[weightGrid.length - 1].length - 1]
                const aStarInitialRes = aStar(weightGrid, [0, 0], naturalEnd, manhattan, {allowed: false}, {
                    gWeight: 1,
                    hWeight: 1,
                    name: "AStar"
                })
                expect(aStarInitialRes.success).toBeTruthy();
                expectDefinedAndNonNull(aStarInitialRes.value);

                expect(aStarInitialRes.value).toBeDefined();
                expectDefinedAndNonNull(aStarInitialRes.value.fallBack)

                expect(aStarInitialRes.value.fallBack.length).toBe(2);
                expect(aStarInitialRes.value.fallBack[0]).toEqual(1)
                expect(aStarInitialRes.value.fallBack[1]).toEqual(3)
                expectDefinedAndNonNull(aStarInitialRes.value.path)
                expectDefinedAndNonNull(aStarInitialRes.value.frontier)
                expectDefinedAndNonNull(aStarInitialRes.value.visitedOrder)

                const aStarFallbackGoalRes = aStar(weightGrid, [0, 0], aStarInitialRes.value.fallBack, manhattan, {allowed: false}, {
                    gWeight: 1,
                    hWeight: 1,
                    name: "AStar"
                })
                expect(aStarFallbackGoalRes.success).toBeTruthy();
                expectDefinedAndNonNull(aStarFallbackGoalRes.value)
                expect(aStarFallbackGoalRes.value.goalFound).toBeTruthy()
                expect(aStarFallbackGoalRes.value.fallBack).toBeNull();
                expectDefinedAndNonNull(aStarFallbackGoalRes.value.path)
                expectDefinedAndNonNull(aStarFallbackGoalRes.value.frontier)
                expectDefinedAndNonNull(aStarFallbackGoalRes.value.visitedOrder)


                //now we test both sets of data against each othe to make sure we are in sync
                expect(aStarInitialRes.value.frontier.length).toBe(aStarFallbackGoalRes.value.frontier.length)
                expect(aStarInitialRes.value.visitedOrder.length).toBe(aStarFallbackGoalRes.value.visitedOrder.length)

                expectPathsToBeEqual(aStarInitialRes.value.path, aStarFallbackGoalRes.value.path)

                for (let i = 0; i < aStarFallbackGoalRes.value.visitedOrder.length; i++) {
                    const currVisitedOrderFallbackElement = aStarFallbackGoalRes.value.visitedOrder[i]
                    const currVisitedOrderInitialResElement = aStarInitialRes.value.visitedOrder[i]

                    expect(isSamePos(currVisitedOrderFallbackElement.pos, currVisitedOrderInitialResElement.pos)).toBeTruthy()
                    expect(currVisitedOrderFallbackElement.fCost).toBeCloseTo(currVisitedOrderInitialResElement.fCost, 5)
                    expect(currVisitedOrderFallbackElement.hCost).toBeCloseTo(currVisitedOrderInitialResElement.hCost, 5)
                    expect(currVisitedOrderFallbackElement.gCost).toBeCloseTo(currVisitedOrderInitialResElement.gCost, 5)
                }
                for (let i = 0; i < aStarFallbackGoalRes.value.frontier.length; i++) {
                    for (let j = 0; j < aStarFallbackGoalRes.value.frontier[i].length; j++) {
                        const frontierFallbackElement = aStarFallbackGoalRes.value.frontier[i][j]
                        const frontierInitialResElement = aStarInitialRes.value.frontier[i][j]

                        expect(isSamePos(frontierFallbackElement.pos, frontierInitialResElement.pos)).toBeTruthy()
                        expect(frontierFallbackElement.fCost).toBeCloseTo(frontierInitialResElement.fCost, 5)
                        expect(frontierFallbackElement.hCost).toBeCloseTo(frontierInitialResElement.hCost, 5)
                        expect(frontierFallbackElement.gCost).toBeCloseTo(frontierInitialResElement.gCost, 5)
                    }

                }

            });

        })
    })

})

function expectPathsToBeEqual(path1: PathData[], path2: PathData[], precision: number = 5) {
    expectDefinedAndNonNull(path1)
    expectDefinedAndNonNull(path2)

    expect(path1.length).toBeGreaterThan(0)
    expect(path2.length).toBeGreaterThan(0)

    expect(path1.length).toBe(path2.length)
    expect(path1[0].from).toBeUndefined()
    expect(path2[0].from).toBeUndefined()

    for (let i = 0; i < path1.length; i++) {
        const path1Data = path1[i]
        const path2Data = path2[i]
        expect(isSamePos(path1Data.pos, path2Data.pos)).toBeTruthy()
        expect(path1Data.fCost, `fCost mismatch at index ${i}`).toBeCloseTo(path2Data.fCost, precision)
        expect(path1Data.hCost, `hCost mismatch at index ${i}`).toBeCloseTo(path2Data.hCost, precision)
        expect(path1Data.gCost, `gCost mismatch at index ${i}`).toBeCloseTo(path2Data.gCost, precision)
    }

}

function expectDefinedAndNonNull<T>(value: Nullish<T>): asserts value is T {
    expect(value).toBeDefined()
    expect(value).not.toBeNull()
}

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