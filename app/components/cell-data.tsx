import {stringifyPos} from "~/utils/grid-helpers";
import {capitalize, isNullOrUndefined} from "~/utils/helpers";
import {useGridContext} from "~/state/context";

//consider adding this to the state
const gridCellSize = 7

const cellBgColor = {
    "empty": "bg-slate-50",      // slate-50 – neutral background
    "wall": "bg-slate-800",       // slate-800 – sturdy and dark
    "visited": "bg-purple-400",    // purple-400 – brighter, playful violet
    "frontier": "bg-yellow-300",   // yellow-300 – golden and cheerful
    "path": "bg-emerald-400",       // emerald-400 – balanced, modern trail
    "start": "bg-sky-500",      // sky-500 – distinct blue entry point
    "goal": "bg-pink-500"        // rose-500 – emotional, urgent destination
};
const textColors: Record<keyof typeof cellBgColor, string> = {
    wall: "text-white",
    path: "text-white",
    visited: "text-white",
    start: "text-white",
    goal: "text-white",
    empty: "text-slate-800",
    frontier: "text-slate-950"
};

export default function CellData() {
    const {state, dispatch} = useGridContext()
    const {cellData, currentTimelineIndex, aStarData} = state
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    const hasCellData = !isNullOrUndefined(cellData) && cellData.length > 0
    return (
        <div className="p-4 flex flex-col gap-y-2 border-2 border-sky-300 rounded-2xl">
            {hasCellData && cellData.map((row, r) => (
                <div key={`col-${r}`} className="flex gap-1 hover:gap-2 transition-all duration-200">
                    {row.map((cell, c) => {

                        const snapShotStep = cell.snapShotStep ?? Number.MAX_SAFE_INTEGER
                        const key = stringifyPos(...cell.pos)
                        const history = aStarData ? aStarData.costUpdateHistory[key] ?? [] : []
                        const updatedOnThisStep = history.some((h) => h.step - 1 === snapShotStep)
                        // const updatedOnThisStep = history.some((h) => h.step === snapShotStep + 1)
                        const costUpdateOnThisStep = history.find((h) => h.step === snapShotStep + 1)
                        const isLastStep = timeline.length - 1 === currentTimelineIndex
                        const isCurrentStep = cell.step === currentTimelineIndex;

                        const next = timeline[currentTimelineIndex + 1]
                        const isVisitedNext = !isNullOrUndefined(next) && next.type === 'visited'
                        const posUpNext = isVisitedNext && next.type === 'visited' ? next.node.pos : undefined

                        const bestFrontier = cell.state === 'frontier' && isVisitedNext && !isNullOrUndefined(posUpNext) && r === posUpNext[0] && c === posUpNext[1]
                        return (
                            <div
                                key={key}
                                style={{
                                    height: `${gridCellSize}rem`,
                                    width: `${gridCellSize}rem`,
                                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    border: `${1 + Math.min(1, 5, Math.sqrt(cell.cost) * .7)}px solid ${costToColor(cell.cost)}`,
                                    boxShadow: isCurrentStep ? "0 0 15px 5px rgba(59, 130, 246, 0.6)" :
                                        cell.state === "path" ? "0 0 8px rgba(16, 185, 129, 0.7)" :
                                            "0 2px 4px rgba(0,0,0,0.1)"
                                }}
                                className={` rounded-lg flex flex-col items-center justify-center relative backdrop-blur-sm
                        ${cellBgColor[cell.state] ?? 'bg-sky-500'}
                        ${bestFrontier ? 'z-10 translate-x-12 translate-y-6 scale-160' : ''}
                        ${updatedOnThisStep ? 'relative after:absolute after:inset-0 after:rounded-full after:animate-ping after:bg-sky-400/50' : ''}
                        ${isCurrentStep && !isLastStep && cell.state !== 'path' ? 'scale-110' : 'scale-100'} 
                        ${cell.state === "path" && isCurrentStep && !isLastStep ? "z-10 scale-110 animate-bounce" : ""}
                        ${cell.state === 'path' && isCurrentStep && isLastStep ? "scale-110 z-10" : ""}
                        `}
                                onClick={() => {
                                    dispatch({
                                        type: "UPDATE_CELL_STATUS",
                                        payload: [r, c]
                                    })
                                }}
                                onMouseEnter={(e) => {
                                    if (cell.costUpdateHistory && cell.costUpdateHistory.length > 0) {
                                        e.currentTarget.setAttribute('title', `Cost updates: ${cell.costUpdateHistory.join(' → ')}`);
                                    }
                                }}
                            >
                                {isCurrentStep && isLastStep && (
                                    <div className="absolute top-0 left-0 text-lg">🏁</div>
                                )}

                                <div className="flex flex-col items-center w-full h-full justify-center group">
                                    <p className={`text-xs font-bold ${textColors[cell.state] || "text-slate-700"} transition-all duration-200 group-hover:text-lg`}>
                                        {capitalize(cell.state)}
                                    </p>

                                    <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                        {cell.pos.join(',')}
                                    </p>

                                    <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                        g:{cell.cost}
                                    </p>
                                    <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                        {!isNullOrUndefined(cell.h) ? `h:${cell.h.toFixed(2)}` : ''}
                                    </p>
                                    {cell.costUpdateHistory && cell.costUpdateHistory.length > 0 && (
                                        <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                            cost:{cell.costUpdateHistory[cell.costUpdateHistory.length - 1].gCost.toFixed(2)}
                                        </p>
                                    )}{cell.costUpdateHistory && cell.costUpdateHistory.length > 1 && (
                                    <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                        dlta:{Math.abs(cell.costUpdateHistory[cell.costUpdateHistory.length - 1].gCost - cell.costUpdateHistory[0].gCost).toFixed(2)}
                                    </p>
                                )}
                                    {costUpdateOnThisStep && (
                                        <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                            foo:{costUpdateOnThisStep.gCost}
                                        </p>
                                    )}
                                    {cell.costUpdateHistory && cell.costUpdateHistory.length > 0 && (
                                        <div
                                            className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs px-1 rounded-full shadow-sm transform transition-transform group-hover:scale-125">
                                            {cell.costUpdateHistory.length}
                                        </div>
                                    )}
                                    {cell.costUpdateHistory && cell.costUpdateHistory.length > 0 && (
                                        <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                            all:{cell.costUpdateHistory.map((foo) => foo.gCost.toFixed(1)).join(',')}
                                        </p>
                                    )}

                                </div>

                                {(cell.state === "path" || isCurrentStep) && (
                                    <div
                                        className="absolute inset-0 rounded-md bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                )}

                                {cell.f !== undefined && (
                                    <div
                                        className="absolute top-0 right-0 text-xs bg-white/80 text-black px-1 py-0.5 rounded-bl-md rounded-tr-md font-mono shadow-sm">
                                        f:{cell.f.toFixed(1)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
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

//not gonna use this method, but wanted a quick and dirty way to just see the weights without inspecting
function costToColor(cost: number): string {
    if (cost === 0) return "#334155"; // wall — dark and sturdy (unchanged)

    if (cost < 3) return "#22d3ee";   // cyan-400 — easy, chill terrain
    if (cost < 5) return "#fcd34d";   // yellow-300 — sandy, cautious zone
    if (cost < 8) return "#fb923c";   // orange-400 — rugged area
    if (cost < 15) return "#f87171";  // red-400 — painful, but passable
    return "#c084fc";                // purple-400 — extreme zone
}
