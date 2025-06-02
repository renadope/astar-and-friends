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

type HappyPathConfig = {
    weightGrid: number[][]
    start: Pos
    goal: Pos
    expectedCost: number
    expectedPathLength: number
    heuristic: HeuristicFunc
    allowedDiagonal: DiagonalConfig
    weights: Weights
}

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
    describe("aStar - happy path - goal is findable", () => {

        describe("aStar - no diagonal allowed, gWeight = 1 and hWeight = 1, manhattan heuristic", () => {
            const configs: HappyPathConfig[] = [
                {
                    weightGrid: [
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                    ],
                    start: [0, 0],
                    goal: [3, 3],
                    expectedCost: 7,
                    expectedPathLength: 7,
                    heuristic: manhattan,
                    allowedDiagonal: {allowed: false},
                    weights: {gWeight: 1, hWeight: 1, name: "AStar"}
                },
                {
                    weightGrid: [
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                    ],
                    start: [0, 0],
                    goal: [1, 1],
                    expectedCost: 3,
                    expectedPathLength: 3,
                    heuristic: manhattan,
                    allowedDiagonal: {allowed: false},
                    weights: {gWeight: 1, hWeight: 1, name: "AStar"}
                },
                {
                    weightGrid: [
                        [2, 2, 2, 2],
                        [2, 2, 2, 2],
                        [2, 2, 2, 2],
                        [2, 2, 2, 2],
                    ],
                    start: [0, 0],
                    goal: [3, 3],
                    expectedCost: 14,
                    expectedPathLength: 7,
                    heuristic: manhattan,
                    allowedDiagonal: {allowed: false},
                    weights: {gWeight: 1, hWeight: 1, name: "AStar"}
                },
            ]

            it.each(configs)('', (config) => {
                const aStarData = aStar(config.weightGrid,
                    config.start,
                    config.goal,
                    config.heuristic,
                    config.allowedDiagonal,
                    config.weights)

                expectDefinedAndNonNull(aStarData.value)
                expect(aStarData.success).toBeTruthy()
                expect(aStarData.value.goalFound).toBeTruthy()
                expect(aStarData.value.fallBack).toBeNull()
                expect(aStarData.value.totalCost).toBe(config.expectedCost)
                expect(aStarData.value.path.length).toBe(config.expectedPathLength)
            });

        })
    })

    describe("aStar - cases where goal is not found", () => {
        describe("aStar - no diagonal allowed, gWeight = 1 and hWeight = 1, manhattan heuristic", () => {
            const configs: FallBackConfig[] = [
                {
                    weightGrid: [
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [0, 0, 0, 0],
                        [1, 1, 1, 1],
                    ],
                    start: [0, 0],
                    expectedFallback: [1, 3],
                    goal: [3, 3],
                    heuristic: manhattan,
                    allowedDiagonal: {allowed: false},
                    weights: {gWeight: 1, hWeight: 1, name: "AStar"}
                },
                {
                    weightGrid: [
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [0, 0, 0, 0],
                        [1, 1, 1, 1],
                    ],
                    start: [0, 0],
                    expectedFallback: [1, 3],
                    goal: [3, 3],
                    heuristic: manhattan,
                    allowedDiagonal: {allowed: false},
                    weights: {gWeight: 1, hWeight: 1, name: "AStar"},
                },
                {
                    weightGrid: [
                        [1, 0, 1, 1],
                        [0, 0, 1, 1],
                        [0, 1, 0, 0],
                        [1, 0, 0, 1],
                    ],
                    start: [0, 0],
                    expectedFallback: [0, 0],
                    goal: [3, 3],
                    heuristic: manhattan,
                    allowedDiagonal: {allowed: false},
                    weights: {gWeight: 1, hWeight: 1, name: "AStar"},
                },
                {
                    weightGrid: [
                        [1, 0, 1, 0],
                        [1, 1, 1, 0],
                        [0, 1, 0, 0],
                        [1, 0, 0, 1],
                    ],
                    start: [0, 0],
                    expectedFallback: [2, 1],
                    goal: [3, 3],
                    heuristic: manhattan,
                    allowedDiagonal: {allowed: false},
                    weights: {gWeight: 1, hWeight: 1, name: "AStar"},
                }
            ]

            it.each(configs)('should return a fallback goal in pos [$expectedFallback] when goal at [$goal] is unreachable', (config) => {
                expectFallbackGoalRoundTripConsistency(config);
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
    expect(isSamePos(aStarInitialRes.value.fallBack, config.expectedFallback)).toBeTruthy();


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
    const lastPos = aStarFallbackGoalRes.value.path[aStarFallbackGoalRes.value.path.length - 1].pos
    expect(isSamePos(lastPos, aStarInitialRes.value.fallBack)).toBeTruthy()
    expectPathsToBeEqual(aStarInitialRes.value.path, aStarFallbackGoalRes.value.path)

}

function expectAStarNodeToBeEqual(node1: AStarNode, node2?: AStarNode, options?: {
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


function expectPathsToBeEqual(path1?: PathData[], path2?: PathData[], precision: number = 5) {
    expectDefinedAndNonNull(path1)
    expectDefinedAndNonNull(path2)

    expect(path1.length).toBeGreaterThan(0)
    expect(path2.length).toBeGreaterThan(0)

    expect(path1.length).toBe(path2.length)
    expect(path1[0].from).toBeUndefined()
    expect(path2[0].from).toBeUndefined()

    for (let i = 0; i < path1.length; i++) {
        const p1 = path1[i]
        const p2 = path2[i]
        const path1Data: AStarNode = {
            pos: p1.pos,
            fCost: p1.fCost,
            gCost: p1.gCost,
            hCost: p1.hCost
        }
        const path2Data: AStarNode = {
            pos: p2.pos,
            fCost: p2.fCost,
            gCost: p2.gCost,
            hCost: p2.hCost
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