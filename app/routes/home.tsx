import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import type {AStarData, AStarNode, PathData, Pos} from "~/types/pathfinding";
import {useEffect, useReducer} from "react";
import {isNodePassable, parsePos} from "~/utils/grid-helpers";
import {isNullOrUndefined} from "~/utils/helpers";
import {generateRandomCostGrid} from "~/utils/grid-generation";
import {predefinedWeightFuncs} from "~/utils/grid-weights";
import {heuristics} from "~/utils/heuristics";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}

//rem
const gridCellSize = 7

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
const cellBgColor = {
    "empty": "#f8fafc",      // slate-50 – neutral background
    "wall": "#334155",       // slate-800 – sturdy and dark
    "visited": "#c084fc",    // purple-400 – brighter, playful violet
    "frontier": "#fde047",   // yellow-300 – golden and cheerful
    "path": "#34d399",       // emerald-400 – balanced, modern trail
    "start": "#0ea5e9",      // sky-500 – distinct blue entry point
    "goal": "#f43f5e"        // rose-500 – emotional, urgent destination
};
const textColors: Record<keyof typeof cellBgColor, string> = {
    wall: "text-white",
    path: "text-white",
    visited: "text-white",
    start: "text-white",
    goal: "text-white",
    empty: "text-slate-800",
    frontier: "text-slate-950"
};

type AppState = {
    weightGrid: number[][]
    cellData: CellData[][]
    gridSize: number
    // activeTimeline: 'granular' | 'snapshot'
    snapshotTimeline: AnimationStep[],
    granularTimeline: FlattenedStep[]
    currentTimelineIndex: number,
    aStarData: AStarData | undefined
}
type Action =
    | { type: "GENERATE_GRID", payload?: number, }
    | { type: "SET_CELL_DATA_COST_HISTORY" }
    | { type: "RUN_ASTAR" }
    | { type: "SET_GRID_SIZE", payload?: number }
    | { type: "INCREMENT_INDEX", payload?: number }
    | { type: "SET_INDEX", payload: number }
    | { type: "DECREMENT_INDEX", payload?: number }
    | { type: "UPDATE_CELL_DATA", }

const initialState: AppState = {
    weightGrid: [],
    cellData: [],
    snapshotTimeline: [],
    granularTimeline: [],
    currentTimelineIndex: 0,
    gridSize: 10,
    aStarData: undefined,
    // activeTimeline: 'granular'
}

function initCellData(weightGrid: number[][], start?: Pos, goal?: Pos): CellData[][] {
    const st = start ?? [0, 0]
    const end = goal ?? [weightGrid.length - 1, weightGrid[weightGrid.length - 1].length - 1]
    return weightGrid.map((row, r) => {
        return row.map((weight, c) => {
            const cellData: CellData = {
                pos: [r, c],
                cost: weight,
                state: isNodePassable(weight) ?
                    (r === st[0] && c === st[1]) ? "start" :
                        (r === end[0] && c === end[1]) ?
                            "goal" : "empty" : "wall"
            }
            return cellData
        })
    })
}

function updateCellData(timeline: FlattenedStep[], cellData: CellData[][]): CellData[][] {
    const newCellData = copyCellData(cellData)
    for (let i = 0; i < timeline.length; i++) {
        const timeLineNode = timeline[i]
        if (isNullOrUndefined(timeLineNode)) {
            continue
        }
        const [r, c] = timeLineNode.node.pos
        const cell = newCellData[r][c]
        if (isNullOrUndefined(cell)) {
            continue
        }
        cell.state = timeLineNode.type
        cell.pos = [r, c]
        cell.g = timeLineNode.node.gCost
        cell.h = timeLineNode.node.hCost
        cell.f = timeLineNode.node.fCost
        cell.step = i

    }
    return newCellData
}

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "GENERATE_GRID":
            const size = action.payload ?? state.gridSize ?? 5
            const weightGrid: number[][] = generateRandomCostGrid(size, predefinedWeightFuncs['wall'])
            const cellData = initCellData(weightGrid)
            return {
                ...state,
                currentTimelineIndex: 0,
                weightGrid: weightGrid,
                cellData: cellData
            }
        case "RUN_ASTAR":
            if (isNullOrUndefined(state.weightGrid) || state.weightGrid.length === 0) {
                return state
            }
            const start: Pos = [0, 0]
            const goal: Pos = [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1]
            const aStarResult = aStar(state.weightGrid, start, goal, heuristics.manhattan, {
                allowed: true,
                cornerCutting: 'strict'
            })

            if (!aStarResult.success) {
                // should provide a way for the ui to signal that the criterion wasn't met for Astar to be run
                return state
            }
            const snapshotTimeline = buildTimeline(aStarResult.value.visitedOrder, aStarResult.value.frontier, aStarResult.value.path)
            const granularTimeline = flattenedTimeline(snapshotTimeline)
            return {
                ...state,
                aStarData: aStarResult.value,
                snapshotTimeline,
                granularTimeline,
            }
        case "SET_CELL_DATA_COST_HISTORY":
            if (state.cellData.length === 0 || isNullOrUndefined(state.aStarData)) {
                return state
            }
            const cellDataGrid = copyCellData(state.cellData)
            const costUpdateHistory = state.aStarData.costUpdateHistory
            for (const pair in costUpdateHistory) {
                const updateHistory = costUpdateHistory[pair] ?? []
                const pos = parsePos(pair)
                cellDataGrid[pos[0]][pos[1]].costUpdateHistory = [...updateHistory]
            }
            return {...state, cellData: cellDataGrid}
        case "SET_GRID_SIZE":
            //this one needs a bit more on it, like do we regen a grid, do we 'trim' the grid
            const givenSize = Math.abs(action.payload ?? 5)
            return {
                ...state,
                gridSize: Math.max(2, Math.min(10, givenSize))
            }
        case "INCREMENT_INDEX":
            const incrStep = Math.abs(action.payload ?? 1)
            return {
                ...state,
                currentTimelineIndex: state.currentTimelineIndex + incrStep
            }
        case "DECREMENT_INDEX":
            const decrStep = Math.abs(action.payload ?? 1)
            return {
                ...state,
                currentTimelineIndex: Math.max(0, state.currentTimelineIndex - decrStep)
            }
        case "UPDATE_CELL_DATA":
            if (isNullOrUndefined(state.weightGrid) || state.weightGrid.length === 0) {
                return state
            }
            const idx = Math.min(state.granularTimeline.length - 1, state.currentTimelineIndex)
            const adjustedTimeline = state.granularTimeline.slice(0, idx + 1)
            const initCell = initCellData(state.weightGrid)
            return {
                ...state,
                cellData: updateCellData(adjustedTimeline, initCell)
            }
        case "SET_INDEX":
            const setIndexIdx = action.payload
            return {
                ...state,
                currentTimelineIndex: setIndexIdx
            }

        default:
            return state
    }
}

export default function Home() {
    const size = 8
    const [state, dispatch] = useReducer(reducer, initialState)
    const {cellData, currentTimelineIndex, granularTimeline: timeline, aStarData} = state
    useEffect(() => {
        if (state.weightGrid.length === 0) {
            return
        }
        dispatch({type: 'UPDATE_CELL_DATA'})
    }, [currentTimelineIndex]);

    useEffect(() => {
        if (isNullOrUndefined(aStarData) || state.weightGrid.length === 0) {
            return
        }
        if (currentTimelineIndex > timeline.length - 1) {
            return
        }
        const interval = setInterval(() => {
            dispatch({
                type: 'INCREMENT_INDEX'
            })
        }, 100)
        return () => clearInterval(interval)

    }, [aStarData, currentTimelineIndex, timeline.length])


    return (
        <div className={'flex p-4 bg-gray-50 rounded-lg shadow-sm gap-2 '}>
            <div
                className="flex flex-col gap-2 transition-all ease-in-out duration-300 p-4 bg-gradient-to-br from-slate-100 to-sky-50 rounded-xl shadow-lg">
                {cellData && cellData.length > 0 && cellData.map((row, r) => (
                    <div key={`col-${r}`} className="flex gap-0.5 hover:gap-1 transition-all duration-300">
                        {row.map((cell, c) => {
                            const key = cell.pos.join(',');
                            const isCurrentStep = cell.step === currentTimelineIndex;
                            const isInteractive = ["start", "end", "empty"].includes(cell.state);
                            return (
                                <div
                                    key={key}
                                    style={{
                                        height: `${gridCellSize}rem`,
                                        width: `${gridCellSize}rem`,
                                        backgroundColor: cellBgColor[cell.state] || "#dff2fe",
                                        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                        border: `${1 + Math.min(4, Math.sqrt(cell.cost) * .7)}px solid ${costToColor(cell.cost)}`,
                                        boxShadow: isCurrentStep ? "0 0 15px 5px rgba(59, 130, 246, 0.5)" :
                                            cell.state === "path" ? "0 0 8px rgba(16, 185, 129, 0.6)" :
                                                "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                    className={`
                        ${isCurrentStep ? 'scale-125 animate-pulse' : 'scale-100'} 
                        ${cellBgColor[cell.state] || "bg-sky-100"}
                        ${isInteractive ? "hover:scale-110 cursor-pointer" : ""}
                        transition-all duration-300 rounded-md flex flex-col items-center 
                        justify-center relative backdrop-blur-sm
                        ${cell.state === "path" && isCurrentStep ? "animate-bounce" : ""}
                        `}
                                    onClick={() => {
                                        console.log(cell);
                                        // Add haptic feedback if available
                                        //oh man this looks cool ad
                                        if (window.navigator && window.navigator.vibrate) {
                                            window.navigator.vibrate(50);
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        if (cell.costUpdateHistory && cell.costUpdateHistory.length > 0) {
                                            e.currentTarget.setAttribute('title', `Cost updates: ${cell.costUpdateHistory.join(' → ')}`);
                                        }
                                    }}
                                >
                                    <div className="flex flex-col items-center w-full h-full justify-center group">
                                        <p className={`text-xs font-bold ${textColors[cell.state] || "text-slate-700"} transition-all duration-200 group-hover:text-lg`}>
                                            {cell.state}
                                        </p>

                                        <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                            {cell.pos.join(',')}
                                        </p>

                                        {cell.cost > 0 && (
                                            <div className={`text-xs ${textColors[cell.state] || "text-slate-500"} 
                                    ${cell.cost > 10 ? "font-bold" : ""}
                                    transition-all duration-200 group-hover:scale-110`}>
                                                {cell.cost}
                                            </div>
                                        )}

                                        {cell.costUpdateHistory && cell.costUpdateHistory.length > 0 && (
                                            <div
                                                className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs px-1 rounded-full shadow-sm transform transition-transform group-hover:scale-125">
                                                {cell.costUpdateHistory.length}
                                            </div>
                                        )}
                                    </div>

                                    {(cell.state === "path" || isCurrentStep) && (
                                        <div
                                            className="absolute inset-0 rounded-md bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    )}

                                    {cell.f !== undefined && (
                                        <div
                                            className="absolute top-0 right-0 text-xs bg-white/80 text-black px-1 py-0.5 rounded-bl-md rounded-tr-md font-mono shadow-sm">
                                            f:{cell.f.toFixed(1)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {["wall", "path", "visited", "start", "end", "empty"].map(state => (
                        <div key={state}
                             className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded-full shadow-sm">
                            <div className={`w-3 h-3 rounded-full bg-${state === "wall" ? "slate-800" :
                                state === "path" ? "emerald-500" :
                                    state === "visited" ? "violet-600" :
                                        state === "start" ? "blue-500" :
                                            state === "end" ? "red-500" : "sky-100"}`}></div>
                            <span className="text-xs text-slate-700 capitalize">{state}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex gap-4 mt-4">
                <button
                    onClick={() => dispatch({type: "DECREMENT_INDEX"})}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    ⬅ Back
                </button>

                <button
                    onClick={() => dispatch({type: "INCREMENT_INDEX"})}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    Next ➡
                </button>
                <button className={'bg-sky-500 '} onClick={() => {
                    console.log('dispatching')
                    dispatch({type: "GENERATE_GRID", payload: size})
                    dispatch({type: "RUN_ASTAR"})

                }}>Generate Grid:{currentTimelineIndex}
                </button>
                <button className={'bg-rose-300 hover:bg-rose-400 '} onClick={() => {
                    console.log('dispatching')
                    dispatch({type: "RUN_ASTAR"})
                }}>Run A*
                </button>
            </div>

            <div className="w-full flex items-center gap-4 py-4">
                <label htmlFor="timeline" className="text-sm font-medium">
                    Step {currentTimelineIndex + 1} / {timeline.length}
                </label>

                <input
                    id="timeline"
                    type="range"
                    min={0}
                    max={timeline.length - 1}
                    value={currentTimelineIndex}
                    onChange={(e) =>
                        dispatch({
                            type: 'SET_INDEX',
                            payload: parseInt(e.target.value, 10),
                        })
                    }
                    className="w-full accent-blue-500"
                />
            </div>

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

//not gonna use this method, but wanted a quick and dirty way to just see the weights without inspecting
function costToColor(cost: number): string {
    if (cost === 0) return "#334155"; // wall — dark and sturdy (unchanged)

    if (cost < 3) return "#22d3ee";   // cyan-400 — easy, chill terrain
    if (cost < 5) return "#fcd34d";   // yellow-300 — sandy, cautious zone
    if (cost < 8) return "#fb923c";   // orange-400 — rugged area
    if (cost < 15) return "#f87171";  // red-400 — painful, but passable
    return "#c084fc";                // purple-400 — extreme zone
}


type FrontierSnapshot = {
    type: "frontier"
    nodes: AStarNode[]
}
type VisitedSnapshot = {
    type: "visited"
    node: AStarNode
}
type PathSnapshot = {
    type: "path",
    node: PathData,
}
type AnimationStep = FrontierSnapshot | VisitedSnapshot | PathSnapshot

function buildTimeline(visitedOrder: AStarNode[],
                       frontierOrder: AStarNode[][],
                       pathData: PathData[]): AnimationStep[] {

    const timeline: AnimationStep [] = []
    if (visitedOrder.length !== frontierOrder.length) {
        throw new Error("both should have the same length")
    }
    for (let i = 0; i < visitedOrder.length; i++) {
        const visitedSnapshot = visitedOrder[i]
        const frontierSnapshot = frontierOrder[i]
        timeline.push({type: "frontier", nodes: frontierSnapshot})
        timeline.push({type: "visited", node: visitedSnapshot})
    }
    for (let i = 0; i < pathData.length; i++) {
        const pathNode = pathData[i]
        timeline.push({type: "path", node: pathNode})
    }
    return timeline
}

type FrontierStep = {
    type: "frontier";
    node: AStarNode;
};

type VisitedStep = {
    type: "visited";
    node: AStarNode;
};

type PathStep = {
    type: "path";
    node: PathData;
};

export type FlattenedStep = FrontierStep | VisitedStep | PathStep;


function isPathSnapshot(step: AnimationStep): step is PathSnapshot {
    return step.type === "path"
}

function isFrontierSnapshot(step: AnimationStep): step is FrontierSnapshot {
    return step.type === "frontier"
}

function isVisitedSnapshot(step: AnimationStep): step is VisitedSnapshot {
    return step.type === "visited"
}


function isPathStep(step: FlattenedStep): step is PathStep {
    return step.type === "path"
}

function isFrontierStep(step: FlattenedStep): step is FrontierStep {
    return step.type === "frontier"
}

function isVisitedStep(step: FlattenedStep): step is VisitedStep {
    return step.type === "visited"
}


function flattenedTimeline(timeline: AnimationStep[]): FlattenedStep[] {
    const flattenedSteps: FlattenedStep[] = []
    for (let i = 0; i < timeline.length; i++) {
        const node = timeline[i]
        if (isVisitedSnapshot(node)) {
            flattenedSteps.push({type: 'visited', node: node.node});
        } else if (isPathSnapshot(node)) {
            flattenedSteps.push({type: 'path', node: node.node});
        } else if (isFrontierSnapshot(node)) {
            for (const frontierNode of node.nodes) {
                flattenedSteps.push({type: 'frontier', node: frontierNode});
            }
        }

    }
    return flattenedSteps
}
