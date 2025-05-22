import {FastForwardIcon, Map as MapIcon, RefreshCcw, RewindIcon} from "lucide-react";
import {DEFAULT_PLAYBACK_SPEED_MS} from "~/state/constants";
import {type ComponentPropsWithoutRef, useEffect, useId} from "react";
import {isNullOrUndefined} from "~/utils/helpers";
import {useGridContext} from "~/state/context";
import {getAlgorithmName} from "~/services/aStar";
import {CostWeightSliders} from "~/components/control-panel/cost-weight-sliders";
import {ToggleCell} from "~/components/control-panel/toggle-cell";
import {HeuristicPreset} from "~/components/control-panel/heuristic-preset";
import {WeightPreset} from "~/components/control-panel/weight-preset";
import {MultiVerse} from "~/components/control-panel/multi-verse";
import {ForwardIcon, PauseIcon, PlayIcon, PreviousIcon} from "~/components/icons/icons";
import {PlaybackSpeedSlider} from "~/components/control-panel/playback-speed-slider";
import {cn} from "~/lib/utils";
import {ToggleDiagonal} from "~/components/control-panel/toggle-diagonal";

export default function ControlPanel() {
    const gridSize = 8//really need to remove this and add a selector/option for it
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
        <div
            className=" flex flex-col gap-4 p-4  backdrop-blur-sm rounded-xl shadow-sm border-fuchsia-500 border-2">
            <div className="flex gap-4 justify-center pt-2">
                <button
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                    onClick={() => {
                        dispatch({type: "GENERATE_GRID", payload: gridSize})
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20"
                         fill="currentColor">
                        <path fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                              clipRule="evenodd"/>
                    </svg>
                    Generate Grid
                </button>

                <button
                    className={`px-4 py-2  ${state.configChanged ? 'scale-105 rotate-2 animate-bounce bg-rose-600 hover:bg-rose-700' : 'scale-100 bg-rose-500 hover:bg-rose-600'}
                          text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium`}
                    onClick={() => {
                        dispatch({type: "RUN_ASTAR"})
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20"
                         fill="currentColor">
                        <path fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"/>
                    </svg>
                    Run {algorithmName}
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
            <div className={'grid  gap-2'}>
                <CostWeightSliders/>
                <ToggleDiagonal/>
                <ToggleCell/>
                <div className={'grid grid-cols-2 gap-2'}>
                    <HeuristicPreset/>
                    <WeightPreset/>
                    <MultiVerse/>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <PlaybackControls/>
            </div>
        </div>
    )
}

export function PlaybackControls() {
    const {state, dispatch} = useGridContext()
    const {aStarData, currentTimelineIndex} = state
    const hasNoAStarData = isNullOrUndefined(aStarData)
    const id = useId()
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "JUMP_TO_START"})}
                        className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                        title="Jump to Start"
                    >
                        <RewindIcon className={"size-5 group-hover:scale-110 transition-transform"}/>
                    </button>

                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "DECREMENT_INDEX"})}
                        className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                        title="Previous Step"
                    >
                        <PreviousIcon className={"size-5 group-hover:scale-110 transition-transform"}/>

                    </button>

                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({
                            type: "SET_PLAYING_STATUS",
                            payload: !state.isPlaying
                        })}
                        className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group hover:shadow-xl transform hover:scale-105"
                        title={state.isPlaying ? "Pause" : "Play"}
                    >
                        {state.isPlaying ?
                            <PauseIcon className="h-6 w-6 group-hover:scale-110 transition-transform"/> :
                            <PlayIcon className="h-6 w-6 group-hover:scale-110 transition-transform"/>
                        }
                    </button>

                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "INCREMENT_INDEX"})}
                        className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                        title="Next Step"
                    >
                        <ForwardIcon className={"size-5 group-hover:scale-110 transition-transform"}/>
                    </button>

                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "JUMP_TO_END"})}
                        className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                        title="Jump to End"
                    >
                        <FastForwardIcon className="size-5 group-hover:scale-110 transition-transform"/>
                    </button>
                </div>

                <div className="flex justify-center">
                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "JUMP_TO_PATH_START"})}
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 rounded-lg border border-emerald-200 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group`}
                        title="Jump to Path Start"
                    >
                        <MapIcon className="size-4 group-hover:scale-110 transition-transform"/>
                        <span className="text-sm font-medium">Path Start</span>
                    </button>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="px-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Timeline</span>
                        <span className="text-xs text-gray-500">
                        {timeline.length > 0 ? `${timeline.length} steps` : 'No data'}
                    </span>
                    </div>

                    <div className="relative">
                        <input
                            id={`${id}-timeline`}
                            type="range"
                            min={-1}
                            max={timeline.length - 1}
                            disabled={timeline.length === 0}
                            value={currentTimelineIndex}
                            onChange={(e) =>
                                dispatch({
                                    type: 'SET_INDEX',
                                    payload: parseInt(e.target.value, 10),
                                })
                            }
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-40 disabled:cursor-not-allowed slider-thumb"
                            style={{
                                background: timeline.length > 0 && currentTimelineIndex >= 0
                                    ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentTimelineIndex + 1) / timeline.length) * 100}%, #e5e7eb ${((currentTimelineIndex + 1) / timeline.length) * 100}%, #e5e7eb 100%)`
                                    : '#e5e7eb'
                            }}
                        />
                    </div>

                    <div className="flex justify-between mt-2 px-1">
                        <span className="text-xs text-gray-500 font-medium">Start</span>
                        <span className="text-xs text-gray-500 font-medium">End</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
                <PlaybackSpeedSlider/>
            </div>
            <PlaybackStatusIndicator/>

        </div>
    )
}

function PlaybackStatusIndicator({className, ...props}: ComponentPropsWithoutRef<'div'>) {
    const {state} = useGridContext()
    const {aStarData, currentTimelineIndex} = state
    const hasNoAStarData = isNullOrUndefined(aStarData)
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    return (
        <div
            className={cn(`flex items-center justify-center gap-3 pt-2 border-t border-gray-300`, className)}{...props}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                !hasNoAStarData && currentTimelineIndex >= 0
                    ? 'bg-blue-50 border border-blue-200'
                    : hasNoAStarData && currentTimelineIndex < 0 ? 'bg-gray-50 border border-gray-200' : 'bg-green-100 border-gray-100'
            }`}>
                <div className={`size-2 rounded-full transition-all duration-300 ${
                    !hasNoAStarData && currentTimelineIndex >= 0
                        ? 'bg-blue-500 animate-pulse'
                        : hasNoAStarData && currentTimelineIndex < 0 ? 'bg-gray-400' : 'bg-green-400'
                }`}></div>
                <div className="text-sm font-medium">
                    {currentTimelineIndex >= 0 ? (
                        <span className="text-blue-700">
                            Step {currentTimelineIndex + 1} of {timeline.length}
                        </span>
                    ) : (
                        <span
                            className={hasNoAStarData ? 'text-gray-700' : 'text-green-700'}>{!hasNoAStarData ? 'Ready to start' : 'Waiting...'}</span>
                    )}
                </div>
            </div>
        </div>
    )

}

