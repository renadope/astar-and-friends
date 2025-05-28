import {type ChangeEvent, type ComponentPropsWithoutRef, useCallback, useEffect, useId, useRef} from "react";
import {useGridContext} from "~/state/context";
import {isNullOrUndefined} from "~/utils/helpers";
import {cn} from "~/lib/utils";
import {FastForwardIcon, Map as MapIcon, RefreshCcw, RewindIcon} from "lucide-react";
import {ForwardIcon, PauseIcon, PlayIcon, PreviousIcon} from "~/components/icons/icons";
import {toast} from "sonner";


function PlayButton() {
    const {state,} = useGridContext()
    if (isNullOrUndefined(state.aStarData)) {
        return <PlayIcon className="size-3 2xs:size-3.5 sm:size-4"/>
    }
    if (state.isPlaying && state.configChanged) {
        return <RewindIcon className="size-3 2xs:size-3.5 sm:size-4"/>;
    }

    if (state.isPlaying && !state.configChanged) {
        return <PauseIcon className="size-3 2xs:size-3.5 sm:size-4"/>;
    }

    if (!state.isPlaying && state.configChanged) {
        return <RefreshCcw className="size-3 2xs:size-3.5 sm:size-4"/>;
    }

    return <PlayIcon className="size-3 2xs:size-3.5 sm:size-4"/>;
}

export function PlaybackControls({className, ...props}: ComponentPropsWithoutRef<'div'>) {
    const {state, dispatch} = useGridContext()
    const {aStarData, currentTimelineIndex} = state
    const hasNoAStarData = isNullOrUndefined(aStarData)
    const id = useId()
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline

    const stateRef = useRef({
        hasNoAStarData: false,
        configChanged: false,
        isPlaying: false,
    });

    stateRef.current = {
        hasNoAStarData,
        configChanged: state.configChanged,
        isPlaying: state.isPlaying,
    };
    const handlePlay = useCallback(() => {
        const {hasNoAStarData, configChanged, isPlaying} = stateRef.current;

        if (hasNoAStarData || configChanged) {
            dispatch({
                type: "RUN_ASTAR",
                payload: {options: {autoRun: true}}
            });

            if (configChanged) {
                toast("⚡️ Config Updated!", {
                    description: "We're off again with your latest tweaks — A* is on the move.",
                    position: "top-center",
                });
            }
            return;
        }

        dispatch({
            type: "SET_PLAYING_STATUS",
            payload: !isPlaying,
        });
    }, [dispatch]);

    const handleSetIndex = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: "SET_INDEX",
            payload: parseInt(e.target.value, 10),
        })
    }, [dispatch])

    useEffect(() => {
        if (state.configChanged) {
            toast("⚡️ Config Change Detected!", {
                description: "A new config has been detected",
                position: "top-center",
            });
        }
    }, [state.configChanged]);

    const handleJumpToStart = useCallback(() => dispatch({type: "JUMP_TO_START"}), [dispatch]);
    const handleIncrement = useCallback(() => dispatch({type: "INCREMENT_INDEX"}), [dispatch]);
    const handleDecrement = useCallback(() => dispatch({type: "DECREMENT_INDEX"}), [dispatch]);
    const handleJumpToEnd = useCallback(() => dispatch({type: "JUMP_TO_END"}), [dispatch]);
    const handleJumpToPathStart = useCallback(() => dispatch({type: "JUMP_TO_PATH_START"}), [dispatch]);

    return (
        <div className={cn("w-full bg-white border-b border-gray-200 shadow-sm", className)}{...props}>
            <div className="flex flex-col gap-3 px-2 2xs:px-3 sm:px-4 py-3">

                <div className="flex flex-col 2xs:flex-row 2xs:items-center gap-2 w-full">
                    <div className="flex-1 min-w-0">
                        <input
                            id={`${id}-timeline`}
                            type="range"
                            min={-1}
                            max={timeline.length - 1}
                            disabled={timeline.length === 0}
                            value={currentTimelineIndex}
                            onChange={handleSetIndex}
                            className={`w-full h-2 bg-gray-200 accent-sky-500                        
                             rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
                            style={{
                                background:
                                    timeline.length > 0 && currentTimelineIndex >= 0
                                        ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                                            ((currentTimelineIndex + 1) / timeline.length) * 100
                                        }%, #e5e7eb ${
                                            ((currentTimelineIndex + 1) / timeline.length) * 100
                                        }%, #e5e7eb 100%)`
                                        : "#e5e7eb",
                            }}
                        />
                    </div>
                    <div className="2xs:ml-2 flex-shrink-0">
                        <PlaybackStatusIndicator/>
                    </div>
                </div>

                <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:justify-between md:justify-center">

                    <div className="flex justify-center xs:justify-start">
                        <div
                            className="inline-flex items-center gap-1 2xs:gap-1.5 sm:gap-2 bg-gray-50 px-1.5 2xs:px-2 py-1 rounded-full">
                            <button
                                disabled={hasNoAStarData}
                                onClick={handleJumpToStart}
                                className="p-2 2xs:p-2.5 sm:p-3 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Jump to Start"
                            >
                                <RewindIcon className="size-3 2xs:size-3.5 sm:size-4"/>
                            </button>

                            <button
                                disabled={hasNoAStarData}
                                onClick={handleDecrement}
                                className="p-2 2xs:p-2.5 sm:p-3 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Previous Step"
                            >
                                <PreviousIcon className="size-3 2xs:size-3.5 sm:size-4"/>
                            </button>

                            <button
                                onClick={handlePlay}
                                className={`p-2.5 2xs:p-3 sm:p-3.5
                                  ${state.configChanged && !hasNoAStarData ? ' animate-bounce bg-amber-500' : ' bg-sky-500'}
                                  text-white rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                                title={state.isPlaying ? "Pause" : "Play"}
                            >
                                <PlayButton/>
                            </button>

                            <button
                                disabled={hasNoAStarData}
                                onClick={handleIncrement}
                                className="p-2 2xs:p-2.5 sm:p-3 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Next Step"
                            >
                                <ForwardIcon className="size-3 2xs:size-3.5 sm:size-4"/>
                            </button>

                            <button
                                disabled={hasNoAStarData}
                                onClick={handleJumpToEnd}
                                className="p-2 2xs:p-2.5 sm:p-3 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Jump to End"
                            >
                                <FastForwardIcon className="size-3 2xs:size-3.5 sm:size-4"/>
                            </button>
                            <button
                                disabled={hasNoAStarData}
                                onClick={handleJumpToPathStart}
                                className="inline-flex items-center gap-2 2xs:gap-2.5 sm:gap-3 px-2 2xs:px-2.5 sm:px-3 py-1 2xs:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs 2xs:text-sm font-medium rounded border border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Jump to Path Start"
                            >
                                <MapIcon className="size-3 2xs:size-3.5 sm:size-4"/>
                                <span className="hidden 2xs:inline">Path</span>
                                <span className="2xs:hidden">P</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
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
                    ? 'bg-sky-50 border border-sky-200'
                    : hasNoAStarData && currentTimelineIndex < 0 ? 'bg-gray-50 border border-gray-200' : 'bg-green-100 border-gray-100'
            }`}>
                <div className={`size-2 rounded-full transition-all duration-300 ${
                    !hasNoAStarData && currentTimelineIndex >= 0
                        ? 'bg-or animate-pulse'
                        : hasNoAStarData && currentTimelineIndex < 0 ? 'bg-gray-400' : 'bg-green-400'
                }`}></div>
                <div className="text-sm font-medium">
                    {currentTimelineIndex >= 0 ? (
                        <span className="text-sky-700">
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