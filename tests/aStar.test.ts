import type {Weights} from "~/types/pathfinding";
import {expect, it} from "vitest";
import {calculateFCost} from "~/services/aStar";

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