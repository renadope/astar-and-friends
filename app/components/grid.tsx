import {isNullOrUndefined} from "~/utils/helpers";
import {useGridContext} from "~/state/context";
import GridCell, {cellBgColor} from "~/components/gridCell";
import {isSamePos, stringifyPos} from "~/utils/grid-helpers";
import {useEffect, useState} from "react";
import type {Nullish} from "~/types/helpers";
import type {Pos} from "~/types/pathfinding";
import {useDebounce} from "~/hooks/useDebounce";


export default function Grid() {
    const {state, dispatch} = useGridContext()
    const {cellData, currentTimelineIndex, currentGhostGoalTarget, isPlaying} = state
    const hasCellData = !isNullOrUndefined(cellData) && cellData.length > 0
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    const canGhost = !isPlaying && currentTimelineIndex >= timeline.length - 1

    const [hoveredCell, setHoveredCell] = useState<Nullish<Pos>>(null)
    // const deferredHoverCell = useDeferredValue(hoveredCell)
    const deferredHoverCell = useDebounce(hoveredCell, 120)
    useEffect(() => {
        if (!canGhost) return;


        const validHoverCell = !isNullOrUndefined(deferredHoverCell)
        const noHoverCell = !validHoverCell

        const hasGhostTarget = !isNullOrUndefined(currentGhostGoalTarget)
        const noGhostTarget = !hasGhostTarget

        if (noHoverCell && noGhostTarget) {
            return
        }
        if (validHoverCell && cellData[deferredHoverCell[0]][deferredHoverCell[1]].state !== 'visited') {
            return
        }

        const hoveringNewCell = validHoverCell &&
            !isSamePos(deferredHoverCell, currentGhostGoalTarget);


        if (hoveringNewCell) {
            dispatch({
                type: "SET_GOAL_GHOST_PATH",
                payload: deferredHoverCell,
            });
        } else if (noHoverCell) {
            dispatch({type: "JUMP_TO_END"});
        }
    }, [deferredHoverCell, canGhost, currentGhostGoalTarget]);

    return (
        <div className="p-2 2xs:p-1 sm:p-2 lg:p-4 flex flex-col gap-y-1 2xs:gap-y-2 sm:gap-y-3 rounded-2xl">
            {hasCellData && (
                <div
                    className="flex flex-col gap-1 2xs:gap-1.5 xs:gap-2 sm:gap-3   items-center justify-center">
                    {cellData.map((row, r) => (
                        <div key={`col-${r}`} className="flex gap-0.5 2xs:gap-1 sm:gap-1.5">
                            {row.map((_, c) => (
                                <GridCell key={stringifyPos(r, c)} pos={[r, c]} hoveredCell={hoveredCell}
                                          setHoveredCell={setHoveredCell}/>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {hasCellData && (
                <div className="mt-2 2xs:mt-3 sm:mt-4 flex flex-wrap gap-1 2xs:gap-1.5 sm:gap-2 justify-center">
                    {["empty", "wall", "visited", "frontier", "path", "start", "goal", "ghost"].map(state => (
                        <div key={state}
                             className="flex items-center gap-1 px-1.5 2xs:px-2 py-0.5 2xs:py-1 bg-white rounded-full shadow-2xl">
                            <div
                                className={`w-2.5 2xs:w-3 h-2.5 2xs:h-3 rounded-full ${cellBgColor[state as keyof typeof cellBgColor]}`}>
                            </div>
                            <span className="text-xs 2xs:text-xs sm:text-sm text-slate-700 capitalize">{state}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

    )
}


