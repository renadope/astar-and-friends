import {useGridContext} from "~/state/context";
import {stringifyPos} from "~/utils/grid-helpers";
import {isNullOrUndefined} from "~/utils/helpers";
import type {Pos} from "~/types/pathfinding";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";

//consider adding this to the state
const gridCellSize = 7

export const cellBgColor = {
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

type CellProps = {
    pos: Pos
}

export default function GridCell({pos}: CellProps) {
    const {state, dispatch} = useGridContext()
    const {aStarData, currentTimelineIndex, cellData} = state
    const [r, c] = pos
    const cell = cellData[r][c]
    const key = stringifyPos(...cell.pos)

    const snapShotStep = cell.snapShotStep ?? Number.MAX_SAFE_INTEGER

    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    const history = aStarData ? aStarData.costUpdateHistory[key] ?? [] : []
    const updatedOnThisStep = history.some((h) => h.step - 1 === snapShotStep)
    // const updatedOnThisStep = history.some((h) => h.step === snapShotStep + 1)
    const costUpdateOnThisStep = history.find((h) => h.step === snapShotStep + 1)
    const isLastStep = timeline.length - 1 === currentTimelineIndex
    const isCurrentStep = cell.step === currentTimelineIndex;

    const next = timeline[currentTimelineIndex + 1]
    const posUpNext = !isNullOrUndefined(next) && next.type === 'visited' ? next.node.pos : undefined

    const bestFrontier = cell.state === 'frontier' && !isNullOrUndefined(posUpNext) && r === posUpNext[0] && c === posUpNext[1]
    return (
        <div
            key={key}
            style={{
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                border: `${1 + Math.min(1, 5, Math.sqrt(cell.cost) * .7)}px solid ${costToColor(cell.cost)}`,
                boxShadow: isCurrentStep ? "0 0 15px 5px rgba(59, 130, 246, 0.6)" :
                    cell.state === "path" ? "0 0 8px rgba(16, 185, 129, 0.7)" :
                        "0 2px 4px rgba(0,0,0,0.1)"
            }}
            className={`
        size-9 2xs:size-10 xs:size-13 sm:size-14 md:size-16 lg:size-18 xl:size-20 2xl:size-22 3xl:size-24 
        rounded-lg flex flex-col items-center justify-center relative backdrop-blur-sm hover:scale-105
        ${cellBgColor[cell.state] ?? 'bg-sky-500'}
        ${bestFrontier ? 'z-10 2xs:translate-x-8 2xs:translate-y-4 2xs:scale-125 sm:translate-x-10 sm:translate-y-5 sm:scale-140 lg:translate-x-12 lg:translate-y-6 lg:scale-150' : ''}
        ${updatedOnThisStep ? 'relative after:absolute after:inset-0 after:rounded-full after:animate-ping after:bg-sky-400/50 after:pointer-events-none' : ''}
        ${isCurrentStep && !isLastStep && cell.state !== 'path' ? 'scale-105 sm:scale-110' : 'scale-100'} 
        ${cell.state === "path" && isCurrentStep && !isLastStep ? "z-10 scale-105 sm:scale-110 animate-bounce" : ""}
        ${cell.state === 'path' && isCurrentStep && isLastStep ? "scale-105 sm:scale-110 z-10" : ""}
        `}
            onClick={() => {
                dispatch({
                    type: "UPDATE_CELL_STATUS",
                    payload: [r, c]
                })
            }}
        >
            {isCurrentStep && isLastStep && (
                <div className="absolute top-0 left-0 text-lg">🏁</div>
            )}
            <Tooltip>
                <TooltipTrigger disabled={state.cellSelectionState === 'inactive'} asChild>
                    <div className="flex flex-col gap-0.5 items-center w-full h-full justify-center group">
                        <p className={`block text-xs md:text-sm lg:text-lg ${textColors[cell.state] || "text-slate-500"} opacity-80 group-hover:opacity-100`}>
                            {cell.cost}
                        </p>
                        {cell.f !== undefined && (
                            <p className="md:hidden text-xs font-light sm:font-bold text-white">
                                f:{cell.f.toFixed(1)}
                            </p>
                        )}
                    </div>
                </TooltipTrigger>

                <TooltipContent className="w-48 p-5 ">
                    <div className="space-y-3">
                        <div className="font-semibold">Cell Details</div>

                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">Position:</span>
                                <span>{cell.pos.join(',')}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cost:</span>
                                <span>{cell.cost}</span>
                            </div>
                            {!isNullOrUndefined(cell.h) && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">H-Score:</span>
                                    <span>{cell.h.toFixed(2)}</span>
                                </div>
                            )}
                            {!isNullOrUndefined(cell.f) && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">F-Score:</span>
                                    <span>{cell.f.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">State:</span>
                                <span className={'text-white'}>
                                        {cell.state}
                                </span>
                            </div>
                        </div>

                        {!isNullOrUndefined(cell.costUpdateHistory) && cell.costUpdateHistory.length > 0 && (
                            <div className="border-t pt-2 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Updates:</span>
                                    <span
                                        className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded">
                                        {cell.costUpdateHistory.length}
                                    </span>
                                </div>
                                {cell.costUpdateHistory.length > 1 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Delta:</span>
                                        <span
                                            className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm">
                                        {(cell.costUpdateHistory[0].gCost - cell.costUpdateHistory[cell.costUpdateHistory.length - 1].gCost).toFixed(2)}
                                    </span>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>

            {(cell.state === "path" || isCurrentStep) && (
                <div
                    className="absolute inset-0 rounded-md bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
            )}


            {cell.f !== undefined && (
                <div
                    className="hidden md:block absolute top-0 right-0 text-xs bg-slate-800 text-white px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg font-bold shadow-lg">
                    f:{cell.f.toFixed(1)}
                </div>
            )}
        </div>
    )
}


//not gonna use this method, but wanted a quick and dirty way to just see the weights without inspecting
function costToColor(cost: number): string {
    if (cost === 0) return "#1e293b"; // slate-800 — walls/obstacles
    if (cost < 2) return "#1bc2b3";   // blue green kinda
    if (cost < 4) return "#84cc16";   // lime-500 — plains
    if (cost < 7) return "#eab308";   // yellow-500 — desert/sand
    if (cost < 11) return "#f97316";  // orange-500 — rocky/hills
    if (cost < 16) return "#dc2626";  // red-600 — mountains
    if (cost < 22) return "#7c3aed";  // violet-600 — extreme terrain
    return "#be185d";                 // pink-700 — lava/impassable
}