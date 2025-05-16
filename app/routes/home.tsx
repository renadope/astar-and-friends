import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import type {AStarData, AStarNode, PathData, Pos} from "~/types/pathfinding";
import {useReducer} from "react";
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
const cellBgColor = {
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
    gridSize: number
    aStarData: AStarData | undefined
}
type Action =
    | { type: "GENERATE_GRID", payload?: number, }
    | { type: "SET_CELL_DATA_COST_HISTORY" }
    | { type: "RUN_ASTAR" }
    | { type: "SET_GRID_SIZE", payload?: number }

const initialState: AppState = {
    weightGrid: [],
    cellData: [],
    gridSize: 10,
    aStarData: undefined
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

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "GENERATE_GRID":
            const size = action.payload ?? state.gridSize ?? 5
            const weightGrid: number[][] = generateRandomCostGrid(size, predefinedWeightFuncs['random'])
            const cellData = initCellData(weightGrid)
            return {
                ...state,
                weightGrid: weightGrid,
                cellData: cellData
            }
        case "RUN_ASTAR":
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
            return {
                ...state,
                aStarData: aStarResult.value
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
        default:
            return state
    }
}

export default function Home() {
    const size = 10
    const [state, dispatch] = useReducer(reducer, initialState)
    const {cellData} = state


    return (
        <div className={'flex p-4 bg-gray-50 rounded-lg shadow-sm gap-2 '}>
            <div className="flex flex-col gap-2 transition-all ease-in-out duration-300">
                {cellData && cellData.length > 0 && cellData.map((row, r) => (
                    <div key={`col-${r}`} className="flex gap-1 ">
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
