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
        <div className={`${state.configChanged ? 'border-fuchsia-500' : 'border-violet-500'} 
    flex flex-col gap-6 p-6 backdrop-blur-sm rounded-xl shadow-sm border-2`}>


            <div className={'flex justify-between flex-wrap '}>
                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-3xl font-bold">{algorithmName}</h3>
                    <p className="text-sm text-gray-600 mt-1">Configure and visualize pathfinding</p>
                </div>
                <AlgoButtons/>
            </div>

            <div className={'grid grid-cols-2'}>
                <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                        🏗️ Grid Setup
                    </h4>
                    <ToggleCell/>
                    <CostWeightSliders/>

                </div>

                <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                        ⚙️ Algorithm Settings
                    </h4>
                    <ToggleDiagonal/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <HeuristicPreset/>
                        <WeightPreset/>
                    </div>
                    <MultiVerse/>
                </div>
            </div>
        </div>
    )
}


