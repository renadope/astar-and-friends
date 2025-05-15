import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import {manhattan} from "~/utils/heuristics";
import type {Pos} from "~/types/pathfinding";
import {useMemo, useState} from "react";
import {isNodePassable} from "~/utils/grid-helpers";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}

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
    "empty": "#f8fafc",
    "wall": "#334155",
    "visited": "#93c5fd",
    "frontier": "#fcd34d",
    "path": "#4ade80",
    "start": "#0ea5e9",
    "goal": "#f43f5e"
}

export default function Home() {
    // const weightGrid = [
    //     [12, 9001, 50],
    //     [9002, 28, 11000],
    //     [45, 800, 11212],
    // ]

    const size = 8
//use memo to fix this now, but will shove th`is in a reducer or state later
    const weightGrid = useMemo(() => generateRandomWeightGrid(size), [size])

    const aStarResult = aStar(weightGrid, [0, 0], [weightGrid.length - 1, weightGrid[0].length - 1], manhattan, {
        allowed: true,
        cornerCutting: 'strict'
    })

    const [cellData, setCellData] = useState<CellData[][]>(() => {
        return weightGrid.map((row, r) => {
            return row.map((weight, c) => {
                return {
                    pos: [r, c],
                    weight: weight,
                    state: isNodePassable(weight) ? "empty" : "wall"
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
    const {value: {costs, costUpdateHistory}} = aStarResult
    console.log(costUpdateHistory)

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
                                        height: "6rem",
                                        width: "6rem",
                                        backgroundColor: cellBgColor[cell.state] || "#dff2fe",
                                        transition: "all 0.2s ease-in-out"
                                    }}
                                    className="rounded-md flex flex-col items-center justify-center shadow-sm border border-sky-300 relative hover:scale-105"
                                    onClick={() => console.log(cell)}
                                >
                                    <p className={`text-xs font-semibold ${["wall", "path"].includes(cell.state) ? "text-white" : "text-gray-700"}`}>
                                        {cell.state}
                                    </p>

                                    <p className={`text-xs ${["wall", "path"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>
                                        {cell.pos.join(',')}
                                    </p>
                                    <p className={`text-xs ${["wall", "path"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>
                                        {cell.weight}
                                    </p>


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
                                         height: "6rem",
                                         width: "6rem",
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


function generateRandomWeightGrid(size: number, st?: Pos, goal?: Pos): number[][] {
    const start = st ?? [0, 0]
    const end = goal ?? [size - 1, size - 1]
    return Array.from({length: size}, (_, r) =>
        Array.from({length: size}, (_, c) => {
                const val = Math.random()
                const isStart = r === start[0] && c === start[1]
                const isGoal = r === end[0] && c === end[1]
                if (val <= 0.15 && !isStart && !isGoal) {
                    return 0
                }
                return Math.floor(val * 100) + 1
            }
        )
    )
}

{/* F, G, H values if they exist */
}
// {(cell.f !== undefined || cell.g !== undefined) && (
//     <div
//         className="absolute bottom-1 right-1 text-xs bg-white/70 text-black px-1 rounded-sm">
//         {cell.f !== undefined && <span>f:{cell.f}</span>}
//     </div>
// )}
