import {type ComponentPropsWithoutRef, useId} from "react";
import {useGridContext} from "~/state/context";
import {isNullOrUndefined} from "~/utils/helpers";
import {cn} from "~/lib/utils";
import {FastForwardIcon, Map as MapIcon, RewindIcon} from "lucide-react";
import {ForwardIcon, PauseIcon, PlayIcon, PreviousIcon} from "~/components/icons/icons";
import {PlaybackSpeedSlider} from "~/components/control-panel/playback-speed-slider";

export function PlaybackControls({className, ...props}: ComponentPropsWithoutRef<'div'>) {
    const {state, dispatch} = useGridContext()
    const {aStarData, currentTimelineIndex} = state
    const hasNoAStarData = isNullOrUndefined(aStarData)
    const id = useId()
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    return (
        <div className={cn("w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-6", className)}
             {...props}>
            <div className="space-y-4">
                <div className="relative">
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                        <div className="px-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Timeline</span>
                                <span className="text-xs text-gray-500">
                        {timeline.length > 0 ? `${timeline.length} steps` : 'No data'}
                    </span>
                            </div>


                        </div>
                    </div>
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
