import {type ChangeEvent, type ComponentPropsWithoutRef, useId} from "react";
import {useGridContext} from "~/state/context";
import {cn} from "~/lib/utils";
import {type Algorithm} from "~/presets/algorithm-gh-weight-configs";
import AlgorithmSelector from "~/components/control-panel/algorithm-selector";

export function CostWeightSliders({className, ...props}: ComponentPropsWithoutRef<'div'>) {
    const id = useId()
    const {state, dispatch} = useGridContext()
    return (
        <div
            className={cn("bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 space-y-6", className)}
            {...props}>

            <div className="flex items-center gap-3">
                <div
                    className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-100 to-pink-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z"/>
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">A* Weight Control</h3>
                    <p className="text-sm text-gray-500">Balance exploration vs exploitation</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <label htmlFor={`${id}_gWeight`} className="text-sm font-semibold text-blue-700">
                            G-Weight (Path Cost)
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                    <span
                        className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-sm font-bold text-blue-800">
                        {state.gwWeights.gWeight}
                    </span>
                        {state.gwWeights.gWeight === 1 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Standard
                        </span>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <input
                        id={`${id}_gWeight`}
                        type="range"
                        min={0}
                        max={10}
                        step={0.1}
                        value={state.gwWeights.gWeight}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            dispatch({
                                type: 'SET_G_WEIGHT',
                                payload: Number(e.target.value),
                            })
                        }}
                        className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(state.gwWeights.gWeight / 10) * 100}%, #dbeafe ${(state.gwWeights.gWeight / 10) * 100}%, #dbeafe 100%)`
                        }}
                    />
                </div>

                <div className="flex justify-between text-xs text-blue-600">
                    <span>0 (Ignore cost)</span>
                    <span>5 (Balanced)</span>
                    <span>10 (Cost priority)</span>
                </div>

                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                    Higher values prioritize shorter paths, lower values explore more freely.
                </p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                        <label htmlFor={`${id}_hWeight`} className="text-sm font-semibold text-pink-700">
                            H-Weight (Heuristic)
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                    <span
                        className="px-2 py-1 bg-pink-50 border border-pink-200 rounded text-sm font-bold text-pink-800">
                        {state.gwWeights.hWeight}
                    </span>
                        {state.gwWeights.hWeight === 1 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Standard
                        </span>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <input
                        id={`${id}_hWeight`}
                        type="range"
                        min={0}
                        max={10}
                        step={0.1}
                        value={state.gwWeights.hWeight}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            dispatch({
                                type: 'SET_H_WEIGHT',
                                payload: Number(e.target.value),
                            })
                        }}
                        className="w-full h-3 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                        style={{
                            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(state.gwWeights.hWeight / 10) * 100}%, #fce7f3 ${(state.gwWeights.hWeight / 10) * 100}%, #fce7f3 100%)`
                        }}
                    />
                </div>

                <div className="flex justify-between text-xs text-pink-600">
                    <span>0 (No guidance)</span>
                    <span>5 (Balanced)</span>
                    <span>10 (Goal focused)</span>
                </div>

                <p className="text-xs text-pink-600 bg-pink-50 p-2 rounded-md">
                    Higher values focus more on reaching the goal, lower values explore uniformly.
                </p>
            </div>

            <AlgorithmSelector onAlgorithmChange={(algorithm: Algorithm) => {
                dispatch({
                    type: "SET_BOTH_WEIGHTS",
                    payload: algorithm.weights,
                })
            }}>
            </AlgorithmSelector>
        </div>
    )

}





