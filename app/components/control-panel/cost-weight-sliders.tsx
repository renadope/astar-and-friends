import {type ChangeEvent, useId} from "react";
import {useGridContext} from "~/state/context";

export function CostWeightSliders() {
    const id = useId()
    const {state, dispatch} = useGridContext()
    return (
        <div className="flex flex-col gap-4 max-w-md  mt-4 p-4 bg-white hover:bg-slate-50 rounded-lg shadow-md">
            <h3 className={'text-sm font-mono'}>Control A* Behavior with Weights</h3>
            <div className="w-full ">
                <label htmlFor={`${id}_gWeight`}
                       className="block text-sm font-semibold text-blue-600 mb-1">
                    G-Weight (Cost So Far): <span
                    className="font-mono text-black">{state.gwWeights.gWeight}</span>
                </label>
                <input
                    id={`${id}_gWeight`}
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={state.gwWeights.gWeight}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        dispatch({
                            type: 'SET_G_WEIGHT',
                            payload: Number(e.target.value),
                        })
                    }
                    }
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
            </div>
            <div className="w-full pt-2">
                <label htmlFor={`${id}_hWeight`}
                       className="block text-sm font-semibold text-pink-600 mb-1">
                    H-Weight (Heuristic): <span
                    className="font-mono text-black">{state.gwWeights.hWeight}</span>
                </label>
                <input
                    id={`${id}_hWeight`}
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={state.gwWeights.hWeight}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        dispatch({
                            type: 'SET_H_WEIGHT',
                            payload: Number(e.target.value),
                        })
                    }

                    }
                    className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
            </div>
        </div>
    )
}