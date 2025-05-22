import {isNullOrUndefined} from "~/utils/helpers";
import {useGridContext} from "~/state/context";
import GridCell, {cellBgColor} from "~/components/gridCell";
import {stringifyPos} from "~/utils/grid-helpers";


export default function Grid() {
    const {state} = useGridContext()
    const {cellData} = state
    const hasCellData = !isNullOrUndefined(cellData) && cellData.length > 0
    return (
        <div className="p-4 flex flex-col gap-y-2 border-2 border-sky-300 rounded-2xl">
            {hasCellData && cellData.map((row, r) => (
                <div key={`col-${r}`} className="flex gap-1 hover:gap-2 transition-all duration-200">
                    {row.map((_, c) => (
                        <GridCell key={stringifyPos(r, c)} pos={[r, c]}/>
                    ))}
                </div>
            ))}

            {hasCellData && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {["empty", "wall", "visited", "frontier", "path", "start", "goal"].map(state => (
                        <div key={state}
                             className="flex items-center gap-1 px-2 py-1 bg-white rounded-full shadow-2xl">
                            <div
                                className={`w-3 h-3 rounded-full ${cellBgColor[state as keyof typeof cellBgColor]}`}>

                            </div>
                            <span className="text-xs text-slate-700 capitalize">{state}</span>
                        </div>
                    ))}
                </div>)
            }
        </div>

    )
}


