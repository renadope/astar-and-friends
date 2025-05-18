import type {Pos} from "~/types/pathfinding";

export type HeuristicFunc = (a: Pos, b: Pos) => number;
export type HeuristicName = "manhattan" | "euclidean" | "octile" | "chebyshev"
type HeuristicWeights = {
    [k in keyof HeuristicName]?: number
}

export function manhattan(a: Pos, b: Pos): number {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

export function euclidean(a: Pos, b: Pos): number {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

export function octile(a: Pos, b: Pos): number {
    const dx = Math.abs(a[0] - b[0]);
    const dy = Math.abs(a[1] - b[1]);
    const D = 1;
    const D2 = Math.SQRT2;
    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
}

export function chebyshev(a: Pos, b: Pos): number {
    const dx = Math.abs(a[0] - b[0]);
    const dy = Math.abs(a[1] - b[1]);
    return Math.max(dx, dy);
}

function composite(weights: HeuristicWeights): HeuristicFunc {
    return function (a: Pos, b: Pos): number {
        let total = 0
        let weightSum = 0
        Object.entries(weights).forEach(([key, weight]) => {
            if (weight && weight > 0 && key in heuristics) {
                const func = heuristics[key as keyof typeof heuristics]
                total += weight * func(a, b)
                weightSum += weight
            }

        })
        return weightSum > 0 ? total / weightSum : 0
    }
}

export const heuristics: Record<HeuristicName, HeuristicFunc> = {
    manhattan: manhattan,
    euclidean: euclidean,
    octile: octile,
    chebyshev: chebyshev,
}

