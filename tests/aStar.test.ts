import type {AStarNode, DiagonalConfig, PathData, Pos, Weights} from "~/types/pathfinding";
import {describe, expect, it} from "vitest";
import {aStar, calculateFCost} from "~/services/aStar";
import {type HeuristicFunc, manhattan} from "~/utils/heuristics";
import {isSamePos, isValidPos} from "~/utils/grid-helpers";
import type {Nullish} from "~/types/helpers";
import {isNullOrUndefined} from "~/utils/helpers";

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

                expectFallbackGoalRoundTripConsistency({
                    weightGrid,
                    start: [0, 0],
                    expectedFallback: [1, 3],
                    goal: [3, 3],
                    heuristic: manhattan,
                    allowedDiagonal: {allowed: false},
                    weights: {gWeight: 1, hWeight: 1, name: "AStar"}
                })


            });

        })
    })

})

type FallBackConfig = {
    weightGrid: number[][]
    expectedFallback: Pos
    start: Pos
    goal: Pos
    heuristic: HeuristicFunc
    allowedDiagonal: DiagonalConfig
    weights: Weights
}

function expectFallbackGoalRoundTripConsistency(config: FallBackConfig) {

    expect(isValidPos(config.goal)).toBeTruthy();
    expect(isValidPos(config.start)).toBeTruthy();
    expect(isValidPos(config.expectedFallback)).toBeTruthy();

    const aStarInitialRes = aStar(config.weightGrid,
        config.start,
        config.goal,
        config.heuristic,
        config.allowedDiagonal,
        config.weights)

    expect(aStarInitialRes.success).toBeTruthy();
    expectDefinedAndNonNull(aStarInitialRes.value);
    expectDefinedAndNonNull(aStarInitialRes.value.fallBack)
    expect(aStarInitialRes.value.goalFound).toBeFalsy()

    expect(aStarInitialRes.value.fallBack.length).toBe(2);
    expect(aStarInitialRes.value.fallBack[0]).toEqual(config.expectedFallback[0])
    expect(aStarInitialRes.value.fallBack[1]).toEqual(config.expectedFallback[1])


    const aStarFallbackGoalRes = aStar(config.weightGrid,
        config.start,
        aStarInitialRes.value.fallBack,
        config.heuristic,
        config.allowedDiagonal,
        config.weights)

    expect(aStarFallbackGoalRes.success).toBeTruthy();
    expectDefinedAndNonNull(aStarFallbackGoalRes.value)
    expect(aStarFallbackGoalRes.value.goalFound).toBeTruthy()
    expect(aStarFallbackGoalRes.value.fallBack).toBeNull();

    //comparing both
    expect(aStarInitialRes.value.totalCost).toBe(aStarFallbackGoalRes.value.totalCost)
    expect(aStarInitialRes.value.steps).toBe(aStarFallbackGoalRes.value.steps)
    expect(aStarFallbackGoalRes.value.path[aStarFallbackGoalRes.value.path.length - 1].pos[0]).toBe(aStarInitialRes.value.fallBack[0])
    expect(aStarFallbackGoalRes.value.path[aStarFallbackGoalRes.value.path.length - 1].pos[1]).toBe(aStarInitialRes.value.fallBack[1])
    expectPrevMapsToBeEqual(aStarInitialRes.value.prevMap, aStarFallbackGoalRes.value.prevMap)
    expectPathsToBeEqual(aStarInitialRes.value.path, aStarFallbackGoalRes.value.path)
    expectVisitedOrderToBeEqual(aStarInitialRes.value.visitedOrder, aStarFallbackGoalRes.value.visitedOrder)
    expectFrontierToBeEqual(aStarInitialRes.value.frontier, aStarFallbackGoalRes.value.frontier)


}

function expectPrevMapsToBeEqual(prevMap1?: Map<string, string>, prevMap2?: Map<string, string>) {
    expectDefinedAndNonNull(prevMap1)
    expectDefinedAndNonNull(prevMap2)
    expect(prevMap1.size).toBeGreaterThan(0)
    expect(prevMap2.size).toBeGreaterThan(0)
    expect(prevMap1.size).toBe(prevMap2.size)
    for (const [key, value] of prevMap1) {
        expect(prevMap2.has(key), `missing key ${key}`).toBeTruthy()
        expect(prevMap2.get(key), `mismatch at ${key}`).toBe(value)
    }
}

function expectAStarNodeToBeEqual(node1?: AStarNode, node2?: AStarNode, options?: {
    precision?: number,
    index?: number
}) {
    expectDefinedAndNonNull(node1)
    expectDefinedAndNonNull(node2)
    const indexPhrase = !isNullOrUndefined(options) && !isNullOrUndefined(options.index) ? ` at index ${options.index}` : ""
    const precision = !isNullOrUndefined(options) && !isNullOrUndefined(options.precision) ? options.precision : 2
    expect(isSamePos(node1.pos, node2.pos)).toBeTruthy()
    expect(node1.fCost, `fCost mismatch${indexPhrase}`).toBeCloseTo(node2.fCost, precision)
    expect(node1.hCost, `hCost mismatch${indexPhrase}`).toBeCloseTo(node2.hCost, precision)
    expect(node1.gCost, `gCost mismatch${indexPhrase}`).toBeCloseTo(node2.gCost, precision)
}

function expectFrontierToBeEqual(frontier1?: AStarNode[][], frontier2?: AStarNode[][], precision: number = 5) {
    expectDefinedAndNonNull(frontier1)
    expectDefinedAndNonNull(frontier2)
    expect(frontier1.length).toBeGreaterThan(0)
    expect(frontier2.length).toBeGreaterThan(0)
    expect(frontier1.length).toBe(frontier2.length)

    for (let i = 0; i < frontier1.length; i++) {
        expect(frontier1[i].length, `frontier length mismatch at ${i} `).toBe(frontier2[i].length)
        for (let j = 0; j < frontier1[i].length; j++) {
            const f1 = frontier1[i][j]
            const f2 = frontier2[i][j]
            //cant pass i, j so we would have to look at the index i and compare there
            expectAStarNodeToBeEqual(f1, f2, {index: i, precision: precision})
        }
    }
}

function expectVisitedOrderToBeEqual(visitedOrder1?: AStarNode[], visitedOrder2?: AStarNode[], precision: number = 5) {
    expectDefinedAndNonNull(visitedOrder1)
    expectDefinedAndNonNull(visitedOrder2)

    expect(visitedOrder1.length).toBeGreaterThan(0)
    expect(visitedOrder2.length).toBeGreaterThan(0)
    expect(visitedOrder1.length).toBe(visitedOrder2.length)
    for (let i = 0; i < visitedOrder1.length; i++) {
        const path1Data = visitedOrder1[i]
        const path2Data = visitedOrder2[i]
        expectAStarNodeToBeEqual(path1Data, path2Data, {index: i, precision: precision})
    }

}

function expectPathsToBeEqual(path1?: PathData[], path2?: PathData[], precision: number = 5) {
    expectDefinedAndNonNull(path1)
    expectDefinedAndNonNull(path2)

    expect(path1.length).toBeGreaterThan(0)
    expect(path2.length).toBeGreaterThan(0)

    expect(path1.length).toBe(path2.length)
    expect(path1[0].from).toBeUndefined()
    expect(path2[0].from).toBeUndefined()

    for (let i = 0; i < path1.length; i++) {
        const path1Data: AStarNode = {
            pos: path1[i].pos,
            fCost: path1[i].fCost,
            gCost: path1[i].gCost,
            hCost: path1[i].hCost
        }
        const path2Data: AStarNode = {
            pos: path2[i].pos,
            fCost: path2[i].fCost,
            gCost: path2[i].gCost,
            hCost: path2[i].hCost
        }
        expectAStarNodeToBeEqual(path1Data, path2Data, {index: i, precision: precision})
    }

}

function expectDefinedAndNonNull<T>(value: Nullish<T>, message?: string): asserts value is T {
    expect(value, message).toBeDefined()
    expect(value, message).not.toBeNull()
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