import {useGridContext} from "~/state/context";
import {isNullOrUndefined} from "~/utils/helpers";
import {ToggleGroup, ToggleGroupItem} from "~/components/ui/toggle-group";
import {type ComponentPropsWithoutRef, useId} from "react";
import {cn} from "~/lib/utils";

export function ToggleDiagonal({className, ...props}: ComponentPropsWithoutRef<'div'>) {
    const {state, dispatch} = useGridContext()
    const {diagonalSettings} = state
    const id = useId()

    return (
        <div className={cn("space-y-4 col-span-full border-t-2 border-b-2 border-gray-300 p-2 rounded-lg", className)}
             {...props}>
            <h3 className="text-sm font-semibold text-gray-800">Diagonal Movement</h3>

            <div className="space-y-2">
                <p className="text-xs text-gray-600 leading-relaxed">
                    Configure how the pathfinding algorithm handles diagonal movement between grid cells.
                </p>

                <ToggleGroup
                    type="single"
                    value={state.diagonalSettings.allowed ? state.diagonalSettings.cornerCutting : 'none'}
                    onValueChange={(val: string) => {
                        if (isNullOrUndefined(val) || val.trim().length === 0 || val === 'none') {
                            dispatch({
                                type: "TOGGLE_DIAGONAL",
                                payload: 'none'
                            })
                            return
                        }
                        dispatch({
                            type: "TOGGLE_DIAGONAL",
                            payload: val as 'none' | 'strict' | 'lax'
                        })
                    }}
                    variant="outline"
                    size="default"
                    className="w-full grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-lg"
                >
                    <ToggleGroupItem
                        value="none"
                        aria-label="No Diagonal Movement"
                        className="data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:border-gray-300 transition-all duration-200"
                    >
                        <div className="flex flex-col items-center gap-1 py-1">
                            <div className="size-4 border-2 border-current rounded-sm"></div>
                            <span className="text-xs font-medium">None</span>
                        </div>
                    </ToggleGroupItem>

                    <ToggleGroupItem
                        value="strict"
                        aria-label="Strict Diagonal Movement"
                        className="data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:border-gray-300 transition-all duration-200"
                    >
                        <div className="flex flex-col items-center gap-1 py-1">
                            <div className="relative size-4">
                                <div className="size-4 border-2 border-current rounded-sm"></div>
                                <div
                                    className="absolute -top-0.5 -right-0.5 w-2 h-0.5 bg-current transform rotate-45"></div>
                            </div>
                            <span className="text-xs font-medium">Strict</span>
                        </div>
                    </ToggleGroupItem>

                    <ToggleGroupItem
                        value="lax"
                        aria-label="Lax Diagonal Movement"
                        className="data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:border-gray-300 transition-all duration-200"
                    >
                        <div className="flex flex-col items-center gap-1 py-1">
                            <div className="relative size-4">
                                <div className="size-4 border-2 border-current rounded-sm"></div>
                                <div
                                    className="absolute -top-0.5 -right-0.5 w-2 h-0.5 bg-current transform rotate-45"></div>
                                <div
                                    className="absolute -bottom-0.5 -left-0.5 w-2 h-0.5 bg-current transform rotate-45"></div>
                            </div>
                            <span className="text-xs font-medium">Lax</span>
                        </div>
                    </ToggleGroupItem>
                </ToggleGroup>

                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                    <div className="text-center">
                        <p>4-directional movement only</p>
                    </div>
                    <div className="text-center">
                        <p>Diagonal blocked by adjacent walls</p>
                    </div>
                    <div className="text-center">
                        <p>Diagonal allowed through corners</p>
                    </div>
                </div>
            </div>

            {diagonalSettings.allowed && (
                <div
                    className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <label
                                className="text-sm font-medium text-purple-900"
                                htmlFor={`${id}_toggle_diagonal_multiplier`}
                            >
                                Diagonal Cost Multiplier
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                        <span
                            className="px-2 py-1 bg-purple-100 border border-purple-300 rounded text-sm font-semibold text-purple-800">
                            {diagonalSettings.diagonalMultiplier.toFixed(2)}×
                        </span>
                            {Math.abs(diagonalSettings.diagonalMultiplier - Math.sqrt(2)) <= 0.01 && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                √2 (Euclidean)
                            </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <input
                            id={`${id}_toggle_diagonal_multiplier`}
                            type="range"
                            min={1.0}
                            max={3.0}
                            step={0.01}
                            value={diagonalSettings.diagonalMultiplier}
                            onChange={(e) => {
                                dispatch({
                                    type: "SET_DIAGONAL_MULTIPLIER",
                                    payload: Number(e.target.value)
                                })
                            }}
                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />

                        <div className="flex gap-1 justify-between">
                            {[
                                {value: 1.0, label: "1.0", desc: "Same as orthogonal"},
                                {value: Math.sqrt(2), label: "√2", desc: "Euclidean distance"},
                                {value: 2.0, label: "2.0", desc: "Double cost"}
                            ].map(preset => (
                                <button
                                    key={preset.value}
                                    onClick={() => dispatch({
                                        type: "SET_DIAGONAL_MULTIPLIER",
                                        payload: preset.value
                                    })}
                                    className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                        diagonalSettings.diagonalMultiplier === preset.value
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                                    title={preset.desc}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-purple-700 leading-relaxed">
                        Higher values make diagonal movement more expensive, encouraging more orthogonal paths.
                    </p>
                </div>
            )}
        </div>
    )
}