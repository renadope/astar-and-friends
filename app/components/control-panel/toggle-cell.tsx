import {useGridContext} from "~/state/context";
import {isNullOrUndefined} from "~/utils/helpers";
import {ToggleGroup, ToggleGroupItem} from "~/components/ui/toggle-group";
import type {CellToggle} from "~/cell-data/types";
import type {ComponentPropsWithoutRef} from "react";
import {cn} from "~/lib/utils";
import {FancyClickIcon} from "~/components/icons/icons";

const selectionState: Record<CellToggle, string> = {
    "set_goal": 'bg-pink-100 text-pink-700 border border-pink-200 animate-pulse',
    "set_start": "bg-sky-100 text-sky-700 border border-sky-200 animate-pulse'",
    "toggle_wall": "bg-red-100 text-red-700 border border-red-200 animate-pulse",
    'inactive': ''
}
const phrase: Record<CellToggle, string> = {
    "set_goal": '🎯 Goal Mode',
    "set_start": '🏁 Start Mode',
    "toggle_wall": "🚧 Wall Mode",
    'inactive': 'Inactive'
}

export function ToggleCell({className, ...props}: ComponentPropsWithoutRef<'div'>) {
    const {state, dispatch} = useGridContext()
    const hasNoAStarData = isNullOrUndefined(state.aStarData)

    return (
        <div className={cn('space-y-4', className)}{...props}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FancyClickIcon className={'size-5 text-sky-500'}/>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">Cell Editing Mode</h3>
                        <p className="text-xs text-gray-500">Click on grid cells to modify</p>
                    </div>
                </div>

                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    !hasNoAStarData
                        ? 'bg-gray-100 text-gray-500 border border-gray-200'
                        : selectionState[state.cellSelectionState] ?? 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {!hasNoAStarData ? 'Locked' : (
                        phrase[state.cellSelectionState]
                    )}
                </div>
            </div>


            <ToggleGroup
                type="single"
                value={state.cellSelectionState}
                onValueChange={(val: string) => {
                    const st = val.trim()
                    dispatch({
                        type: "SET_CELL_SELECTION_STATE",
                        payload: st.length === 0 ? 'inactive' : st as CellToggle
                    })
                }}
                variant="outline"
                size="default"
                className="w-full grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-lg"
                disabled={!hasNoAStarData}
            >
                <ToggleGroupItem
                    value="set_goal"
                    aria-label="Set Goal Position"
                    className={`group data-[state=on]:bg-gradient-to-br
                   data-[state=on]:from-pink-500 data-[state=on]:to-fuchsia-600
                   data-[state=on]:text-white data-[state=on]:border-pink-400 
                     data-[state=on]:shadow-lg hover:scale-105 transition-all duration-200 py-4`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <div className="relative">
                            <span className="text-xl group-data-[state=on]:animate-bounce">🎯</span>
                            <div className={`absolute -inset-1
                             bg-pink-200 rounded-full opacity-0 group-data-[state=on]:opacity-30
                              group-data-[state=on]:animate-ping`}></div>
                        </div>
                        <span className="font-semibold text-sm whitespace-nowrap">Set Goal</span>
                    </div>
                </ToggleGroupItem>

                <ToggleGroupItem
                    value="set_start"
                    aria-label="Set Start Position"
                    className={`group data-[state=on]:bg-gradient-to-br
                   data-[state=on]:from-sky-500 data-[state=on]:to-teal-600
                   data-[state=on]:text-white data-[state=on]:border-sky-400 
                     data-[state=on]:shadow-lg hover:scale-105 transition-all duration-200 py-4`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <div className="relative">
                            <span className="text-xl group-data-[state=on]:animate-bounce">🏁</span>
                            <div className={`absolute -inset-1
                             bg-sky-200 rounded-full opacity-0 group-data-[state=on]:opacity-30
                              group-data-[state=on]:animate-ping`}></div>
                        </div>
                        <span className="font-semibold text-sm whitespace-nowrap">Set Start</span>
                    </div>
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="inactive"
                    aria-label="Set Start Position"
                    className={`group data-[state=on]:bg-gradient-to-br
                   data-[state=on]:from-gray-300 data-[state=on]:to-slate-400
                   data-[state=on]:text-white data-[state=on]:border-gray-400 
                     data-[state=on]:shadow-lg `}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-sm whitespace-nowrap">Inactive</span>
                    </div>
                </ToggleGroupItem>
            </ToggleGroup>

        </div>
    )
}

