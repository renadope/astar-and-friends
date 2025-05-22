import {useId} from "react";
import {useGridContext} from "~/state/context";

export function DiagonalControls() {
    const id = useId()
    const {state: {diagonalSettings}, dispatch} = useGridContext()
    return (
        <div className="flex flex-col gap-4 max-w-md  mt-4 p-4 bg-white hover:bg-slate-50 rounded-lg shadow-md">
            <h3 className={'text-sm font-mono'}>Diagonal Contorls</h3>
            <fieldset className="border p-3 rounded-md">
                <legend className="text-sm font-semibold text-gray-700">Diagonal Movement</legend>

                <label className="flex items-center gap-2 mt-2" htmlFor={`${id}_toggle_diagonal`}>
                    <input id={`${id}_toggle_diagonal`} type="checkbox"

                           checked={diagonalSettings.allowed} onChange={() => {
                        dispatch({
                            type: 'TOGGLE_DIAGONAL',
                            payload: !diagonalSettings.allowed
                        })

                    }}/>
                    Allow Diagonal
                </label>

                {diagonalSettings.allowed && (
                    <div className="ml-4 mt-2 space-y-2">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2"
                                   htmlFor={`${id}_toggle_diagonal_strict`}>
                                <input
                                    id={`${id}_toggle_diagonal_strict`}
                                    type="radio"
                                    name={`diagonalMode-${id}`}
                                    value="strict"
                                    checked={diagonalSettings.cornerCutting === 'strict'}
                                    onChange={() => {
                                        dispatch({
                                            type: "TOGGLE_CORNER_CUTTING",
                                            payload: "strict"
                                        })

                                    }}
                                />
                                Strict
                            </label>

                            <label className="flex items-center gap-2"
                                   htmlFor={`${id}_toggle_diagonal_lax`}>
                                <input
                                    type="radio"
                                    id={`${id}_toggle_diagonal_lax`}
                                    name={`diagonalMode-${id}`}
                                    value="lax"
                                    checked={diagonalSettings.cornerCutting === 'lax'}
                                    onChange={() => {
                                        dispatch({
                                            type: "TOGGLE_CORNER_CUTTING",
                                            payload: "lax"
                                        })

                                    }}
                                />
                                Lax
                            </label>
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 font-medium"
                                   htmlFor={`${id}_toggle_diagonal_multiplier`}>
                                Diagonal Cost
                                Multiplier: {diagonalSettings.diagonalMultiplier.toFixed(4)}
                            </label>
                            <input
                                id={`${id}_toggle_diagonal_multiplier`}
                                type="range"
                                min={0.1}
                                max={10}
                                step={.1}
                                value={diagonalSettings.diagonalMultiplier}
                                onChange={(e) => {
                                    dispatch({
                                        type: "SET_DIAGONAL_MULTIPLIER",
                                        payload: Number(e.target.value)
                                    })
                                }}
                                className="w-full accent-purple-500"
                            />
                        </div>
                    </div>
                )}
            </fieldset>

        </div>
    )
}