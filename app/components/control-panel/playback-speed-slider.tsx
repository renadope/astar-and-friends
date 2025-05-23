import {type ComponentPropsWithoutRef, useId} from "react";
import {useGridContext} from "~/state/context";
import {DEFAULT_PLAYBACK_SPEED_MS,} from "~/state/constants";
import {cn} from "~/lib/utils";

export function PlaybackSpeedSlider({className, ...props}: ComponentPropsWithoutRef<'div'>) {
    const id = useId()
    const {state, dispatch} = useGridContext()
    const {playbackSpeedFactor} = state

    return (
        <div className={cn(`space-y-3`, className)}{...props}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <label htmlFor={`${id}-playbackSpeed`} className="text-sm font-medium text-gray-700">
                        Playback Speed
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-sky-50 border border-sky-200 rounded-md">
                        <span className="text-sm font-semibold text-sky-700">{playbackSpeedFactor}×</span>
                    </div>
                    <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md">
                        <span
                            className="text-xs text-gray-600">{Math.floor(DEFAULT_PLAYBACK_SPEED_MS / playbackSpeedFactor)}ms</span>
                    </div>
                </div>
            </div>


            <div className="flex gap-2 justify-center flex-wrap">
                {[0.5, 1, 2, 4, 5, 10].map(speed => (
                    <button
                        key={speed}
                        onClick={() => dispatch({
                            type: 'SET_PLAYBACK_SPEED_FACTOR',
                            payload: {factor: speed}
                        })}
                        className={`p-2 text-xs font-medium rounded transition-all duration-200 ${
                            playbackSpeedFactor === speed
                                ? 'border-2 border-black bg-sky-500 hover:bg-sky-600 text-white shadow-sm rounded-full'
                                : 'border border-black bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-md'
                        }`}
                    >
                        {speed}×
                    </button>
                ))}
            </div>
        </div>
    )
}