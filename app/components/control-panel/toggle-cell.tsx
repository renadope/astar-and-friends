import {useGridContext} from "~/state/context";
import {isNullOrUndefined} from "~/utils/helpers";
import {ToggleGroup, ToggleGroupItem} from "~/components/ui/toggle-group";
import type {CellToggle} from "~/cell-data/types";

export function ToggleCell() {
    const {state, dispatch} = useGridContext()
    const hasNoAStarData = isNullOrUndefined(state.aStarData)

    return (
        <div className="space-y-2 col-span-full">
            <label className="text-sm font-medium text-muted-foreground">Cell
                Mode:{state.cellSelectionState ? state.cellSelectionState : `ghhgfhfh`}</label>
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
                className="w-full"
                disabled={!hasNoAStarData}
            >
                <ToggleGroupItem value="set_goal" aria-label="Set Goal">
                    Set Goal 🎯
                </ToggleGroupItem>
                <ToggleGroupItem value="set_start" aria-label="Set Start">
                    Set Start 🏁
                </ToggleGroupItem>
                <ToggleGroupItem value="toggle_wall" aria-label="Toggle Wall">
                    Toggle Wall 🚧
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    )
}