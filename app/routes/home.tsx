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
        <div className={'flex flex-col'}>
            {/*{JSON.stringify(aStarResult.value)}*/}
            {/*{JSON.stringify(cellData)}*/}
            {cellData.map((data) => (
                <div className={'flex gap-x-1'}>
                    {data.map((cell) => {
                        const key = cell.pos.join(',')
                        return (
                            <div key={key}
                                 style={{
                                     height: "8rem",
                                     width: "8rem",
                                     backgroundColor: cell.state === "wall" ? "black" : "#dff2fe"
                                 }}
                                 className={` rounded flex items-center justify-center shadow-sm border border-sky-300 `}>
                                <p className="text-gray-800 font-medium">
                                    {cell.state}
                                </p>
                            </div>
                        )
                    })}
                </div>
            ))}
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
                                         height: "8rem",
                                         width: "8rem",
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
                if (val <= 0.1 && !isStart && !isGoal) {
                    return 0
                }
                return Math.floor(val * 100) + 1
            }
        )
    )
}

