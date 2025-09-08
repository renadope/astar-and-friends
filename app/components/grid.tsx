import { capitalize, isNullOrUndefined } from '~/utils/helpers';
import { useGridContext } from '~/state/context';
import { isSamePos, stringifyPos } from '~/utils/grid-helpers';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import type { Nullish } from '~/types/helpers';
import type { Pos } from '~/types/pathfinding';
import { Input } from './ui/input';
import { cellWeight } from '~/presets/cell-weight';
import { LockIcon, UnlockIcon } from 'lucide-react';
import { cellBgColor, textColors } from '~/cell-data/cell-data-colors';
import GridCell from '~/components/gridCell';

export default function Grid() {
  const { state, dispatch } = useGridContext();
  const {
    cellData,
    aStarData,
    cellSelectionState,
    startPos,
    goalPos,
    currentTimelineIndex,
    timeline: stateTimeline,
    snapshotTimeline,
    granularTimeline,
  } = state;
  const hasAStarData = !isNullOrUndefined(aStarData);
  const hasCellData = !isNullOrUndefined(cellData) && cellData.length > 0;
  const [clickedCell, setClickedCell] = useState<Nullish<Pos>>(undefined);
  const isValidClickedCell = !isNullOrUndefined(clickedCell);
  const cell =
    isValidClickedCell && hasCellData ? cellData[clickedCell[0]][clickedCell[1]] : undefined;
  const isClickedStartOrGoal = isSamePos(clickedCell, startPos) || isSamePos(clickedCell, goalPos);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [paintingWeight, setPaintingWeight] = useState<Nullish<number>>(undefined);

  const timeline = stateTimeline === 'snapshot' ? snapshotTimeline : granularTimeline;
  const isLastStep = timeline.length - 1 === currentTimelineIndex;

  useEffect(() => {
    if (!isPainting) {
      return;
    }

    function up() {
      setIsPainting(false);
      setPaintingWeight(undefined);
    }

    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, [isPainting]);

  return (
    <div className={'relative'}>
      <div
        className="2xs:p-2 lg:p-4 flex flex-col gap-y-1 2xs:gap-y-2 sm:gap-y-3 rounded-2xl"
        onMouseDown={() => {
          if (hasAStarData) {
            setIsPainting(false);
            return;
          }
          setIsPainting(true);
        }}
      >
        <div className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-md">
          {hasAStarData ? (
            <LockIcon className="2xs:size-3 xs:size-4 md:size-6 text-red-600 stroke-2" />
          ) : (
            <UnlockIcon className="2xs:size-3 xs:size-4 md:size-6 text-green-600 stroke-2 animate-bounce" />
          )}
        </div>
        {hasCellData && (
          <div className="flex flex-col gap-1 2xs:gap-1.5 xs:gap-2 sm:gap-3   items-center justify-center">
            {cellData.map((row, r) => (
              <div key={`col-${r}`} className="flex gap-0.5 2xs:gap-1 sm:gap-1.5">
                {row.map((_, c) => (
                  <GridCell
                    key={stringifyPos(r, c)}
                    pos={[r, c]}
                    setClickedCell={setClickedCell}
                    isPainting={isPainting}
                    setIsPainting={setIsPainting}
                    paintingWeight={paintingWeight}
                    setPaintingWeight={setPaintingWeight}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {hasCellData && <LegendComponent />}

        <Dialog
          open={isValidClickedCell && !hasAStarData && cellSelectionState === 'inactive'}
          onOpenChange={() => setClickedCell(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Edit Cell:{' '}
                {!isNullOrUndefined(clickedCell) ? `(${clickedCell[0]},${clickedCell[1]})` : ''}
              </DialogTitle>
              <DialogDescription>Configure the weight of this cell.</DialogDescription>
            </DialogHeader>
            <Input
              type="number"
              min={isClickedStartOrGoal ? 1 : 0}
              max={10000}
              value={
                !isNullOrUndefined(clickedCell)
                  ? state.cellData[clickedCell[0]][clickedCell[1]].cost
                  : 0
              }
              //hmm look into if we can add a enter press here to close it automatically
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNullOrUndefined(clickedCell)) {
                  if (isClickedStartOrGoal && num === 0) {
                    return;
                  }
                  dispatch({
                    type: 'SET_CELL_WEIGHT',
                    payload: {
                      pos: clickedCell,
                      newWeight: num >= 0 ? num : 0,
                    },
                  });
                }
              }}
            />
            <div className="mt-3 group">
              <p className="text-sm text-slate-950 mb-2 font-medium">Quick Presets</p>
              <div className="grid grid-cols-3 gap-1.5 overflow-y-auto">
                {cellWeight.map(({ name, weight }) => (
                  <button
                    key={name}
                    disabled={isClickedStartOrGoal && weight === 0}
                    onClick={() => {
                      if (!isNullOrUndefined(clickedCell)) {
                        if (isClickedStartOrGoal && weight === 0) {
                          return;
                        }
                        dispatch({
                          type: 'SET_CELL_WEIGHT',
                          payload: {
                            pos: clickedCell,
                            newWeight: weight,
                          },
                        });
                        setClickedCell(undefined);
                      }
                    }}
                    className={`px-2 py-1.5 text-sm rounded-md border-2  flex flex-col items-center gap-0.5
                               border-transparent hover:border-black hover:bg-gray-100
                               disabled:opacity-50 disabled:cursor-not-allowed 
                               disabled:hover:border-transparent disabled:hover:bg-transparent
                               transition-all duration-150
                                    `}
                  >
                    <span className="font-medium ">{name}</span>
                    <span className={`text-gray-700 group-hover:text-gray-900 text-[14px]`}>
                      {weight === 0 ? '∞' : weight}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isValidClickedCell && hasAStarData && cellSelectionState === 'inactive'}
          onOpenChange={() => setClickedCell(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cell Analysis</DialogTitle>
              <DialogDescription>
                View pathfinding costs, scores, and algorithm history for this cell
              </DialogDescription>
            </DialogHeader>

            {cell && (
              <div className="space-y-3">
                <div className="font-semibold">Cell Details</div>

                <div className="flex flex-col gap-3.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Position:</span>
                    <span>{cell.pos.join(',')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className={`${cell.cost === 0 ? 'text-lg' : 'text-sm'}`}>
                      {cell.cost === 0 ? '∞' : cell.cost}
                    </span>
                  </div>
                  {!isNullOrUndefined(cell.g) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">G-Score:</span>
                      <span>{cell.g.toFixed(2)}</span>
                    </div>
                  )}
                  {!isNullOrUndefined(cell.h) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">H-Score:</span>
                      <span>{(cell.h * state.gwWeights.hWeight).toFixed(2)}</span>
                    </div>
                  )}

                  {!isNullOrUndefined(cell.f) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">F-Score:</span>
                      <span>{cell.f.toFixed(2)}</span>
                    </div>
                  )}
                  {isSamePos(cell.pos, aStarData?.fallBack) && isLastStep && (
                    <div className="flex">
                      <span
                        className="ml-auto italic text-sm text-muted-foreground"
                        title="This node is the closest reachable point to the intended goal. The real goal was unreachable."
                      >
                        🧭 Fallback Goal
                      </span>
                    </div>
                  )}

                  <div className={'flex '}>
                    <span
                      className={`ml-auto 
                                    ${cellBgColor[cell.state]} ${textColors[cell.state]} hover:scale-105 py-1 px-2 rounded-lg`}
                    >
                      {capitalize(cell.state)}
                    </span>
                  </div>
                </div>

                {!isNullOrUndefined(cell.costUpdateHistory) &&
                  cell.costUpdateHistory.length > 0 && (
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Updates:</span>
                        <span
                          className={`bg-gradient-to-l from-orange-400  to-orange-700
                                                 text-white text-xs px-2 py-1 rounded-sm`}
                        >
                          {cell.costUpdateHistory.length}
                        </span>
                      </div>
                      {cell.costUpdateHistory.length > 1 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Delta:</span>
                          <span
                            className={`bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 
                                                    text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm`}
                          >
                            {(
                              cell.costUpdateHistory[0].gCost -
                              cell.costUpdateHistory[cell.costUpdateHistory.length - 1].gCost
                            ).toFixed(3)}
                          </span>
                        </div>
                      )}
                      {cell.costUpdateHistory.length > 2 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg:</span>
                          <span
                            className={`bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 
                                                    text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm`}
                          >
                            {avgDiff(cell.costUpdateHistory.map((foo) => foo.gCost)).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function LegendComponent() {
  return (
    <div className="mt-2 2xs:mt-3 sm:mt-4 flex flex-wrap gap-1 2xs:gap-1.5 sm:gap-2 justify-center">
      {['empty', 'wall', 'visited', 'frontier', 'path', 'start', 'goal', 'ghost'].map((state) => (
        <div
          key={state}
          className="flex items-center gap-1 px-1.5 2xs:px-2 py-0.5 2xs:py-1 bg-white rounded-full shadow-2xl"
        >
          <div
            className={`w-2.5 2xs:w-3 h-2.5 2xs:h-3 rounded-full ${cellBgColor[state as keyof typeof cellBgColor]}`}
          ></div>
          <span className="text-xs 2xs:text-xs sm:text-sm text-slate-700 capitalize">{state}</span>
        </div>
      ))}
    </div>
  );
}

//[12,8,4]
//[]
function avgDiff(nums: number[]): number {
  if (isNullOrUndefined(nums)) {
    throw new Error('lets be civilized please');
  }
  if (nums.length === 1) {
    throw new Error('need at least two numbers');
  }
  let totalDiff = 0;
  for (let i = 1; i < nums.length; i++) {
    const curr = nums[i - 1];
    const next = nums[i];
    totalDiff += next - curr;
  }
  return totalDiff / (nums.length - 1);
}
