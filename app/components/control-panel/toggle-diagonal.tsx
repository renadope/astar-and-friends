import {useGridContext} from "~/state/context";
import {isNullOrUndefined} from "~/utils/helpers";
import {ToggleGroup, ToggleGroupItem} from "~/components/ui/toggle-group";
import {useId} from "react";

export function ToggleDiagonal() {
    const {state, dispatch} = useGridContext()
    const {diagonalSettings} = state
    const hasNoAStarData = isNullOrUndefined(state.aStarData)
    const id = useId()

    return (
        <div className="space-y-2 col-span-full">
            <ToggleGroup
                type="single"
                value={state.diagonalSettings.allowed ? state.diagonalSettings.cornerCutting : 'none'}
                onValueChange={(val: string) => {
                    if (isNullOrUndefined(val) || val.trim().length === 0) {
                        dispatch({
                            type: "TOGGLE_DIAGONAL",
                            payload: 'none'
                        })
                    }
                    dispatch({
                        type: "TOGGLE_DIAGONAL",
                        payload: val as 'none' | 'strict' | 'lax'
                    })

                }}
                variant="outline"
                size="default"
                className="w-full"
            >
                <ToggleGroupItem value="none" aria-label="No Diagonal">
                    None
                </ToggleGroupItem>
                <ToggleGroupItem value="strict" aria-label="Strict Diagonal">
                    Strict
                </ToggleGroupItem>
                <ToggleGroupItem value="lax" aria-label="Lax Diagonal">
                    Lax
                </ToggleGroupItem>
            </ToggleGroup>

            {diagonalSettings.allowed && (
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
            )}
        </div>
    )
}