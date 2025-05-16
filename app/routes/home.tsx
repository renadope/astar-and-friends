import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import {euclidean} from "~/utils/heuristics";
import type {AStarNode, Pos} from "~/types/pathfinding";
import {useEffect, useMemo, useState} from "react";
import {isNodePassable, parsePos} from "~/utils/grid-helpers";
import {isNullOrUndefined} from "~/utils/helpers";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}

//rem
const gridCellSize = 6

type CellData = {
    pos: [number, number]
    cost: number,
    state: "empty" | "start" | "goal" | "wall" | "visited" | "frontier" | "path"
    g?: number,
    h?: number,
    f?: number,
    step?: number
    costUpdateHistory?: { step: number, gCost: number }[]
}
export const cellBgColor = {
    "empty": "#f8fafc",      // slate-50 – neutral background
    "wall": "#334155",       // slate-800 – sturdy and dark
    "visited": "#c084fc",    // purple-400 – brighter, playful violet
    "frontier": "#fde047",   // yellow-300 – golden and cheerful
    "path": "#34d399",       // emerald-400 – balanced, modern trail
    "start": "#0ea5e9",      // sky-500 – distinct blue entry point
    "goal": "#f43f5e"        // rose-500 – emotional, urgent destination
};



export default function Home() {
    const size = 10
    const [searchDone, setSearchDone] = useState<boolean>(false)
//use memo to fix this now, but will shove this in a reducer or state later
    const weightGrid = useMemo(() => generateRandomCostGrid(size, circularBasin), [size])
    // const weightGrid = [
    //     [1, 1, 10, 3, 5, 3, 12, 1, 1, 11],
    //     [3, 10, 3, 1, 1, 1, 5, 10, 3, 1],
    //     [1, 1, 1, 10, 10, 1, 1, 1, 5, 1],
    //     [5, 5, 1, 1, 3, 5, 10, 1, 10, 1],
    //     [1, 1, 31, 51, 1, 1, 1, 1, 1, 1],
    //     [1, 10, 10, 14, 10, 5, 5, 3, 10, 1],
    //     [1, 1, 1, 1, 1, 1, 10, 1, 1, 12],
    //     [50, 5, 10, 10, 10, 1, 1, 5, 10, 12],
    //     [1, 1, 12, 3, 5, 10, 3, 1, 1, 1],
    //     [10, 10, 20, 30, 40, 50, 60, 70, 80, 99],
    //     [99, 80, 70, 60, 50, 40, 30, 20, 10, 1],
    // ]
    const aStarResult = aStar(weightGrid, [0, 0], [weightGrid.length - 1, weightGrid[weightGrid.length - 1].length - 1], euclidean, {
        allowed: true,
        cornerCutting: 'strict'
    }, {gWeight: 1, hWeight: 1, name: "aStar"})

    const [cellData, setCellData] = useState<CellData[][]>(() => {
        return weightGrid.map((row, r) => {
            return row.map((weight, c) => {
                return {
                    pos: [r, c],
                    cost: weight,
                    state: isNodePassable(weight) ?
                        (r === 0 && c === 0) ? "start" :
                            (r === weightGrid.length - 1 && c === weightGrid[r].length - 1) ?
                                "goal" : "empty" : "wall"
                } as CellData
            })
        })
    })

    if (!aStarResult.success) {
        return (
            <div className={'bg-red-500'}>
                <p className={'text-7xl'}>Sad</p>
            </div>
        )
    }
    const {value: {costs, visitedOrder, frontier, path: pathData, costUpdateHistory}} = aStarResult
    const animaionSteps = buildAnimationSteps(visitedOrder, frontier)

    function animatePath(path: typeof pathData, onUpdate: typeof setCellData, delay: number = 40, onFinish: () => void) {
        let i = 0

        function next() {
            if (i >= path.length) {
                onFinish()
                return
            }
            const step = pathData[i]
            onUpdate((prev) => {
                const grid = copyCellData(prev)

                if (!isNullOrUndefined(step)) {
                    const [r, c] = step.pos
                    const cellData = grid[r][c]
                    cellData.state = 'path'
                    cellData.pos = step.pos
                    cellData.g = step.gCost
                    cellData.h = step.hCost
                    cellData.f = step.fCost
                }
                return grid
            })
            i++
            setTimeout(next, delay)
        }

        next()
    }

    function animateVisitedAndFrontier(steps: AnimationStep[], onUpdate: typeof setCellData, delay: number = 40, onFinish: () => void) {
        let i = 0

        function next() {
            if (i >= steps.length) {
                onFinish()
                return
            }
            const step = animaionSteps[i]
            onUpdate((prev) => {

                const grid = copyCellData(prev)

                if (step.type === "frontier") {
                    for (let j = 0; j < step.nodes.length; j++) {
                        const aStarNode = step.nodes[j]
                        if (!isNullOrUndefined(aStarNode)) {
                            const [r, c] = aStarNode.pos

                            const cellData = grid[r][c]
                            cellData.state = 'frontier'
                            cellData.pos = [r, c]
                            cellData.g = aStarNode.gCost
                            cellData.h = aStarNode.hCost
                            cellData.f = aStarNode.fCost
                        }
                    }

                } else if (step.type === "visited") {
                    const [r, c] = step.node.pos
                    const cellData = grid[r][c]
                    cellData.state = 'visited'
                    cellData.pos = step.node.pos
                    cellData.g = step.node.gCost
                    cellData.h = step.node.hCost
                    cellData.f = step.node.fCost

                }
                return grid
            })
            i++
            setTimeout(next, delay)
        }

        next()
    }

    useEffect(() => {
        animateVisitedAndFrontier(animaionSteps, setCellData, 100, () => {
            setSearchDone(true)
        })
    }, [])

    useEffect(() => {
        if (searchDone) {
            animatePath(pathData, setCellData, 150, () => {
                console.log("foo")
                setCellData((prev) => {
                    const grid = copyCellData(prev)
                    for (const pair in costUpdateHistory) {
                        const updateHistory = costUpdateHistory[pair] ?? []
                        const pos = parsePos(pair)
                        grid[pos[0]][pos[1]].costUpdateHistory = [...updateHistory]
                    }
                    return grid
                })
            })
        }
    }, [searchDone])
    return (
        <div className={'flex p-4 bg-gray-50 rounded-lg shadow-sm gap-2 '}>
            <div className="flex flex-col gap-2">
                {cellData.map((row, r) => (
                    <div key={`col-${r}`} className="flex gap-1">
                        {row.map((cell, c) => {
                            const key = cell.pos.join(',');
                            return (
                                <div
                                    key={key}
                                    style={{
                                        height: `${gridCellSize}rem`,
                                        width: `${gridCellSize}rem`,
                                        backgroundColor: cellBgColor[cell.state] || "#dff2fe",
                                        transition: "all 0.2s ease-in-out",
                                        //
                                        border: `${1 + (Math.sin(cell.cost * 2) + Math.cos(cell.cost * 0.5)) * 0.4}px solid ${costToColor(cell.cost)}`,
                                        // transform: `rotate(${(cell.cost % 3) - 1}deg) scale(${1 + cell.cost * 0.005})`



                                    }}
                                    className="rounded-md flex flex-col items-center justify-center shadow-sm relative hover:scale-105"
                                    onClick={() => console.log(cell)}
                                >
                                    <p className={`text-xs font-semibold ${["wall", "path","visited"].includes(cell.state) ? "text-white" : "text-gray-700"}`}>
                                        {cell.state}
                                    </p>

                                    <p className={`text-xs ${["wall", "path","visited"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>
                                        {cell.pos.join(',')}
                                    </p>
                                    <p className={`text-xs ${["wall","visited"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>
                                        {cell.cost}
                                    </p>
                                    <p className={`text-xs ${["wall","visited"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>
                                        {cell.costUpdateHistory ? cell.costUpdateHistory.length + " updates" : ""}
                                    </p>

                                    {/*{(cell.f !== undefined || cell.g !== undefined) && (*/}
                                    {/*    <div*/}
                                    {/*        className="absolute bottom-1 right-1 text-xs bg-white/70 text-black px-1 rounded-sm">*/}
                                    {/*        {cell.f !== undefined && <span>f:{cell.f.toFixed(2)}</span>}*/}
                                    {/*        /!*{cell.g !== undefined && <span>g:{cell.g.toFixed(0)}</span>}*!/*/}
                                    {/*    </div>*/}
                                    {/*)}*/}


                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            {/*<SimpleGrid grid={weightGrid}/>*/}
            {/*<SimpleGrid grid={costs}/>*/}
        </div>
    )
}

type SimpleGridProps = {
    grid: number[][]
}

function SimpleGrid({grid}: SimpleGridProps) {
    return (
        <div className={'flex flex-col gap-2'}>
            {grid.map((row, r) => (
                    <div key={r} className={'flex gap-x-0.5'}>
                        {row.map((value, c) => {
                            const key = `${r},${c}`
                            return (
                                <div key={key}
                                     style={{
                                         height: `${gridCellSize}rem`,
                                         width: `${gridCellSize}rem`,
                                         backgroundColor: "#dff2fe"
                                     }}
                                     className={` rounded flex items-center justify-center shadow-sm border border-sky-300 `}>
                                    <p className="text-gray-800 font-medium">
                                        {value.toFixed(2)}</p>
                                </div>
                            )
                        })}
                    </div>
                )
            )}
        </div>
    )

}


// function generateRandomWeightGrid(size: number, st?: Pos, goal?: Pos): number[][] {
//     const start = st ?? [0, 0]
//     const end = goal ?? [size - 1, size - 1]
//     return Array.from({length: size}, (_, r) =>
//         Array.from({length: size}, (_, c) => {
//                 const val = Math.random()
//                 const isStart = r === start[0] && c === start[1]
//                 const isGoal = r === end[0] && c === end[1]
//                 if (val <= 0.05 && !isStart && !isGoal) {
//                     return 0
//                 }
//                 return Math.floor(val * 1000) + 1
//             }
//         )
//     )
// }

//The first number represents the cost that we want to select, and the second number represents the odds of that cost being selected
type CostAndWeight = Record<number, number>

type CDFEntry = {
    cost: number,
    threshold: number
}
type CDF = CDFEntry []

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

type CostAndWeightFunc = (r: number, c: number, size: number) => CostAndWeight

function getTerrain(): CostAndWeightFunc {
    return (_r: number, _c: number, _size: number) => {
        return {
            1: 3,
            3: 2.5,
            5: 2,
            10: 1,
            0: 1.5
        }
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

    if (c === Math.floor(size / 2)) return {10: 8, 0: 2, 15: 5};
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


function generateRandomCostGrid(size: number,
                                getCostAndWeight: CostAndWeightFunc,
                                st?: Pos,
                                goal?: Pos): number[][] {
    const start = st ?? [0, 0];
    const end = goal ?? [size - 1, size - 1];


    const grid: number[][] = []
    for (let r = 0; r < size; r++) {
        const row: number[] = []
        for (let c = 0; c < size; c++) {
            const cdf = buildCDF(getCostAndWeight(r, c, size))
            const roll = Math.random()
            const terrainWeight = cdf.find((costAndThreshold) => roll <= costAndThreshold.threshold)
            const isStart = r === start[0] && c === start[1];
            const isGoal = r === end[0] && c === end[1];
            if (isStart || isGoal) {
                //Perhaps later on, we generate the positive number in a range
                row.push(1)
            } else {
                row.push(terrainWeight ? terrainWeight.cost : 1)
            }
        }
        grid.push(row)
    }

    return grid
}

function buildCDF(costAndWeight: CostAndWeight): CDF {

    //Sorting makes it more consistent
    //We don't need to create the entries array, could have just manipulated the object directly,
    //but I wanted the sorted order of the costs so that we can see it the same each time
    const entries = Object.entries(costAndWeight).map(([cost, weight]) => {
        return {
            cost: Number(cost),
            weight: weight
        }

    }).sort((a, b) => a.cost - b.cost)
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0)
    let cumulative = 0
    return entries.map(({cost, weight}) => {
        cumulative += weight
        return {
            cost: cost,
            //normalizing the cumulative sum so that they all always add up to 1
            threshold: cumulative / total
        }
    })

}

function copyCellData(cellData: CellData[][]): CellData[][] {
    return cellData.map((row) => row.map((cell) => ({...cell} as CellData)))

}

{/* F, G, H values if they exist */
}
// {(cell.f !== undefined || cell.g !== undefined) && (
//     <div
//         className="absolute bottom-1 right-1 text-xs bg-white/70 text-black px-1 rounded-sm">
//         {cell.f !== undefined && <span>f:{cell.f}</span>}
//     </div>
// )}

//not gonna use this method, but wanted a quick and dirty way to just see the weights without inspecting
function costToColor(cost: number): string {
    if (cost === 0) return "#334155"; // wall — dark and sturdy (unchanged)

    if (cost < 3) return "#22d3ee";   // cyan-400 — easy, chill terrain
    if (cost < 5) return "#fcd34d";   // yellow-300 — sandy, cautious zone
    if (cost < 8) return "#fb923c";   // orange-400 — rugged area
    if (cost < 15) return "#f87171";  // red-400 — painful, but passable
    return "#c084fc";                // purple-400 — extreme zone
}

type AnimationStep = {
    type: "frontier"
    nodes: AStarNode[]
    node?: never
} | {
    type: "visited"
    node: AStarNode
    nodes?: never
}

function buildAnimationSteps(visitedOrder: AStarNode[],
                             frontierOrder: AStarNode[][]): AnimationStep[] {
    const arr: AnimationStep [] = []
    if (visitedOrder.length !== frontierOrder.length) {
        throw new Error("both should have the same length")
    }
    for (let i = 0; i < visitedOrder.length; i++) {
        const visitedSnapshot = visitedOrder[i]
        const frontierSnapshot = frontierOrder[i]
        arr.push({type: "frontier", nodes: frontierSnapshot})
        arr.push({type: "visited", node: visitedSnapshot})
    }
    return arr
}
