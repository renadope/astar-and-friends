import {useGridContext} from "~/state/context";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "~/components/ui/select";
import type {TimelineOptions} from "~/state/types";

export function MultiVerse() {
    const {state, dispatch} = useGridContext()
    return (
        <div className={'mt-2'}>
            <label className="text-sm font-medium text-muted-foreground">Enter the multiverse</label>
            <Select
                value={state.timeline}
                onValueChange={(value) => {
                    dispatch({
                        type: "SELECT_TIMELINE",
                        payload: value as TimelineOptions
                    })

                }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a timeline"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Multiverse</SelectLabel>
                        <SelectItem value="granular">Granular</SelectItem>
                        <SelectItem value="snapshot">Snapshot</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}