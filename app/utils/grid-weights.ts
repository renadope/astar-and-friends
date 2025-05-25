export type CostAndWeight = Record<number, number>
export type CostAndWeightFunc = (r: number, c: number, size: number) => CostAndWeight

function biomeWeights(r: number, c: number, size: number): CostAndWeight {
    if (r < size / 3) {
        // Top of the map → Forest
        return {
            1: 0.2,  // plains
            3: 0.6,  // forest
            5: 0.1,  // swamp
            10: 0.04, // mountain
            0: 0.04,  // wall
            15: 0.01  // wall
        };
    } else if (r > size * 2 / 3) {
        // Bottom of the map → Mountain zone
        return {
            1: 0.1,
            3: 0.1,
            5: 0.2,
            100: 0.4,
            0: 0.15,
            15: 0.05
        };
    } else {
        // Middle of the map → Plains
        return {
            1: 6,
            3: 2,
            5: 1,
            10: .35,
            0: .25,
            15: 0.4
        };
    }
}


function getTerrain(_r: number, _c: number, _size: number): CostAndWeight {
    return {
        1: 3,
        3: 2.5,
        5: 2,
        10: 1,
        0: 1.5
    }
}

function diagonalCostGradient(r: number, c: number, size: number): CostAndWeight {

    const d = (r + c) / (2 * size);
    return {
        1: 1 - d,
        10: d
    };
}

function wallCorridorBias(r: number, c: number, size: number): CostAndWeight {

    if (c === Math.floor(size / 2)) return {10: 8, 0: 2, 15: 5, 20: 3};
    return {1: 8, 3: 2, 5: 5};
}

function circularBasin(r: number, c: number, size: number): CostAndWeight {
    const cx = size / 2, cy = size / 2;
    const dist = Math.sqrt((r - cx) ** 2 + (c - cy) ** 2);
    const norm = dist / (size / Math.sqrt(2)); // normalize to [0, 1]
    return {
        1: 1 - norm,
        5: norm * 0.5,
        10: norm * 0.5
    };
}

function centerRidge(r: number, c: number, size: number): CostAndWeight {
    const cx = size / 2, cy = size / 2;
    const dist = Math.sqrt((r - cx) ** 2 + (c - cy) ** 2);
    const norm = 1 - dist / (size / Math.sqrt(2));
    return {
        1: norm * 0.5,
        5: 1 - norm,
        10: (1 - norm) * 0.5,
        15: (1 - norm) * 0.4
    };
}

function fakeNoise(r: number, c: number, size: number): CostAndWeight {
    const val = Math.sin(r * 0.3) * Math.cos(c * 0.3); // range [-1, 1]
    const norm = (val + 1) / 2; // → [0, 1]
    return {
        1: 1 - norm,
        3: norm * 0.4,
        10: norm * 0.6
    };
}

function zeroToTenEven(r: number, c: number, size: number): CostAndWeight {
    const oneToTenEven: Map<number, number> = new Map<number, number>()
    for (let i = 0; i <= 10; i++) {
        oneToTenEven.set(i, 1)
    }
    return Object.fromEntries(oneToTenEven)
}

function uniform(r: number, c: number, size: number): CostAndWeight {
    return {
        1: 1
    }
}

function highCost(r: number, c: number, size: number): CostAndWeight {
    const costs = new Map<number, number>()
    for (let i = 20; i >= 0; i--) {
        const roll = Math.random()
        if (roll >= 0.5) {
            costs.set(i * 5, (i * (8 + Math.random())) + Math.random() + 1000)
            continue
        }
        costs.set(i * 5, (i * 10) + Math.random() + 1)
    }
    return Object.fromEntries(costs)
}


export type CostAndWeightKind =
    "biome"
    | "random"
    | "diagonal"
    | "wall"
    | "circularBasin"
    | "centerRidge"
    | "fake_noise"
    | "uniform"
    | "highCost"
    | "zeroToTenEven"

export const predefinedWeightFuncs: Record<CostAndWeightKind, CostAndWeightFunc> = {
    biome: biomeWeights,
    random: getTerrain,
    diagonal: diagonalCostGradient,
    wall: wallCorridorBias,
    circularBasin: circularBasin,
    centerRidge: centerRidge,
    fake_noise: fakeNoise,
    uniform: uniform,
    highCost: highCost,
    zeroToTenEven: zeroToTenEven
}
