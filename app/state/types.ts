import type {FlattenedStep, SnapshotStep} from "~/utils/timeline-generation";
import type {AStarData, DiagonalConfig, PathData, Pos, Weights} from "~/types/pathfinding";
import type {HeuristicFunc, HeuristicName} from "~/utils/heuristics";
import type {CostAndWeightFunc, CostAndWeightKind} from "~/utils/grid-weights";
import type {CellData, CellToggle} from "~/cell-data/types";
import type {Nullish} from "~/types/helpers";

export type gwWeights = Omit<Weights, 'name'>
export type TimelineOptions = 'snapshot' | 'granular'

export type AppState = {
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
    configChanged: boolean,
    allReconstructedPathsCache: Nullish<Map<string, Pos[]>>
}
export type Action =
    | { type: "GENERATE_GRID", payload?: number, }
    | { type: "SET_CELL_DATA_COST_HISTORY" }
    | { type: "RUN_ASTAR", payload?: { options: { autoRun: boolean } } }
    | { type: "SET_GRID_SIZE", payload?: number }
    | { type: "INCREMENT_INDEX", payload?: number }
    | { type: "SET_INDEX", payload: number }
    | { type: "DECREMENT_INDEX", payload?: number }
    | { type: "UPDATE_CELL_DATA", }
    | { type: "SET_G_WEIGHT", payload: number }
    | { type: "SET_H_WEIGHT", payload: number }
    | { type: "SET_BOTH_WEIGHTS", payload: gwWeights }
    | { type: "TOGGLE_DIAGONAL", payload: 'none' | 'strict' | 'lax' }
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
    | { type: "SET_GOAL_GHOST_PATH", payload: Pos }
    | { type: "SET_CELL_WEIGHT", payload: { pos: Pos, newWeight: number } }
