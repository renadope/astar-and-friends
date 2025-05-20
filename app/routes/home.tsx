import type {Route} from "./+types/home";
import {aStar, getAlgorithmName} from "~/services/aStar";
import type {AStarData, DiagonalConfig, Pos, Weights} from "~/types/pathfinding";
import {type ChangeEvent, useEffect, useReducer, useState} from "react";
import {isNodePassable, parsePos, stringifyPos} from "~/utils/grid-helpers";
import {capitalize, isNullOrUndefined} from "~/utils/helpers";
import {generateRandomCostGrid, getTerrainWeight} from "~/utils/grid-generation";
import {type CostAndWeightFunc, type CostAndWeightKind, predefinedWeightFuncs} from "~/utils/grid-weights";
import {type HeuristicFunc, type HeuristicName, heuristics} from "~/utils/heuristics";
import {ToggleGroup, ToggleGroupItem} from "~/components/ui/toggle-group";
import {Check, ChevronsUpDown, FastForwardIcon, Map as MapIcon, RefreshCcw, RewindIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "~/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "~/components/ui/command";
import {Button} from "~/components/ui/button";
import {cn} from "~/lib/utils";
import {
    buildTimeline,
    type FlattenedStep,
    flattenedTimeline,
    isFlattenedStep,
    isFrontierSnapshot,
    isFrontierStep,
    isPathSnapshot,
    isPathStep,
    isSnapshotStep,
    isVisitedSnapshot,
    isVisitedStep,
    type SnapshotStep
} from "~/utils/timeline-generation";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "~/components/ui/select";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}

const NO_TIMELINE = -1 as const
const DEFAULT_PLAYBACK_SPEED_MS = 1000 as const
const SMALLEST_PLAYBACK_FACTOR = 0.25
const LARGEST_PLAYBACK_FACTOR = 10
const PLAYBACK_INCREMENT = 0.25
//rem
const gridCellSize = 6.5
type gwWeights = Omit<Weights, 'name'>
type CellToggle = 'set_goal' | 'toggle_wall' | 'set_start' | "inactive"

type CellData = {
    pos: [number, number]
    cost: number,
    state: "empty" | "start" | "goal" | "wall" | "visited" | "frontier" | "path"
    g?: number,
    h?: number,
    f?: number,
    step?: number,
    snapShotStep?: number
    costUpdateHistory?: { step: number, gCost: number }[]
}
const cellBgColor = {
    "empty": "bg-slate-50",      // slate-50 – neutral background
    "wall": "bg-slate-800",       // slate-800 – sturdy and dark
    "visited": "bg-purple-400",    // purple-400 – brighter, playful violet
    "frontier": "bg-yellow-300",   // yellow-300 – golden and cheerful
    "path": "bg-emerald-400",       // emerald-400 – balanced, modern trail
    "start": "bg-sky-500",      // sky-500 – distinct blue entry point
    "goal": "bg-pink-500"        // rose-500 – emotional, urgent destination
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
const heuristicInfo: { label: string; value: HeuristicName }[] = [
    {label: "Manhattan: (|dx| + |dy|)", value: "manhattan"},
    {label: "Euclidean: (√(dx² + dy²))", value: "euclidean"},
    {label: "Octile: D * (|dx| + |dy| + (√2 - 2 * D) × min(dx, dy))", value: "octile"},
    {label: "Chebyshev: (max(|dx|, |dy|))", value: "chebyshev"}
];
type WeightData = {
    label: string;
    value: CostAndWeightKind;
    description: string;
    emoji: string;
    tag?: "Recommended" | "Simple" | "Challenging" | "Experimental";
}
const weightPresets: WeightData[] = [
    {
        label: "Uniform",
        value: "uniform",
        description: "All cells have the same traversal cost. Ideal for basic testing.",
        emoji: "📏",
        tag: "Simple"
    },
    {
        label: "Fake Noise",
        value: "noise",
        description: "Adds pseudo-random variation in weights to simulate natural terrain.",
        emoji: "🌫️",
        tag: "Experimental"
    },
    {
        label: "Center Ridge",
        value: "centerRidge",
        description: "Creates a high-cost ridge down the center of the grid.",
        emoji: "⛰️",
        tag: "Challenging"
    },
    {
        label: "Circular Basin",
        value: "circularBasin",
        description: "Lower weights near the center and higher costs as you move outward.",
        emoji: "🌀",
        tag: "Recommended"
    },
    {
        label: "Wall Corridor Bias",
        value: "wall",
        description: "Biases cost around walls and corridors to simulate bottlenecks.",
        emoji: "🚧",
        tag: "Challenging"
    },
    {
        label: "Diagonal Gradient",
        value: "diagonal",
        description: "Increases cost gradually from top-left to bottom-right diagonally.",
        emoji: "📐",
        tag: "Simple"
    },
    {
        label: "Random Terrain",
        value: "random",
        description: "Completely randomized weights for each cell. Unpredictable paths.",
        emoji: "🎲",
        tag: "Experimental"
    },
    {
        label: "Biome Weights",
        value: "biome",
        description: "Mimics different biome zones with clustered terrain types.",
        emoji: "🌍",
        tag: "Recommended"
    }
];

type TimelineOptions = 'snapshot' | 'granular'

type AppState = {
    weightGrid: number[][]
    cellData: CellData[][]
    gridSize: number
    timeline: TimelineOptions
    snapshotTimeline: SnapshotStep[],
    granularTimeline: FlattenedStep[]
    currentTimelineIndex: number,
    aStarData: AStarData | undefined
    gwWeights: gwWeights
    diagonalSettings: DiagonalConfig
    cellSelectionState: CellToggle
    startPos: Pos | undefined
    goalPos: Pos | undefined
    heuristic: { func: HeuristicFunc, name: HeuristicName }
    weightPreset: { func: CostAndWeightFunc, name: CostAndWeightKind }
    isPlaying: boolean
    playbackSpeedFactor: number
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
    | { type: "SET_G_WEIGHT", payload: number }
    | { type: "SET_H_WEIGHT", payload: number }
    | { type: "TOGGLE_DIAGONAL", payload: boolean }
    | { type: "TOGGLE_CORNER_CUTTING", payload: 'strict' | 'lax' }
    | { type: "SET_DIAGONAL_MULTIPLIER", payload: number }
    | { type: "SET_CELL_SELECTION_STATE", payload: CellToggle }
    | { type: "UPDATE_CELL_STATUS", payload: Pos }
    | { type: "RESET_ASTAR_DATA", }
    | { type: "SET_HEURISTIC_FUNC", payload: HeuristicName }
    | { type: "SET_WEIGHT_PRESET", payload: CostAndWeightKind }
    | { type: "SELECT_TIMELINE", payload: TimelineOptions }
    | { type: "JUMP_TO_END", }
    | { type: "JUMP_TO_START", }
    | { type: "JUMP_TO_PATH_START", }
    | { type: "SET_PLAYING_STATUS", payload: boolean }
    | { type: "SET_PLAYBACK_SPEED_FACTOR", payload: { factor: number } }

const initialState: AppState = {
    weightGrid: [],
    cellData: [],
    snapshotTimeline: [],
    granularTimeline: [],
    currentTimelineIndex: 0,
    gridSize: 10,
    aStarData: undefined,
    gwWeights: {gWeight: 1, hWeight: 1},
    diagonalSettings: {allowed: true, cornerCutting: "lax", diagonalMultiplier: Math.SQRT2},
    cellSelectionState: 'inactive',
    startPos: undefined,
    goalPos: undefined,
    heuristic: {name: "manhattan", func: heuristics['manhattan']},
    weightPreset: {
        func: predefinedWeightFuncs['uniform'],
        name: 'uniform'
    },
    timeline: 'snapshot',
    isPlaying: false,
    playbackSpeedFactor: 1

    // activeTimeline: 'granular'
}

function updateCellDataUsingTimelineData(state: AppState) {
    if (isNullOrUndefined(state.weightGrid) || state.weightGrid.length === 0) {
        return state
    }
    if (state.timeline === 'granular') {
        const idx = Math.min(state.granularTimeline.length - 1, state.currentTimelineIndex)
        const adjustedTimeline = state.granularTimeline.slice(0, idx + 1)
        const initCell = initCellData(state.weightGrid,
            state.startPos ?? [0, 0], state.goalPos ?? [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1])
        return {
            ...state,
            cellData: updateCellDataFlattenedStep(adjustedTimeline, initCell)
        }
    } else if (state.timeline === "snapshot") {
        const idx = Math.min(state.snapshotTimeline.length - 1, state.currentTimelineIndex)
        const adjustedTimeline = state.snapshotTimeline.slice(0, idx + 1)
        const initCell = initCellData(state.weightGrid,
            state.startPos ?? [0, 0], state.goalPos ?? [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1])
        return {
            ...state,
            cellData: updateCellDataSnapshotStep(adjustedTimeline, initCell)
        }
    }
    return state

}

function getActiveTimelineLength(state: AppState): number {
    if (state.timeline === 'snapshot') {
        return state.snapshotTimeline.length
    }
    return state.granularTimeline.length
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


function updateCellDataSnapshotStep(timeline: SnapshotStep[], cellData: CellData[][]): CellData[][] {
    if (isNullOrUndefined(timeline) || timeline.length === 0) {
        return cellData
    }
    let snapshotStep = 0
    const newCellData = copyCellData(cellData)
    for (let i = 0; i < timeline.length; i++) {
        const node = timeline[i]
        if (isNullOrUndefined(node)) {
            continue
        }
        if (isFrontierSnapshot(node)) {
            const nodes = node.nodes
            for (let j = 0; j < nodes.length; j++) {
                const frontier = nodes[j]
                const [r, c] = frontier.pos
                const cell = newCellData[r][c]
                cell.state = "frontier"
                cell.pos = [r, c]
                cell.g = frontier.gCost
                cell.h = frontier.hCost
                cell.f = frontier.fCost
                cell.step = i
                cell.snapShotStep = snapshotStep
            }

        } else if (isVisitedSnapshot(node) || isPathSnapshot(node)) {
            const [r, c] = node.node.pos
            const cell = newCellData[r][c]
            cell.state = node.type
            cell.pos = [r, c]
            cell.g = node.node.gCost
            cell.h = node.node.hCost
            cell.f = node.node.fCost
            cell.step = i
            cell.snapShotStep = isPathSnapshot(node) ? undefined : snapshotStep
            if (isVisitedSnapshot(node)) {
                snapshotStep++
            }

        }
    }
    return newCellData

}

function updateCellDataFlattenedStep(timeline: FlattenedStep[], cellData: CellData[][]): CellData[][] {
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
        cell.snapShotStep = isFrontierStep(timeLineNode) || isVisitedStep(timeLineNode) ? timeLineNode.snapShotStep : undefined

    }
    return newCellData
}

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "GENERATE_GRID":
            const size = action.payload ?? state.gridSize ?? 5
            const weightGrid: number[][] = generateRandomCostGrid(size, state.weightPreset.func)
            const cellData = initCellData(weightGrid, state.startPos ?? [0, 0],
                state.goalPos ?? [weightGrid.length - 1, weightGrid[weightGrid.length - 1].length - 1])
            return {
                ...state,
                currentTimelineIndex: NO_TIMELINE,
                weightGrid: weightGrid,
                cellData: cellData,
                aStarData: undefined,
                snapshotTimeline: [],
                granularTimeline: [],
                isPlaying: false,
            }
        case "RUN_ASTAR":
            if (isNullOrUndefined(state.weightGrid) || state.weightGrid.length === 0) {
                return state
            }
            const start: Pos = state.startPos ?? [0, 0]
            const goal: Pos = state.goalPos ?? [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1]
            const aStarResult = aStar(state.weightGrid, start, goal, state.heuristic.func,
                state.diagonalSettings,
                {...state.gwWeights, name: "change_this_name_to_the_proper_name"})

            if (!aStarResult.success) {
                // should provide a way for the ui to signal that the criterion wasn't met for Astar to be run
                return state
            }
            const snapshotTimeline = buildTimeline(aStarResult.value.visitedOrder, aStarResult.value.frontier, aStarResult.value.path)
            const granularTimeline = flattenedTimeline(snapshotTimeline)
            return {
                ...state,
                cellData: initCellData(state.weightGrid, state.startPos ?? [0, 0],
                    state.goalPos ?? [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1]),
                currentTimelineIndex: NO_TIMELINE,
                aStarData: aStarResult.value,
                snapshotTimeline,
                granularTimeline,
                cellSelectionState: "inactive",
                isPlaying: false,
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
            const newStep = state.currentTimelineIndex + incrStep
            if (newStep >= getActiveTimelineLength(state) - 1) {
                return updateCellDataUsingTimelineData({
                    ...state,
                    isPlaying: false,
                    currentTimelineIndex: getActiveTimelineLength(state) - 1
                })
            }

            return updateCellDataUsingTimelineData({
                ...state,
                currentTimelineIndex: newStep
            })
        case "DECREMENT_INDEX":
            const decrStep = Math.abs(action.payload ?? 1)
            return updateCellDataUsingTimelineData({
                    ...state,
                    currentTimelineIndex: Math.max(0, state.currentTimelineIndex - decrStep)
                }
            )
        case "UPDATE_CELL_DATA":
            return updateCellDataUsingTimelineData(state)

        case "SET_INDEX":
            const setIndexIdx = action.payload

            if (setIndexIdx >= getActiveTimelineLength(state) - 1) {
                return updateCellDataUsingTimelineData({
                    ...state,
                    isPlaying: false,
                    currentTimelineIndex: getActiveTimelineLength(state) - 1
                })
            }
            return updateCellDataUsingTimelineData({
                ...state,
                currentTimelineIndex: setIndexIdx
            })
        case "SET_G_WEIGHT":
            const gWeight = Math.abs(action.payload)
            return {
                ...state,
                gwWeights: {...state.gwWeights, gWeight: gWeight}
            }
        case "SET_H_WEIGHT":
            const hWeight = Math.abs(action.payload)
            return {
                ...state,
                gwWeights: {...state.gwWeights, hWeight: hWeight}
            }
        case "TOGGLE_DIAGONAL":
            const toggledVal = action.payload

            if (toggledVal) {
                return {
                    ...state,
                    diagonalSettings: {
                        allowed: toggledVal,
                        cornerCutting: 'lax',
                        diagonalMultiplier: Math.SQRT2
                    }
                }
            }
            return {
                ...state,
                diagonalSettings: {
                    allowed: false
                }
            }
        case "TOGGLE_CORNER_CUTTING":
            if (!state.diagonalSettings.allowed) {
                return state
            }
            return {
                ...state,
                diagonalSettings: {
                    ...state.diagonalSettings,
                    cornerCutting: action.payload
                }
            }
        case "SET_DIAGONAL_MULTIPLIER":
            if (!state.diagonalSettings.allowed) {
                return state
            }
            const diagonalMultiplier = Math.abs(action.payload)
            return {
                ...state,
                diagonalSettings: {
                    ...state.diagonalSettings,
                    diagonalMultiplier: diagonalMultiplier
                }
            }
        case "SET_CELL_SELECTION_STATE":
            const cellSelectionState = action.payload
            return {
                ...state,
                cellSelectionState
            }
        case "UPDATE_CELL_STATUS":
            if (state.cellSelectionState === 'inactive') {
                return state
            }
            const [targetRow, targetCol] = action.payload
            const st = state.cellData.flat().find(c => c.state === 'start')
            const go = state.cellData.flat().find(c => c.state === 'goal')


            if (isNullOrUndefined(go) || isNullOrUndefined(st)) {
                throw new Error("this should not happen, must have a start &  goal")
            }
            const [startRow, startCol] = st.pos
            const [goalRow, goalCol] = go.pos
            if (state.cellSelectionState === 'set_goal') {
                if (startRow === targetRow && startCol === targetCol) {
                    return state
                }
                return {
                    ...state,
                    cellData: initCellData(state.weightGrid, [startRow, startCol], [targetRow, targetCol]),
                    goalPos: [targetRow, targetCol],
                    startPos: [startRow, startCol]
                }
            } else if (state.cellSelectionState === 'set_start') {
                if (goalRow === targetRow && goalCol === targetCol) {
                    return state
                }
                return {
                    ...state,
                    cellData: initCellData(state.weightGrid, [targetRow, targetCol], [goalRow, goalCol]),
                    startPos: [targetRow, targetCol],
                    goalPos: [goalRow, goalCol]
                }
            } else if (state.cellSelectionState === 'toggle_wall') {
                if ((targetRow === startRow && targetCol === startCol) || (targetRow === goalRow && targetCol === goalCol)) {
                    return state
                }
                const newWeightGrid = state.weightGrid.map((row, rowIndex) => {
                    return row.map((weight, colIndex) => {
                        if (rowIndex === targetRow && colIndex === targetCol && weight === 0) {
                            return getTerrainWeight(state.weightPreset.func, rowIndex, colIndex,
                                Math.min(state.weightGrid.length, state.weightGrid[state.weightGrid.length - 1].length)
                            )
                        }
                        return rowIndex === targetRow && colIndex === targetCol ? 0 : weight
                    })
                })
                return {
                    ...state,
                    weightGrid: newWeightGrid,
                    cellData: initCellData(newWeightGrid, state.startPos ?? [0, 0],
                        state.goalPos ?? [newWeightGrid.length - 1, newWeightGrid[newWeightGrid.length - 1].length - 1]),
                    startPos: [startRow, startCol],
                    goalPos: [goalRow, goalCol]
                }

            }
            return state

        case "RESET_ASTAR_DATA":
            return {
                ...state,
                aStarData: undefined,
                currentTimelineIndex: NO_TIMELINE,
                cellData: state.weightGrid.length > 0 ? initCellData(state.weightGrid,
                    state.startPos ?? [0, 0], state.goalPos ?? [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1]) : [],
                granularTimeline: [],
                snapshotTimeline: [],
                isPlaying: false,
            }
        case "SET_HEURISTIC_FUNC":
            //paranoid fall back
            const newHeuristicName = action.payload
            const newHeuristic = heuristics[newHeuristicName]
            if (isNullOrUndefined(newHeuristic)) {
                return {
                    ...state,
                    heuristic: {name: 'manhattan', func: heuristics['manhattan']}
                }
            }
            return {
                ...state,
                heuristic: {name: newHeuristicName, func: newHeuristic}
            }
        case "SET_WEIGHT_PRESET":
            const newWeightPresetName = action.payload
            if (isNullOrUndefined(newWeightPresetName)) {
                return {
                    ...state,
                    weightPreset: {name: 'uniform', func: predefinedWeightFuncs['uniform']}
                }
            }
            return {
                ...state,
                weightPreset: {
                    name: newWeightPresetName,
                    func: predefinedWeightFuncs[newWeightPresetName]
                }
            }
        case "SELECT_TIMELINE":
            const newTimeline = action.payload
            if (state.timeline === newTimeline) {
                return state
            }
            return {
                ...state,
                //reset this badboy
                currentTimelineIndex: NO_TIMELINE,
                timeline: newTimeline,
                cellData: state.weightGrid.length > 0 ? initCellData(state.weightGrid,
                    state.startPos ?? [0, 0], state.goalPos ?? [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1]) : [],

            }
        case "JUMP_TO_END":
            if (isNullOrUndefined(state.aStarData) || isNullOrUndefined(state.weightGrid)) {
                return state
            }
            if (state.timeline === 'snapshot') {
                return {
                    ...state,
                    currentTimelineIndex: state.snapshotTimeline.length - 1
                }
            }
            return {
                ...state,
                currentTimelineIndex: state.granularTimeline.length - 1
            }
        case "JUMP_TO_START":
            if (isNullOrUndefined(state.aStarData) || isNullOrUndefined(state.weightGrid)) {
                return state
            }
            return {
                ...state,
                currentTimelineIndex: NO_TIMELINE,
                cellData: initCellData(state.weightGrid,
                    state.startPos ?? [0, 0], state.goalPos ?? [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1])
            }
        case "JUMP_TO_PATH_START":
            if (isNullOrUndefined(state.aStarData) || isNullOrUndefined(state.weightGrid)) {
                return state
            }
            const activeTimeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
            for (let i = 0; i < activeTimeline.length; i++) {
                const t = activeTimeline[i]
                if (t.type === 'path') {
                    return {
                        ...state,
                        currentTimelineIndex: i
                    }
                }
            }
            return state
        case "SET_PLAYING_STATUS":
            const status = action.payload
            if (state.isPlaying === status) {
                return state
            }
            const currTimeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
            if (status) {
                if (state.currentTimelineIndex >= currTimeline.length - 1) {
                    console.log("DOES THIS FIRE")
                    return {
                        ...state,
                        currentTimelineIndex: NO_TIMELINE,
                        isPlaying: true,
                        cellData: initCellData(state.weightGrid,
                            state.startPos ?? [0, 0], state.goalPos ?? [state.weightGrid.length - 1, state.weightGrid[state.weightGrid.length - 1].length - 1])
                    }
                }
                return {
                    ...state,
                    isPlaying: true
                }

            }
            return {
                ...state,
                isPlaying: false
            }

        case "SET_PLAYBACK_SPEED_FACTOR":
            const factor = action.payload.factor
            if (factor <= 0) {
                return {
                    ...state,
                    playbackSpeedFactor: SMALLEST_PLAYBACK_FACTOR
                }
            }
            return {
                ...state,
                playbackSpeedFactor: Math.max(0.25, Math.min(factor, LARGEST_PLAYBACK_FACTOR))
            }


        default:
            return state
    }
}

export default function Home() {
    const size = 10
    const [state, dispatch] = useReducer(reducer, initialState)
    const {cellData, currentTimelineIndex, aStarData, diagonalSettings, playbackSpeedFactor} = state
    const [heuristicPopoverOpen, setHeuristicPopoverOpen] = useState(false)
    const [weightPresetOpen, setWeightPresetOpen] = useState(false)
    const algorithmName = getAlgorithmName(state.gwWeights.gWeight, state.gwWeights.hWeight)
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    const hasNoAStarData = isNullOrUndefined(aStarData)


    useEffect(() => {
        if (isNullOrUndefined(aStarData) || state.weightGrid.length === 0 || state.cellSelectionState !== 'inactive') {
            return
        }
        if (!state.isPlaying) {
            return
        }
        const delay = Math.max(DEFAULT_PLAYBACK_SPEED_MS / playbackSpeedFactor, 50);
        const interval = setTimeout(() => {
            dispatch({
                type: 'INCREMENT_INDEX'
            })
        }, delay)
        return () => clearTimeout(interval)

    }, [aStarData, currentTimelineIndex, timeline.length, state.cellSelectionState, state.isPlaying, playbackSpeedFactor])

    return (
        <div className={'grid grid-cols-2 p-4 rounded-lg shadow-sm gap-2 '}>
            <div
                className="border-8 border-black flex-col gap-2 transition-all ease-in-out duration-300 p-4 bg-gradient-to-br from-slate-100 to-sky-50 rounded-xl shadow-lg">
                {!(isNullOrUndefined(cellData)) && cellData.length > 0 && cellData.map((row, r) => (
                    <div key={`col-${r}`} className="flex gap-0.5 hover:gap-1 transition-all duration-300">
                        {row.map((cell, c) => {

                            const snapShotStep = cell.snapShotStep ?? Number.MAX_SAFE_INTEGER
                            const key = stringifyPos(...cell.pos)
                            const history = aStarData ? aStarData.costUpdateHistory[key] ?? [] : []
                            const updatedOnThisStep = history.some((h) => h.step - 1 === snapShotStep)
                            // const updatedOnThisStep = history.some((h) => h.step === snapShotStep + 1)
                            // const costUpdateOnThisStep = history.find((h) => h.step === snapShotStep + 1)
                            // ${isCurrentStep && !isLastStep && cell.state === 'frontier' && nodesUpNext(cell, minFCost)
                            //     ? 'scale-200 ring-2 ring-amber-400 shadow-md z-10 '
                            //     : 'scale-100'}
                            const isLastStep = timeline.length - 1 === currentTimelineIndex
                            const isCurrentStep = cell.step === currentTimelineIndex;

                            const next = timeline[currentTimelineIndex + 1]
                            const isVisitedNext = !isNullOrUndefined(next) && next.type === 'visited'
                            const posUpNext = isVisitedNext && next.type === 'visited' ? next.node.pos : undefined

                            const bestFrontier = cell.state === 'frontier' && isVisitedNext && !isNullOrUndefined(posUpNext) && r === posUpNext[0] && c === posUpNext[1]
                            return (
                                <div
                                    key={key}
                                    style={{
                                        height: `${gridCellSize}rem`,
                                        width: `${gridCellSize}rem`,
                                        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                        border: `${1 + Math.min(4, Math.sqrt(cell.cost) * .7)}px solid ${costToColor(cell.cost)}`,
                                        boxShadow: isCurrentStep ? "0 0 15px 5px rgba(59, 130, 246, 0.6)" :
                                            cell.state === "path" ? "0 0 8px rgba(16, 185, 129, 0.7)" :
                                                "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                    className={`rounded-md flex flex-col items-center justify-center relative backdrop-blur-sm
                        ${cellBgColor[cell.state] ?? 'bg-sky-500'}
                        ${bestFrontier ? 'z-10 translate-x-12 translate-y-6 scale-160' : ''}
                        ${updatedOnThisStep ? 'relative after:absolute after:inset-0 after:rounded-full after:animate-ping after:bg-sky-400/50' : ''}
                        ${isCurrentStep && !isLastStep && cell.state !== 'path' ? 'scale-110' : 'scale-100'} 
                        ${cell.state === "path" && isCurrentStep && !isLastStep ? "z-10 scale-110 animate-bounce" : ""}
                        ${cell.state === 'path' && isCurrentStep && isLastStep ? "scale-110 z-10" : ""}
                        `}
                                    onClick={() => {
                                        dispatch({
                                            type: "UPDATE_CELL_STATUS",
                                            payload: [r, c]
                                        })
                                    }}
                                    onMouseEnter={(e) => {
                                        if (cell.costUpdateHistory && cell.costUpdateHistory.length > 0) {
                                            e.currentTarget.setAttribute('title', `Cost updates: ${cell.costUpdateHistory.join(' → ')}`);
                                        }
                                    }}
                                >
                                    {isCurrentStep && isLastStep && (
                                        <div className="absolute top-0 left-0 text-lg">🏁</div>
                                    )}

                                    <div className="flex flex-col items-center w-full h-full justify-center group">
                                        <p className={`text-xs font-bold ${textColors[cell.state] || "text-slate-700"} transition-all duration-200 group-hover:text-lg`}>
                                            {cell.state}
                                        </p>

                                        <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                            {cell.pos.join(',')}
                                        </p>

                                        <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                            {cell.cost}
                                        </p>

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
                    {["empty", "wall", "visited", "frontier", "path", "start", "goal"].map(state => (
                        <div key={state}
                             className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded-full shadow-sm">
                            <div className={`w-3 h-3 rounded-full ${
                                state === "wall" ? "bg-slate-800" :
                                    state === "path" ? "bg-emerald-500" :
                                        state === "visited" ? "bg-violet-600" :
                                            state === "frontier" ? "bg-amber-400" :
                                                state === "start" ? "bg-blue-500" :
                                                    state === "goal" ? "bg-red-500" :
                                                        "bg-sky-100"
                            }`}></div>
                            <span className="text-xs text-slate-700 capitalize">{state}</span>
                        </div>
                    ))}
                </div>
            </div>


            <div className="flex flex-col gap-4 p-4  backdrop-blur-sm rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            disabled={hasNoAStarData}
                            onClick={() => dispatch({type: "DECREMENT_INDEX"})}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                            </svg>
                            Back
                        </button>

                        <button
                            disabled={hasNoAStarData}
                            onClick={() => dispatch({type: "INCREMENT_INDEX"})}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                        >
                            Next:{timeline.length}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                        <button
                            disabled={hasNoAStarData}
                            onClick={() => dispatch({type: "JUMP_TO_START"})}
                            className="px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 flex disabled:cursor-not-allowed items-center gap-1"
                        >
                            <RewindIcon/>
                            Jump to Start

                        </button>
                        <button
                            disabled={hasNoAStarData}
                            onClick={() => dispatch({type: "JUMP_TO_PATH_START"})}
                            className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 flex disabled:cursor-not-allowed items-center gap-1"
                        >

                            Jump to Path Start
                            <MapIcon/>

                        </button>
                        <button
                            disabled={hasNoAStarData}
                            onClick={() => dispatch({type: "JUMP_TO_END"})}
                            className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 flex disabled:cursor-not-allowed items-center gap-1"
                        >

                            Jump to End
                            <FastForwardIcon/>

                        </button>
                        <button
                            disabled={hasNoAStarData}
                            onClick={() => dispatch({type: "SET_PLAYING_STATUS", payload: !state.isPlaying})}
                            className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 flex disabled:cursor-not-allowed items-center gap-1"
                        >

                            {state.isPlaying ? <><span>Pause</span> <PauseIcon/></> : <><span>Play</span>
                                <PlayIcon/></>}

                        </button>
                        <div className="space-y-1">
                            <label htmlFor="playbackSpeed" className="text-sm font-medium text-muted-foreground">
                                Playback Speed: {Math.floor(DEFAULT_PLAYBACK_SPEED_MS / playbackSpeedFactor)}ms
                            </label>
                            <input
                                type="range"
                                min={SMALLEST_PLAYBACK_FACTOR}
                                max={LARGEST_PLAYBACK_FACTOR}
                                step={PLAYBACK_INCREMENT}
                                value={playbackSpeedFactor}
                                onChange={(e) => {
                                    dispatch({
                                        type: 'SET_PLAYBACK_SPEED_FACTOR',
                                        payload: {factor: Number(e.target.value)}
                                    })
                                }}
                            />
                        </div>
                        <p>{playbackSpeedFactor}x</p>
                    </div>

                    <div className="text-sm font mono font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {currentTimelineIndex >= 0 ? (
                            <span>Step {currentTimelineIndex+1}</span>
                        ) : (
                            <span className="italic text-gray-400">Waiting to start...</span>
                        )}                    </div>
                </div>

                <div className="w-full">
                    <input
                        id="timeline"
                        type="range"
                        min={0}
                        max={timeline.length - 1}
                        disabled={timeline.length === 0}
                        value={currentTimelineIndex}
                        onChange={(e) =>
                            dispatch({
                                type: 'SET_INDEX',
                                payload: parseInt(e.target.value, 10),
                            })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg   cursor-pointer accent-blue-500 "
                    />

                    <div className="w-full flex justify-between mt-1 px-1">
                        <span className="text-xs text-gray-500">Start</span>
                        <span className="text-xs text-gray-500">End</span>
                    </div>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                    <button
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                        onClick={() => {
                            dispatch({type: "GENERATE_GRID", payload: size})
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                             fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                                  clipRule="evenodd"/>
                        </svg>
                        Generate Grid
                    </button>

                    <button
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                        onClick={() => {
                            dispatch({type: "RUN_ASTAR"})
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                             fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"/>
                        </svg>
                        Run {algorithmName}// debug:{state.timeline}
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                        onClick={() => {
                            dispatch({type: "RESET_ASTAR_DATA"})
                        }}
                    >
                        <RefreshCcw/>
                        Reset
                    </button>
                </div>
                <div className={'grid grid-cols-2 gap-2'}>
                    <div
                        className="flex flex-col gap-4 max-w-md  mt-4 p-4 bg-white hover:bg-slate-50 rounded-lg shadow-md">
                        <h3 className={'text-sm font-mono'}>Control A* Behavior with Weights</h3>
                        <div className="w-full ">
                            <label htmlFor="gWeight" className="block text-sm font-semibold text-blue-600 mb-1">
                                G-Weight (Cost So Far): <span
                                className="font-mono text-black">{state.gwWeights.gWeight}</span>
                            </label>
                            <input
                                id={`gWeight`}
                                type="range"
                                min={0}
                                max={10}
                                step={0.5}
                                value={state.gwWeights.gWeight}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    dispatch({
                                        type: 'SET_G_WEIGHT',
                                        payload: Number(e.target.value),
                                    })
                                }
                                }
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div className="w-full pt-2">
                            <label htmlFor="hWeight" className="block text-sm font-semibold text-pink-600 mb-1">
                                H-Weight (Heuristic): <span
                                className="font-mono text-black">{state.gwWeights.hWeight}</span>
                            </label>
                            <input
                                id={`hWeight`}
                                type="range"
                                min={0}
                                max={10}
                                step={0.5}
                                value={state.gwWeights.hWeight}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    dispatch({
                                        type: 'SET_H_WEIGHT',
                                        payload: Number(e.target.value),
                                    })
                                }

                                }
                                className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                            />
                        </div>
                    </div>
                    <div
                        className="flex flex-col gap-4 max-w-md  mt-4 p-4 bg-white hover:bg-slate-50 rounded-lg shadow-md">
                        <h3 className={'text-sm font-mono'}>Diagonal Contorls</h3>
                        <fieldset className="border p-3 rounded-md">
                            <legend className="text-sm font-semibold text-gray-700">Diagonal Movement</legend>

                            <label className="flex items-center gap-2 mt-2">
                                <input type="checkbox" checked={diagonalSettings.allowed} onChange={() => {
                                    dispatch({
                                        type: 'TOGGLE_DIAGONAL',
                                        payload: !diagonalSettings.allowed
                                    })

                                }}/>
                                Allow Diagonal
                            </label>

                            {diagonalSettings.allowed && (
                                <div className="ml-4 mt-2 space-y-2">
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="diagonalMode"
                                                value="strict"
                                                checked={diagonalSettings.cornerCutting === 'strict'}
                                                onChange={() => {
                                                    dispatch({
                                                        type: "TOGGLE_CORNER_CUTTING",
                                                        payload: "strict"
                                                    })

                                                }}
                                            />
                                            Strict
                                        </label>

                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="diagonalMode"
                                                value="lax"
                                                checked={diagonalSettings.cornerCutting === 'lax'}
                                                onChange={() => {
                                                    dispatch({
                                                        type: "TOGGLE_CORNER_CUTTING",
                                                        payload: "lax"
                                                    })

                                                }}
                                            />
                                            Lax
                                        </label>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600 font-medium">
                                            Diagonal Cost Multiplier: {diagonalSettings.diagonalMultiplier.toFixed(4)}
                                        </label>
                                        <input
                                            type="range"
                                            min={0.1}
                                            max={10}
                                            step={.1}
                                            value={diagonalSettings.diagonalMultiplier}
                                            onChange={(e) => {
                                                dispatch({
                                                    type: "SET_DIAGONAL_MULTIPLIER",
                                                    payload: Number(e.target.value)
                                                })
                                            }}
                                            className="w-full accent-purple-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </fieldset>

                    </div>
                    <div className="space-y-2 col-span-full">
                        <label className="text-sm font-medium text-muted-foreground">Cell
                            Mode:{state.cellSelectionState ? state.cellSelectionState : `ghhgfhfh`}</label>
                        <ToggleGroup
                            type="single"
                            value={state.cellSelectionState}
                            onValueChange={(val: string) => {
                                const st = val.trim()
                                dispatch({
                                    type: "SET_CELL_SELECTION_STATE",
                                    payload: st.length === 0 ? 'inactive' : st as CellToggle
                                })
                            }}
                            variant="outline"
                            size="default"
                            className="w-full"
                            disabled={!hasNoAStarData}
                        >
                            <ToggleGroupItem value="set_goal" aria-label="Set Goal">
                                Set Goal 🎯
                            </ToggleGroupItem>
                            <ToggleGroupItem value="set_start" aria-label="Set Start">
                                Set Start 🏁
                            </ToggleGroupItem>
                            <ToggleGroupItem value="toggle_wall" aria-label="Toggle Wall">
                                Toggle Wall 🚧
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className={'space-y-2 flex flex-col'}>
                        <label className="text-sm font-medium text-muted-foreground">Select Heuristic Function</label>
                        <Popover open={heuristicPopoverOpen} onOpenChange={setHeuristicPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={heuristicPopoverOpen}
                                    className="w-2/3 justify-between"
                                >
                                    {capitalize(heuristicInfo.find(
                                        (heuristic) => heuristic.value === state.heuristic.name)?.value ?? "no selection")}
                                    <ChevronsUpDown className="opacity-50"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-2/3">
                                <Command>
                                    <CommandInput placeholder="Search heuristic..."/>
                                    <CommandList>
                                        <CommandEmpty>No heuristic found.</CommandEmpty>
                                        <CommandGroup>
                                            {heuristicInfo.map((heuristicInfo) => (
                                                <CommandItem
                                                    key={heuristicInfo.value}
                                                    value={heuristicInfo.value}
                                                    onSelect={(currentValue: string) => {
                                                        dispatch({
                                                            type: "SET_HEURISTIC_FUNC",
                                                            payload: currentValue as HeuristicName
                                                        })
                                                        setHeuristicPopoverOpen(false)
                                                    }}
                                                >
                                                    {heuristicInfo.label}
                                                    <Check
                                                        className={cn(
                                                            "ml-auto",
                                                            state.heuristic.name === heuristicInfo.value ? " opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className={'space-y-2 flex flex-col'}>
                        <label className="text-sm font-medium text-muted-foreground">Select Weight Preset</label>
                        <Popover open={weightPresetOpen} onOpenChange={setWeightPresetOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={weightPresetOpen}
                                    className="w-2/3 justify-between"
                                >
                                    {capitalize(weightPresets.find(
                                        (weightPreset) => weightPreset.value === state.weightPreset.name)?.label ?? "no selection")}
                                    <ChevronsUpDown className="opacity-50"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-f">
                                <Command>
                                    <CommandInput placeholder="Search Preset..."/>
                                    <CommandList>
                                        <CommandEmpty>No Preset found.</CommandEmpty>
                                        <CommandGroup>
                                            {weightPresets.map((weightPresetInfo) => (
                                                <CommandItem
                                                    key={weightPresetInfo.value}
                                                    value={weightPresetInfo.value}
                                                    onSelect={(currentValue: string) => {
                                                        dispatch({
                                                            type: "SET_WEIGHT_PRESET",
                                                            payload: currentValue as CostAndWeightKind
                                                        })
                                                        setWeightPresetOpen(false)
                                                    }}
                                                >

                                                    {weightPresetInfo.emoji} {weightPresetInfo.label}
                                                    <Check
                                                        className={cn(
                                                            "ml-auto",
                                                            state.weightPreset.name === weightPresetInfo.value ? " opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className={'mt-2'}>
                        <label className="text-sm font-medium text-muted-foreground">Enter the multiverse</label>
                        <Select
                            value={state.timeline}
                            onValueChange={(value) => {
                                dispatch({
                                    type: "SELECT_TIMELINE",
                                    payload: value as TimelineOptions
                                })

                            }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a timeline"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Multiverse</SelectLabel>
                                    <SelectItem value="granular">Granular</SelectItem>
                                    <SelectItem value="snapshot">Snapshot</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>


                </div>

            </div>
            <div className="text-sm font-mono whitespace-pre">
                {timeline &&
                    timeline.map((step, index) => {

                        if (isSnapshotStep(step)) {
                            if (isFrontierSnapshot(step)) {

                                return (
                                    <div key={index}>
                                        <strong>Step {index} [frontier snapshot]</strong>
                                        {step.nodes.map((node, i) => {
                                            const [r, c] = node.pos;
                                            return (
                                                <div key={i}>
                                                    &nbsp;&nbsp;→ pos=({r},{c}), g={node.gCost}, h={node.hCost},
                                                    f={node.fCost}
                                                </div>
                                            );
                                        })}
                                        {/*{step.snapShotStep !== undefined && (*/}
                                        {/*    <div><strong>Snapshot Step: {step.snapShotStep}</strong></div>*/}
                                        {/*)}*/}
                                    </div>
                                );
                            } else if (isVisitedSnapshot(step) && !isVisitedStep(step)) {
                                const {node} = step;
                                const [r, c] = node.pos;
                                return (
                                    <div key={index}>
                                        <strong>Step {index} [visited]</strong> → pos=({r},{c}), g={node.gCost},
                                        h={node.hCost}, f={node.fCost}
                                    </div>
                                );

                            }


                        } else if (isFlattenedStep(step)) {

                        }

                    })}
            </div>
        </div>
    );
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


function groupBySnapshotStep(timeline: FlattenedStep[]): Map<number, FlattenedStep[]> {
    const res = new Map<number, FlattenedStep[]>();
    for (const node of timeline) {
        if (!isPathStep(node) && node.snapShotStep !== undefined) {
            const group = res.get(node.snapShotStep) ?? [];
            group.push(node);
            res.set(node.snapShotStep, group);
        }
    }
    return res;
}


const PlayIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        width="24"
        height="24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v18l15-9L5 3z"/>
    </svg>
);

const PauseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        width="24"
        height="24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h2v16h-2zM16 4h2v16h-2z"/>
    </svg>
);
