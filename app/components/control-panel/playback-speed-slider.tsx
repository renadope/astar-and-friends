import {type ComponentPropsWithoutRef} from "react";
import {useGridContext} from "~/state/context";

export function PlaybackSpeedSlider({...props}: ComponentPropsWithoutRef<'div'>) {
    const {state, dispatch} = useGridContext()
    const {playbackSpeedFactor} = state

    return (
        <div {...props}>
            <div className="flex gap-2 justify-center flex-wrap">
                {[0.5, 1, 2, 4, 5, 10].map(speed => (
                    <button
                        key={speed}
                        onClick={() => dispatch({
                            type: 'SET_PLAYBACK_SPEED_FACTOR',
                            payload: {factor: speed}
                        })}
                        className={`p-1.5 text-xs font-medium rounded transition-all duration-200 ${
                            playbackSpeedFactor === speed
                                ? 'border border-black bg-sky-500 hover:bg-sky-600 text-white shadow-sm rounded-full'
                                : 'border border-gray-700 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-md'
                        }`}
                    >
                        {speed}×
                    </button>
                ))}
            </div>
        </div>
    )
}