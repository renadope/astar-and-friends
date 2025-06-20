import { isNullOrUndefined } from '~/utils/helpers';
import type { Pos } from '~/types/pathfinding';
import { aStar, reconstructPath } from '~/services/aStar';
import {
  buildTimeline,
  type FlattenedStep,
  flattenedTimeline,
  isPathStep,
  type SnapshotStep,
} from '~/utils/timeline-generation';
import { generateRandomCostGrid } from '~/utils/grid-generation';
import { heuristics } from '~/utils/heuristics';
import { predefinedWeightFuncs } from '~/utils/grid-weights';
import type { Action, AppState } from '~/state/types';
import {
  copyCellData,
  initCellData,
  updateCellDataFlattenedStep,
  updateCellDataSnapshotStep,
} from '~/cell-data/cell-data';
import {
  isSamePos,
  isValidGridIndex,
  isValidGridIndexUsingPos,
  isValidGridOfNumbers,
  isValidPos,
  parsePos,
  stringifyPos,
} from '~/utils/grid-helpers';
import { LARGEST_PLAYBACK_FACTOR, NO_TIMELINE, SMALLEST_PLAYBACK_FACTOR } from '~/state/constants';
import type { Nullish } from '~/types/helpers';

export const initialState: AppState = {
  weightGrid: [],
  cellData: [],
  snapshotTimeline: [],
  granularTimeline: [],
  currentTimelineIndex: 0,
  gridSize: 10,
  aStarData: undefined,
  gwWeights: { gWeight: 1, hWeight: 1 },
  diagonalSettings: { allowed: true, cornerCutting: 'lax', diagonalMultiplier: Math.SQRT2 },
  cellSelectionState: 'inactive',
  startPos: undefined,
  goalPos: undefined,
  heuristic: { name: 'manhattan', func: heuristics['manhattan'] },
  weightPreset: {
    func: predefinedWeightFuncs['uniform'],
    name: 'uniform',
  },
  timeline: 'snapshot',
  isPlaying: false,
  playbackSpeedFactor: 1,
  configChanged: false,
  allReconstructedPathsCache: undefined,
};

function addCostHistoryToCells(state: AppState) {
  if (state.cellData.length === 0 || isNullOrUndefined(state.aStarData)) {
    return state;
  }
  const cellDataGrid = copyCellData(state.cellData);
  const costUpdateHistory = state.aStarData.costUpdateHistory;
  for (const pair in costUpdateHistory) {
    const updateHistory = costUpdateHistory[pair] ?? [];
    const pos = parsePos(pair);
    cellDataGrid[pos[0]][pos[1]].costUpdateHistory = [...updateHistory];
  }
  return { ...state, cellData: cellDataGrid };
}

function updateCellDataUsingTimelineData(state: AppState) {
  if (isNullOrUndefined(state.weightGrid) || state.weightGrid.length === 0) {
    return state;
  }
  const timeline = getActiveTimeline(state);
  const idx = Math.min(timeline.length - 1, state.currentTimelineIndex);
  const adjustedTimeline = timeline.slice(0, idx + 1);
  const initCell = initCellData(
    state.weightGrid,
    handleFallbackStart(state.weightGrid, state.startPos),
    handleFallBackGoal(state.weightGrid, state.goalPos)
  );
  return {
    ...state,
    cellData:
      state.timeline === 'granular'
        ? updateCellDataFlattenedStep(adjustedTimeline as FlattenedStep[], initCell)
        : updateCellDataSnapshotStep(adjustedTimeline as SnapshotStep[], initCell),
  };
}

function getActiveTimeline(state: AppState): SnapshotStep[] | FlattenedStep[] {
  return state.timeline === 'granular' ? state.granularTimeline : state.snapshotTimeline;
}

function getActiveTimelineLength(state: AppState): number {
  if (state.timeline === 'snapshot') {
    return state.snapshotTimeline.length;
  }
  return state.granularTimeline.length;
}

function generateGrid(state: AppState, size: number): AppState {
  const startPos = state.startPos ?? [0, 0];
  const goalPos = state.goalPos ?? [size - 1, size - 1];
  const weightGrid: number[][] = generateRandomCostGrid(
    size,
    state.weightPreset.func,
    startPos,
    goalPos
  );
  const cellData = initCellData(weightGrid, startPos, goalPos);
  return {
    ...state,
    startPos: startPos,
    goalPos: goalPos,
    currentTimelineIndex: NO_TIMELINE,
    weightGrid: weightGrid,
    cellData: cellData,
    aStarData: undefined,
    snapshotTimeline: [],
    granularTimeline: [],
    isPlaying: false,
    configChanged: true,
    gridSize: size,
    allReconstructedPathsCache: undefined,
  };
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

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'GENERATE_GRID':
      const size = action.payload ?? state.gridSize ?? 5;
      return generateGrid(state, size);

    case 'RUN_ASTAR':
      const autoRun = action.payload ? action.payload.options.autoRun : false;
      if (isNullOrUndefined(state.weightGrid) || state.weightGrid.length === 0) {
        return state;
      }
      const start = handleFallbackStart(state.weightGrid, state.startPos);
      const goal = handleFallBackGoal(state.weightGrid, state.goalPos);
      if (!isValidGridIndex(state.weightGrid, start[0], start[1])) {
        throw new Error('start position is invalid');
      }
      if (!isValidGridIndex(state.weightGrid, goal[0], goal[1])) {
        throw new Error('goal position is invalid');
      }
      const aStarResult = aStar(
        state.weightGrid,
        start,
        goal,
        state.heuristic.func,
        state.diagonalSettings,
        { ...state.gwWeights, name: 'change_this_name_to_the_proper_name' }
      );

      if (!aStarResult.success) {
        // should provide a way for the ui to signal that the criterion wasn't met for Astar to be run
        return state;
      }
      const snapshotTimeline = buildTimeline(
        aStarResult.value.visitedOrder,
        aStarResult.value.frontier,
        aStarResult.value.path
      );
      const granularTimeline = flattenedTimeline(snapshotTimeline);

      const allGhostPathCache = new Map<string, Pos[]>();
      const pathAsSet = new Set<string>(aStarResult.value.path.map((p) => stringifyPos(...p.pos)));
      const visitedNotInPath = aStarResult.value.visitedOrder
        .filter((p) => !pathAsSet.has(stringifyPos(...p.pos)))
        .map((visited) => visited.pos);
      for (let i = 0; i < visitedNotInPath.length; i++) {
        const newPath = reconstructPath(
          state.weightGrid,
          aStarResult.value.costs,
          aStarResult.value.prevMap,
          (_: Pos) => 0,
          { ...state.gwWeights, name: 'fookingannnoying' },
          visitedNotInPath[i]
        );
        allGhostPathCache.set(
          stringifyPos(...visitedNotInPath[i]),
          newPath.map((data) => data.pos)
        );
      }
      return {
        ...state,
        cellData: initCellData(state.weightGrid, start, goal),
        startPos: start,
        goalPos: goal,
        currentTimelineIndex: NO_TIMELINE,
        aStarData: aStarResult.value,
        snapshotTimeline,
        granularTimeline,
        cellSelectionState: 'inactive',
        isPlaying: autoRun,
        configChanged: false,
        allReconstructedPathsCache: visitedNotInPath.length !== 0 ? allGhostPathCache : undefined,
      };
    case 'SET_CELL_DATA_COST_HISTORY':
      return addCostHistoryToCells(state);
    case 'SET_GRID_SIZE':
      //this one needs a bit more on it, like do we regen a simple-grid, do we 'trim' the simple-grid
      const givenSize = Math.abs(action.payload ?? 5);
      return {
        ...state,
        gridSize: Math.max(2, Math.min(10, givenSize)),
        configChanged: true,
      };
    case 'INCREMENT_INDEX':
      const incrStep = Math.abs(action.payload ?? 1);
      const newStep = state.currentTimelineIndex + incrStep;
      if (newStep >= getActiveTimelineLength(state) - 1) {
        return addCostHistoryToCells(
          updateCellDataUsingTimelineData({
            ...state,
            isPlaying: false,
            currentTimelineIndex: getActiveTimelineLength(state) - 1,
          })
        );
      }

      return updateCellDataUsingTimelineData({
        ...state,
        currentTimelineIndex: newStep,
      });
    case 'DECREMENT_INDEX':
      const decrStep = Math.abs(action.payload ?? 1);
      return updateCellDataUsingTimelineData({
        ...state,
        currentTimelineIndex: Math.max(-1, state.currentTimelineIndex - decrStep),
      });
    case 'UPDATE_CELL_DATA':
      return updateCellDataUsingTimelineData(state);

    case 'SET_INDEX':
      const setIndexIdx = action.payload;

      if (setIndexIdx >= getActiveTimelineLength(state) - 1) {
        return addCostHistoryToCells(
          updateCellDataUsingTimelineData({
            ...state,
            isPlaying: false,
            currentTimelineIndex: getActiveTimelineLength(state) - 1,
          })
        );
      }
      return updateCellDataUsingTimelineData({
        ...state,
        currentTimelineIndex: setIndexIdx,
      });
    case 'SET_G_WEIGHT':
      const gWeight = Math.abs(action.payload);
      return {
        ...state,
        gwWeights: { ...state.gwWeights, gWeight: gWeight },
        configChanged: true,
      };
    case 'SET_H_WEIGHT':
      const hWeight = Math.abs(action.payload);
      return {
        ...state,
        gwWeights: { ...state.gwWeights, hWeight: hWeight },
        configChanged: true,
      };
    case 'SET_BOTH_WEIGHTS':
      const ghWeights = action.payload;
      return {
        ...state,
        gwWeights: ghWeights,
        configChanged: true,
      };

    case 'TOGGLE_DIAGONAL':
      const toggleConfig = action.payload;
      if (toggleConfig === 'none' && !state.diagonalSettings.allowed) {
        return state;
      }
      if (toggleConfig === 'none') {
        return {
          ...state,
          configChanged: true,
          diagonalSettings: {
            allowed: false,
          },
        };
      }
      return {
        ...state,
        configChanged: true,
        diagonalSettings: {
          allowed: true,
          cornerCutting: toggleConfig,
          diagonalMultiplier: state.diagonalSettings.allowed
            ? state.diagonalSettings.diagonalMultiplier
            : Math.SQRT2,
        },
      };

    case 'SET_DIAGONAL_MULTIPLIER':
      if (!state.diagonalSettings.allowed) {
        return state;
      }
      const diagonalMultiplier = Math.abs(action.payload);
      return {
        ...state,
        configChanged: true,

        diagonalSettings: {
          ...state.diagonalSettings,
          diagonalMultiplier: diagonalMultiplier,
        },
      };
    case 'SET_CELL_SELECTION_STATE':
      if (!isNullOrUndefined(state.aStarData)) {
        return state;
      }
      const cellSelectionState = action.payload;
      return {
        ...state,
        cellSelectionState,
      };
    case 'UPDATE_CELL_STATUS':
      if (!isValidPos(action.payload)) {
        throw new Error('we should be receiving valid positions of [number,number]');
      }

      if (isNullOrUndefined(state.startPos) || isNullOrUndefined(state.goalPos)) {
        throw new Error('this should not happen, must have a start & goal');
      }

      if (state.cellSelectionState === 'inactive') {
        return state;
      }
      const targetPos = action.payload;

      //the TLDR of this is that if its a wall and we set that position to a start or goal,
      // we need to update the weight to a passable value a value that is positive and finite
      function updateCellWeightIfWall(
        weightGrid: number[][],
        targetPos: Pos,
        newWeight: number = 1
      ) {
        const currentWeight = weightGrid[targetPos[0]][targetPos[1]];

        if (currentWeight !== 0) {
          return weightGrid;
        }

        return weightGrid.map((row, r) =>
          row.map((weight, c) => (isSamePos([r, c], targetPos) ? newWeight : weight))
        );
      }

      if (state.cellSelectionState === 'set_goal') {
        if (isSamePos(state.startPos, targetPos)) {
          return state;
        }
        const updatedWeightGrid = updateCellWeightIfWall(state.weightGrid, targetPos);
        return {
          ...state,
          weightGrid: updatedWeightGrid,
          cellData: initCellData(updatedWeightGrid, state.startPos, targetPos),
          goalPos: targetPos,
          startPos: state.startPos,
        };
      } else if (state.cellSelectionState === 'set_start') {
        if (isSamePos(state.goalPos, targetPos)) {
          return state;
        }
        const updatedWeightGrid = updateCellWeightIfWall(state.weightGrid, targetPos);

        return {
          ...state,
          weightGrid: updatedWeightGrid,
          cellData: initCellData(updatedWeightGrid, targetPos, state.goalPos),
          startPos: targetPos,
          goalPos: state.goalPos,
        };
      }
      return state;

    case 'RESET_ASTAR_DATA':
      return {
        ...state,
        aStarData: undefined,
        currentTimelineIndex: NO_TIMELINE,
        cellData:
          state.weightGrid.length > 0
            ? initCellData(
                state.weightGrid,
                handleFallbackStart(state.weightGrid, state.startPos),
                handleFallBackGoal(state.weightGrid, state.goalPos)
              )
            : [],
        granularTimeline: [],
        snapshotTimeline: [],
        isPlaying: false,
        allReconstructedPathsCache: undefined,
      };
    case 'SET_HEURISTIC_FUNC':
      //paranoid fall back
      const newHeuristicName = action.payload;
      const newHeuristic = heuristics[newHeuristicName];
      if (isNullOrUndefined(newHeuristic)) {
        return {
          ...state,
          heuristic: { name: 'manhattan', func: heuristics['manhattan'] },
          configChanged: true,
        };
      }
      return {
        ...state,
        heuristic: { name: newHeuristicName, func: newHeuristic },
        configChanged: true,
      };
    case 'SET_WEIGHT_PRESET':
      const newWeightPresetName = action.payload;
      if (isNullOrUndefined(newWeightPresetName)) {
        return generateGrid(
          {
            ...state,
            weightPreset: { name: 'uniform', func: predefinedWeightFuncs['uniform'] },
          },
          state.gridSize
        );
      }
      return generateGrid(
        {
          ...state,
          weightPreset: {
            name: newWeightPresetName,
            func: predefinedWeightFuncs[newWeightPresetName],
          },
        },
        state.gridSize
      );
    case 'SELECT_TIMELINE':
      const newTimeline = action.payload;
      if (state.timeline === newTimeline) {
        return state;
      }
      return {
        ...state,
        //reset this badboy
        currentTimelineIndex: NO_TIMELINE,
        timeline: newTimeline,
        cellData:
          state.weightGrid.length > 0
            ? initCellData(
                state.weightGrid,
                handleFallbackStart(state.weightGrid, state.startPos),
                handleFallBackGoal(state.weightGrid, state.goalPos)
              )
            : [],
      };
    case 'JUMP_TO_END':
      if (isNullOrUndefined(state.aStarData) || isNullOrUndefined(state.weightGrid)) {
        return state;
      }
      return addCostHistoryToCells(
        updateCellDataUsingTimelineData({
          ...state,
          currentTimelineIndex: getActiveTimelineLength(state) - 1,
        })
      );
    case 'JUMP_TO_START':
      if (isNullOrUndefined(state.aStarData) || isNullOrUndefined(state.weightGrid)) {
        return state;
      }
      return {
        ...state,
        currentTimelineIndex: NO_TIMELINE,
        cellData: initCellData(
          state.weightGrid,
          handleFallbackStart(state.weightGrid, state.startPos),
          handleFallBackGoal(state.weightGrid, state.goalPos)
        ),
      };
    case 'JUMP_TO_PATH_START':
      if (isNullOrUndefined(state.aStarData) || isNullOrUndefined(state.weightGrid)) {
        return state;
      }
      const activeTimeline = getActiveTimeline(state);
      for (let i = 0; i < activeTimeline.length; i++) {
        const t = activeTimeline[i];
        if (t.type === 'path') {
          return updateCellDataUsingTimelineData({
            ...state,
            currentTimelineIndex: i,
          });
        }
      }
      return state;
    case 'SET_PLAYING_STATUS':
      if (isNullOrUndefined(state.aStarData)) {
        return state;
      }
      const status = action.payload;
      if (state.isPlaying === status) {
        return state;
      }
      const currTimeline = getActiveTimeline(state);
      if (status) {
        if (state.currentTimelineIndex >= currTimeline.length - 1) {
          return {
            ...state,
            currentTimelineIndex: NO_TIMELINE,
            isPlaying: true,
            cellData: initCellData(
              state.weightGrid,
              handleFallbackStart(state.weightGrid, state.startPos),
              handleFallBackGoal(state.weightGrid, state.goalPos)
            ),
          };
        }
        return {
          ...state,
          isPlaying: true,
        };
      }
      return {
        ...state,
        isPlaying: false,
      };

    case 'SET_PLAYBACK_SPEED_FACTOR':
      const factor = action.payload.factor;
      if (factor <= 0) {
        return {
          ...state,
          playbackSpeedFactor: SMALLEST_PLAYBACK_FACTOR,
        };
      }
      return {
        ...state,
        playbackSpeedFactor: Math.max(0.25, Math.min(factor, LARGEST_PLAYBACK_FACTOR)),
      };
    case 'SET_GOAL_GHOST_PATH':
      const canGhost =
        !isNullOrUndefined(state.aStarData) &&
        !state.isPlaying &&
        state.currentTimelineIndex >= getActiveTimelineLength(state) - 1;
      if (!canGhost) {
        return state;
      }
      if (isNullOrUndefined(state.allReconstructedPathsCache)) {
        return state;
      }
      const startPos = state.startPos;
      if (isNullOrUndefined(startPos)) {
        throw new Error('how did we end up here with no start position');
      }

      const newGoal = action.payload;
      const path = state.allReconstructedPathsCache.get(stringifyPos(...newGoal));
      if (isNullOrUndefined(path)) {
        return state;
      }

      const cellData = copyCellData(state.cellData);
      for (let i = 0; i < path.length; i++) {
        const [r, c] = path[i];
        const cell = cellData[r][c];
        cell.state = 'ghost';
      }
      return {
        ...state,
        cellData,
      };
    case 'SET_CELL_WEIGHT':
      if (!isNullOrUndefined(state.aStarData)) {
        return state;
      }
      const { pos: newCellWeightPos, newWeight: newCellWeight } = action.payload;
      const isStartOrGoal =
        isSamePos(newCellWeightPos, state.startPos) || isSamePos(newCellWeightPos, state.goalPos);
      if (isStartOrGoal && newCellWeight === 0) {
        return state;
      }
      const [rNew, cNew] = newCellWeightPos;
      if (state.cellData[rNew][cNew].cost === newCellWeight) {
        return state;
      }
      const updatedGrid = state.weightGrid.map((row, r) =>
        row.map((weight, c) => (isSamePos([r, c], newCellWeightPos) ? newCellWeight : weight))
      );
      return {
        ...state,
        weightGrid: updatedGrid,
        cellData: initCellData(updatedGrid, state.startPos, state.goalPos),
      };

    default:
      return state;
  }
}

function fallbackToPos(weightGrid: number[][], pos: Nullish<Pos>, fallback: Pos, label: string) {
  if (!isValidGridOfNumbers(weightGrid)) {
    throw new Error('invalid grid');
  }
  if (!isValidPos(fallback)) {
    throw new Error(`Invalid fallback for ${label}, fix your hardcoded value.`);
  }
  if (!isValidPos(pos) || !isValidGridIndexUsingPos(weightGrid, pos)) {
    console.warn(`Invalid ${label} position provided. Falling back to ${fallback}.`);
    if (!isValidGridIndexUsingPos(weightGrid, fallback)) {
      throw new Error('im tired boss');
    }
    return fallback;
  }
  return pos;
}

function handleFallBackGoal(weightGrid: number[][], goal?: Pos): Pos {
  return fallbackToPos(
    weightGrid,
    goal,
    [weightGrid.length - 1, weightGrid[weightGrid.length - 1].length - 1],
    'goal'
  );
}

function handleFallbackStart(weightGrid: number[][], start?: Pos): Pos {
  return fallbackToPos(weightGrid, start, [0, 0], 'start');
}
