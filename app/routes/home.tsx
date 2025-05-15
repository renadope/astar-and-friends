import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import {manhattan} from "~/utils/heuristics";
import type {Pos} from "~/types/pathfinding";
import {useEffect, useMemo, useState} from "react";
import {isNodePassable} from "~/utils/grid-helpers";
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
    weight: number,
    state: "empty" | "start" | "goal" | "wall" | "visited" | "frontier" | "path"
    g?: number,
    h?: number,
    f?: number,
    step?: number
    costUpdateHistory?: { step: number, gCost: number }[]
}
export const cellBgColor = {
    "empty": "#f1f5f9",      // slate-100
    "wall": "#334155",       // slate-800
    "visited": "#d8b4fe",    // purple-300
    "frontier": "#facc15",   // yellow-400
    "path": "#4ade80",       // green-400
    "start": "#0ea5e9",      // sky-500
    "goal": "#f43f5e"        // rose-500
};


export default function Home() {
    // const weightGrid = [
    //     [12, 9001, 50],
    //     [9000, 28, 11000],
    //     [45, 800, 11212],
    // ]


    const size = 8
//use memo to fix this now, but will shove th`is in a reducer or state later
    const weightGrid = useMemo(() => generateRandomWeightGrid(size), [size])
// const weightGrid=[
//     [1,  1,  1,  3,  5,  3,  1,  1,  1,  1],
//     [3, 10,  3,  1,  1,  1,  5, 10,  3,  1],
//     [1,  1,  1, 10, 10,  1,  1,  1,  5,  1],
//     [5,  5,  1,  1,  3,  5, 10,  1, 10,  1],
//     [1,  1,  3,  5,  1,  1,  1,  1,  1,  1],
//     [1, 10, 10,  1, 10,  5,  5,  3, 10,  1],
//     [1,  1,  1,  1,  1,  1, 10,  1,  1,  1],
//     [5,  5, 10, 10, 10,  1,  1,  5, 10,  1],
//     [1,  1,  1,  3,  5, 10,  3,  1,  1,  1],
//     [1,  5,  1,  1,  1,  1, 10, 10, 10,  1],
// ]
    const aStarResult = aStar(weightGrid, [0, 0], [weightGrid.length - 1, weightGrid[weightGrid.length - 1].length - 1], manhattan, {
        allowed: true,
        cornerCutting: 'lax'
    }, {gWeight: 1, hWeight: 1, name: "aStar"})

    useEffect(() => {
        if (!aStarResult.success) {
            return
        }
        const pathData = aStarResult.value.path
        const visitedData = aStarResult.value.visitedOrder
        const frontierData = aStarResult.value.frontier


        setTimeout(() => {
            setCellData((prev) => {
                const newData = copyCellData(prev)
                for (let i = 0; i < frontierData.length; i++) {
                    const aStarNodes = frontierData[i]
                    for (let j = 0; j < aStarNodes.length; j++) {
                        const aStarNode = aStarNodes[j]
                        if (!isNullOrUndefined(aStarNode)) {
                            const [r, c] = aStarNode.pos
                            const cellData = newData[r][c]
                            cellData.state = 'frontier'
                            cellData.pos = [r, c]
                            cellData.g = aStarNode.gCost
                            cellData.h = aStarNode.hCost
                            cellData.f = aStarNode.fCost
                        }
                    }
                }
                return newData
            })
        }, 1000)

        setTimeout(() => {
            setCellData((prev) => {
                const newData = copyCellData(prev)
                for (let i = 0; i < visitedData.length; i++) {
                    const cell = visitedData[i]
                    const pos = cell.pos
                    if (!isNullOrUndefined(pos)) {
                        const [r, c] = pos
                        const cellData = newData[r][c]
                        cellData.state = 'visited'
                        cellData.pos = pos
                        cellData.g = cell.gCost
                        cellData.h = cell.hCost
                        cellData.f = cell.fCost
                    }
                }
                return newData
            })
        }, 3000)

        setTimeout(() => {
            setCellData((prev) => {
                const newData = copyCellData(prev)
                for (let i = 0; i < pathData.length; i++) {
                    const cell = pathData[i]
                    const pos = cell.pos
                    if (!isNullOrUndefined(pos)) {
                        const [r, c] = pos
                        const cellData = newData[r][c]
                        cellData.state = 'path'
                        cellData.pos = pos
                        cellData.g = cell.gCost
                        cellData.h = cell.hCost
                        cellData.f = cell.fCost
                    }
                }
                return newData
            })
        }, 6000)
    }, []);

    const [cellData, setCellData] = useState<CellData[][]>(() => {
        return weightGrid.map((row, r) => {
            return row.map((weight, c) => {
                return {
                    pos: [r, c],
                    weight: weight,
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
    const {value: {costs,}} = aStarResult

    return (
        <div className={'flex p-4 bg-gray-50 rounded-lg shadow-sm gap-2 '}>
            <div className="flex flex-col gap-2">
                {cellData.map((row, r) => (
                    <div key={`col-${r}`} className="flex gap-2">
                        {row.map((cell, c) => {
                            const key = cell.pos.join(',');
                            return (
                                <div
                                    key={key}
                                    style={{
                                        height: `${gridCellSize}rem`,
                                        width: `${gridCellSize}rem`,
                                        backgroundColor: cellBgColor[cell.state] || "#dff2fe",
                                        transition: "all 0.2s ease-in-out"
                                    }}
                                    className="rounded-md flex flex-col items-center justify-center shadow-sm border border-sky-300 relative hover:scale-105"
                                    onClick={() => console.log(cell)}
                                >
                                    <p className={`text-xs font-semibold ${["wall", "path"].includes(cell.state) ? "text-white" : "text-gray-700"}`}>
                                        {cell.state}
                                    </p>

                                    {/*<p className={`text-xs ${["wall", "path"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>*/}
                                    {/*    {cell.pos.join(',')}*/}
                                    {/*</p>*/}
                                    <p className={`text-xs ${["wall", "path"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>
                                        {cell.weight}
                                    </p>

                                    {(cell.f !== undefined || cell.g !== undefined) && (
                                        <div
                                            className="absolute bottom-1 right-1 text-xs bg-white/70 text-black px-1 rounded-sm">
                                            {cell.f !== undefined && <span>f:{cell.f.toFixed(2)}</span>}
                                            {/*{cell.g !== undefined && <span>g:{cell.g.toFixed(0)}</span>}*/}
                                        </div>
                                    )}


                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <SimpleGrid grid={weightGrid}/>
            <SimpleGrid grid={costs}/>
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
function generateRandomWeightGrid(size: number, st?: Pos, goal?: Pos): number[][] {
    const start = st ?? [0, 0];
    const end = goal ?? [size - 1, size - 1];

    const terrainChances = [
        {cost: 1, weight: 0.35},
        {cost: 3, weight: 0.25},
        {cost: 5, weight: 0.2},
        {cost: 10, weight: 0.1},
        {cost: 0, weight: 0.1}
    ];

    //the weights must add up to 1!!!
    //cant have a greater than 1 probabilty now can we there buddy

    const terrainCDF: number[] = []
    for (let i = 0; i < terrainChances.length; i++) {
        const curr = terrainChances[i]
        terrainCDF.push(curr.weight + (terrainCDF[i - 1] ?? 0))
    }

    function pickTerrainCost() {
        const rand = Math.random();
        for (let i = 0; i < terrainCDF.length; i++) {
            if (rand <= terrainCDF[i]) return terrainChances[i].cost;
        }
        return 1;
    }

    return Array.from({length: size}, (_, r) =>
        Array.from({length: size}, (_, c) => {
            const isStart = r === start[0] && c === start[1];
            const isGoal = r === end[0] && c === end[1];
            if (isStart || isGoal) return 1;
            return pickTerrainCost();
        })
    );
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
