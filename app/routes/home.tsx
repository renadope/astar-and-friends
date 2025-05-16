import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import {euclidean} from "~/utils/heuristics";
import type {AStarNode, CostHistory} from "~/types/pathfinding";
import {useEffect, useReducer, useState} from "react";
import {isNodePassable, parsePos} from "~/utils/grid-helpers";
import {isNullOrUndefined} from "~/utils/helpers";
import {generateRandomCostGrid} from "~/utils/grid-generation";
import {predefinedWeightFuncs} from "~/utils/grid-weights";

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

type AppState = {
    weightGrid: number[][]
    cellData: CellData[][]
    costHistory: CostHistory[]
}
type Action =
    | { type: "GENERATE_GRID", payload: number, }
    | { type: "SET_CELL_DATA_COST_HISTORY" }
    | { type: "RUN_ASTAR" }

const initialState: AppState = {
    weightGrid: [],
    cellData: [],
    costHistory[]
}

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "GENERATE_GRID":
            const size = action.payload
            console.log(size)
            const weightGrid: number[][] = generateRandomCostGrid(size, predefinedWeightFuncs['random'])
            const cellData = weightGrid.map((row, r) => {
                return row.map((weight, c) => {
                    const cellData: CellData = {
                        pos: [r, c],
                        cost: weight,
                        state: isNodePassable(weight) ?
                            (r === 0 && c === 0) ? "start" :
                                (r === weightGrid.length - 1 && c === weightGrid[r].length - 1) ?
                                    "goal" : "empty" : "wall"
                    }
                    return cellData
                })
            })
            return {
                ...state,
                weightGrid: weightGrid,
                cellData: cellData
            }
        case "RUN_ASTAR":
            const start = [0, 0]
            const goal = [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1]
            const aStarResult = aStar(state.weightGrid, start, goal, heuristics.manhattan)
            if (!aStarResult.success) {
                // should provide a way for the ui to signal that the criterion wasn't met for Astar to be run
                return state
            }
            return {
                ...state,
                //can't remember if I'm supposed to assign or spread this, will double back to this.
                costHistory: [...aStarResult.value.costUpdateHistory]
            }
        case "SET_CELL_DATA_COST_HISTORY":
            if (state.cellData.length === 0) {
                return state
            }
            if (isNullOrUndefined(state.costHistory) || state.costHistory.length === 0) {
                return {...state, costHistory: []}
            }
            const cellData = copyCellData(state.cellData)
            for (const pair in costUpdateHistory) {
                const updateHistory = costUpdateHistory[pair] ?? []
                const pos = parsePos(pair)
                cellData[pos[0]][pos[1]].costUpdateHistory = [...updateHistory]
            }
            return {...state, cellData: cellData}
        default:
            return state
    }
}

export default function Home() {
    const size = 10
    const [searchDone, setSearchDone] = useState<boolean>(false)
    const [state, dispatch] = useReducer(reducer, initialState)
    const {weightGrid, cellData} = state

    const aStarResult = aStar(weightGrid, [0, 0], [weightGrid.length - 1, weightGrid[weightGrid.length - 1].length - 1], euclidean, {
        allowed: true,
        cornerCutting: 'strict'
    }, {gWeight: 1, hWeight: 1, name: "aStar"})


    if (!aStarResult.success) {
        return (
            <div className={'bg-red-500'}>
                <p className={'text-7xl'}>Sad</p>
            </div>
        )
    }
    const {value: {visitedOrder, frontier, path: pathData, costUpdateHistory}} = aStarResult
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
                dispatch({type: "SET_CELL_DATA_COST_HISTORY"})
            })
        }
    }, [searchDone])
    return (
        <div className={'flex p-4 bg-gray-50 rounded-lg shadow-sm gap-2 '}>
            <div className="flex flex-col gap-2">
                {cellData && cellData.length > 0 && cellData.map((row, r) => (
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
                                        border: `${1 + Math.min(4, Math.sqrt(cell.cost) * .7)}px solid ${costToColor(cell.cost)}`,
                                        // transform: `rotate(${(cell.cost % 3) - 1}deg) scale(${1 + cell.cost * 0.005})`


                                    }}
                                    className="rounded-md flex flex-col items-center justify-center shadow-sm relative hover:scale-105"
                                    onClick={() => console.log(cell)}
                                >
                                    <p className={`text-xs font-semibold ${["wall", "path", "visited"].includes(cell.state) ? "text-white" : "text-gray-700"}`}>
                                        {cell.state}
                                    </p>

                                    <p className={`text-xs ${["wall", "path", "visited"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>
                                        {cell.pos.join(',')}
                                    </p>
                                    <p className={`text-xs ${["wall", "visited"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>
                                        {cell.cost}
                                    </p>
                                    <p className={`text-xs ${["wall", "visited"].includes(cell.state) ? "text-white" : "text-gray-500"}`}>
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
            <button className={'bg-sky-500 '} onClick={() => {
                console.log('dispatching')
                dispatch({type: "GENERATE_GRID", payload: size})
            }}>Generate Grid
            </button>
            {/*<SimpleGrid grid={weightGrid}/>*/
            }
            {/*<SimpleGrid grid={costs}/>*/
            }
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
