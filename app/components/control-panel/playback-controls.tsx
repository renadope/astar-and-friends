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
        <div className={cn("w-full bg-white border-b border-gray-200 shadow-sm", className)} {...props}>
            <div className="flex items-center gap-4 px-4 py-3 h-12">
                <div className="flex-1 flex items-center gap-3 min-w-0">

                    <div className="flex-1 relative">
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
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: timeline.length > 0 && currentTimelineIndex >= 0
                                    ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentTimelineIndex + 1) / timeline.length) * 100}%, #e5e7eb ${((currentTimelineIndex + 1) / timeline.length) * 100}%, #e5e7eb 100%)`
                                    : '#e5e7eb'
                            }}
                        />
                    </div>


                    <PlaybackStatusIndicator/>

                </div>
                <div className="flex items-center bg-gray-50 rounded-full px-1 py-0.5 gap-0.5">
                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "JUMP_TO_START"})}
                        className="p-3 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Jump to Start"
                    >
                        <RewindIcon className="size-3"/>
                    </button>

                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "DECREMENT_INDEX"})}
                        className="p-3 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Previous Step"
                    >
                        <PreviousIcon className="size-3"/>
                    </button>

                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({
                            type: "SET_PLAYING_STATUS",
                            payload: !state.isPlaying
                        })}
                        className="p-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={state.isPlaying ? "Pause" : "Play"}
                    >
                        {state.isPlaying ?
                            <PauseIcon className="size-3"/> :
                            <PlayIcon className="size-3"/>
                        }
                    </button>

                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "INCREMENT_INDEX"})}
                        className="p-3 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Next Step"
                    >
                        <ForwardIcon className="size-3"/>
                    </button>

                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "JUMP_TO_END"})}
                        className="p-3 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Jump to End"
                    >
                        <FastForwardIcon className="size-3"/>
                    </button>
                </div>
                <div className="flex items-center gap-3">

                    <button
                        disabled={hasNoAStarData}
                        onClick={() => dispatch({type: "JUMP_TO_PATH_START"})}
                        className="inline-flex items-center gap-3.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded border border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Jump to Path Start"
                    >
                        <MapIcon className="size-3"/>
                        Path
                    </button>
                </div>
            </div>
            {/*<PlaybackSpeedSlider className={'ml-auto'}/>*/}
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
            className={cn(`flex items-center justify-center gap-3 pt-2`, className)}{...props}>
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
