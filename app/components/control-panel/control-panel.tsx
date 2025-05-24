import {DEFAULT_PLAYBACK_SPEED_MS} from "~/state/constants";
import {useEffect} from "react";
import {isNullOrUndefined} from "~/utils/helpers";
import {useGridContext} from "~/state/context";
import {getAlgorithmName} from "~/services/aStar";
import {CostWeightSliders} from "~/components/control-panel/cost-weight-sliders";
import {ToggleCell} from "~/components/control-panel/toggle-cell";
import {HeuristicPreset} from "~/components/control-panel/heuristic-preset";
import {WeightPreset} from "~/components/control-panel/weight-preset";
import {MultiVerse} from "~/components/control-panel/multi-verse";
import {ToggleDiagonal} from "~/components/control-panel/toggle-diagonal";
import {AlgoButtons} from "~/components/control-panel/algo-buttons";

export const gridSize = 8//really need to remove this and add a selector/option for it

export default function ControlPanel() {
    const {state, dispatch} = useGridContext()
    const {currentTimelineIndex, aStarData, playbackSpeedFactor} = state
    const algorithmName = getAlgorithmName(state.gwWeights.gWeight, state.gwWeights.hWeight)
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    useEffect(() => {
        dispatch({
            type: 'GENERATE_GRID', payload: gridSize
        })
    }, [])

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
        <div className={`flex flex-col gap-4 2xs:gap-6 p-3 2xs:p-4 sm:p-6 backdrop-blur-sm rounded-xl shadow-sm border-2`}>

            <div className={'flex flex-col gap-3'}>
                {state.configChanged && (
                    <div className="flex items-center justify-start gap-2 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-amber-700 font-medium text-xs 2xs:text-sm">
                            Configuration updated - ready to run!
                        </span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col 4xl:flex-row 4xl:justify-between 4xl:items-start gap-3 border-b border-gray-200 pb-3">
                    <div className="flex flex-col gap-1 4xl:flex-shrink-0">
                        <h3 className="text-xl 2xs:text-2xl sm:text-3xl font-bold">{algorithmName}</h3>
                        <p className="text-xs 2xs:text-sm text-gray-600">Configure and visualize pathfinding</p>
                    </div>

                    <div className="w-full 4xl:w-auto 4xl:flex-shrink-0 4xl:min-w-0">
                        <AlgoButtons/>
                    </div>
                </div>
            </div>

            <div className={'flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6'}>
                <div className="bg-blue-50 rounded-lg p-3 2xs:p-4 space-y-3 2xs:space-y-4">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2 text-sm 2xs:text-base">
                        🏗️ Grid Setup
                    </h4>
                    <ToggleCell/>
                    <CostWeightSliders/>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 2xs:p-4 space-y-3 2xs:space-y-4">
                    <h4 className="font-semibold text-purple-900 flex items-center gap-2 text-sm 2xs:text-base">
                        ⚙️ Algorithm Settings
                    </h4>
                    <ToggleDiagonal/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 2xs:gap-4">
                        <HeuristicPreset/>
                        <WeightPreset/>
                    </div>
                    <MultiVerse/>
                </div>
            </div>
        </div>
    )
}


