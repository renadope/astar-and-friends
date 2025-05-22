import {PauseIcon, PlayIcon} from "~/components/icons/icons";
import {FastForwardIcon, Map as MapIcon, RefreshCcw, RewindIcon} from "lucide-react";
import {
    DEFAULT_PLAYBACK_SPEED_MS,
    LARGEST_PLAYBACK_FACTOR,
    PLAYBACK_INCREMENT,
    SMALLEST_PLAYBACK_FACTOR
} from "~/state/constants";
import {useId} from "react";
import {isNullOrUndefined} from "~/utils/helpers";
import {useGridContext} from "~/state/context";
import {getAlgorithmName} from "~/services/aStar";
import {CostWeightSliders} from "~/components/control-panel/cost-weight-sliders";
import {DiagonalControls} from "~/components/control-panel/diagonal-controls";
import {ToggleCell} from "~/components/control-panel/toggle-cell";
import {HeuristicPreset} from "~/components/control-panel/heuristic-preset";
import {WeightPreset} from "~/components/control-panel/weight-preset";
import {MultiVerse} from "~/components/control-panel/multi-verse";

export default function ControlPanel() {
    const gridSize = 8//really need to remove this and add a selector/option for it
    const id = useId()
    const {state, dispatch} = useGridContext()
    const {currentTimelineIndex, aStarData, diagonalSettings, playbackSpeedFactor} = state
    const algorithmName = getAlgorithmName(state.gwWeights.gWeight, state.gwWeights.hWeight)
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    const hasNoAStarData = isNullOrUndefined(aStarData)

    return (
        <div
            className=" flex flex-col gap-4 p-4  backdrop-blur-sm rounded-xl shadow-sm border-fuchsia-500 border-2">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        <div className="flex gap-1.5">
                            <button
                                disabled={hasNoAStarData}
                                onClick={() => dispatch({
                                    type: "SET_PLAYING_STATUS",
                                    payload: !state.isPlaying
                                })}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
                            >
                                {state.isPlaying ?
                                    <><PauseIcon/> <span>Pause</span></> :
                                    <><PlayIcon/> <span>Play</span></>
                                }
                            </button>

                            <button
                                disabled={hasNoAStarData}
                                onClick={() => dispatch({type: "DECREMENT_INDEX"})}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M15 19l-7-7 7-7"/>
                                </svg>
                                <span>Back</span>
                            </button>

                            <button
                                disabled={hasNoAStarData}
                                onClick={() => dispatch({type: "INCREMENT_INDEX"})}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <span>Next</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </div>

                        <div className="flex gap-1.5">
                            <button
                                disabled={hasNoAStarData}
                                onClick={() => dispatch({type: "JUMP_TO_START"})}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <RewindIcon className="h-4 w-4"/>
                                <span>Start</span>
                            </button>

                            <button
                                disabled={hasNoAStarData}
                                onClick={() => dispatch({type: "JUMP_TO_PATH_START"})}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <MapIcon className="h-4 w-4"/>
                                <span>Path Start</span>
                            </button>

                            <button
                                disabled={hasNoAStarData}
                                onClick={() => dispatch({type: "JUMP_TO_END"})}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <FastForwardIcon className="h-4 w-4"/>
                                <span>End</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 items-center w-1/2">
                        <div className="grow">
                            <div className="flex justify-between mb-1">
                                <label htmlFor={`${id}-playbackSpeed`}
                                       className="text-xs font-medium text-gray-500">
                                    Playback
                                    Speed: {Math.floor(DEFAULT_PLAYBACK_SPEED_MS / playbackSpeedFactor)}ms
                                </label>
                                <span
                                    className="text-xs font-medium text-blue-600">{playbackSpeedFactor}x</span>
                            </div>
                            <input
                                type="range"
                                id={`${id}-playbackSpeed`}
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
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-sky-500"></div>
                        <div className="text-sm font-medium text-gray-700">
                            {currentTimelineIndex >= 0 ? (
                                <>
                                    <span>Step {currentTimelineIndex + 1} of {timeline.length}</span>
                                </>
                            ) : (
                                <span className="text-gray-400">Waiting to start...</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
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
                    className="w-full h-2 bg-gray-200 rounded-lg   cursor-pointer accent-blue-500 "
                />

                <div className="w-full flex justify-between mt-1 px-1">
                    <span className="text-xs text-gray-500">Start</span>
                    <span className="text-xs text-gray-500">End</span>
                </div>
            </div>

            <div className="flex gap-4 justify-center pt-2">
                <button
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                    onClick={() => {
                        dispatch({type: "GENERATE_GRID", payload: gridSize})
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
                    className={`px-4 py-2  ${state.configChanged ? 'scale-105 rotate-2 animate-bounce bg-rose-600 hover:bg-rose-700' : 'scale-100 bg-rose-500 hover:bg-rose-600'}
                          text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium`}
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
                <DiagonalControls/>
                <ToggleCell/>
                <HeuristicPreset/>
                <WeightPreset/>
                <MultiVerse/>


            </div>

        </div>
    )
}

