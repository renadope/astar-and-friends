import {useGridContext} from "~/state/context";
import {isSamePos, stringifyPos} from "~/utils/grid-helpers";
import {capitalize, isNullOrUndefined} from "~/utils/helpers";
import type {Pos} from "~/types/pathfinding";
import type {CellData} from "~/cell-data/types";
import {Popover, PopoverContent, PopoverTrigger} from "~/components/ui/popover";
import {Input} from "~/components/ui/input";
import {cellWeight} from "~/presets/cell-weight";
import {type ComponentPropsWithoutRef, useMemo, useState} from "react";
import {cn} from "~/lib/utils";
import type {Nullish} from "~/types/helpers";

//consider adding this to the state
const gridCellSize = 7

export const cellBgColor: Record<CellData['state'], string> = {
    empty: "bg-slate-50",      // slate-50 – neutral background
    wall: "bg-slate-800",       // slate-800 – sturdy and dark
    visited: "bg-purple-400",    // purple-400 – brighter, playful violet
    frontier: "bg-yellow-300",   // yellow-300 – golden and cheerful
    path: "bg-emerald-400",       // emerald-400 – balanced, modern trail
    start: "bg-sky-500",      // sky-500 – distinct blue entry point
    goal: "bg-pink-500",        // rose-500 – emotional, urgent destination
    ghost: "bg-cyan-500"

};
const textColors: Record<CellData['state'], string> = {
    wall: "text-white",
    path: "text-white",
    visited: "text-white",
    start: "text-white",
    goal: "text-white",
    empty: "text-slate-800",
    frontier: "text-slate-950",
    ghost: "text-white"
};

type CellProps = {
    pos: Pos
    hoveredCell: Nullish<Pos>
    setHoveredCell: (foo: Nullish<Pos>) => void
}

function BasicCellInfo({cell, weightEmoji, className, ...props}: {
    cell: CellData,
    weightEmoji: string | undefined
} & ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            className={cn("flex flex-col gap-0.5 items-center w-full h-full justify-center group", className)}{...props}>
            <p className={`block text-xs md:text-sm lg:text-lg ${textColors[cell.state] || "text-slate-500"} opacity-80 group-hover:opacity-100`}>
                {weightEmoji && <span className="mr-1">{weightEmoji}</span>}
                {cell.cost}
            </p>

            {cell.f !== undefined && (
                <p className="md:hidden text-xs font-light sm:font-bold text-white">
                    f:{cell.f.toFixed(1)}
                </p>
            )
            }
        </div>
    )
}

export default function GridCell({pos, hoveredCell, setHoveredCell}: CellProps) {
    const {state, dispatch} = useGridContext()
    const [openWeightPopover, setOpenWeightPopover] = useState<boolean>(false)
    const {aStarData, currentTimelineIndex, cellData} = state
    const [r, c] = pos
    const cell = cellData[r][c]
    const key = stringifyPos(...cell.pos)
    const hasAStarData = !isNullOrUndefined(aStarData)

    const snapShotStep = cell.snapShotStep ?? Number.MAX_SAFE_INTEGER

    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    const history = aStarData ? aStarData.costUpdateHistory[key] ?? [] : []
    const updatedOnThisStep = history.some((h) => h.step - 1 === snapShotStep)
    // const updatedOnThisStep = history.some((h) => h.step === snapShotStep + 1)
    // const costUpdateOnThisStep = history.find((h) => h.step === snapShotStep + 1)
    const isLastStep = timeline.length - 1 === currentTimelineIndex
    const isCurrentStep = cell.step === currentTimelineIndex;

    const next = timeline[currentTimelineIndex + 1]
    const posUpNext = !isNullOrUndefined(next) && next.type === 'visited' ? next.node.pos : undefined

    const weightEmoji = useMemo(() => {
        const match = cellWeight.find((preset) => preset.weight === cell.cost)
        return match?.icon
    }, [cell.cost])
    const borderThickness = Math.min(3, Math.max(1, Math.log2(cell.cost + 1)));


    const bestFrontier = cell.state === 'frontier' && !isNullOrUndefined(posUpNext) && r === posUpNext[0] && c === posUpNext[1]
    return (
        <div
            key={key}
            style={{
                // transition: "all .3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                border: `${borderThickness}px solid ${costToColor(cell.cost)}`,
                boxShadow: isCurrentStep ? "0 0 15px 5px rgba(59, 130, 246, 0.6)" :
                    cell.state === "path" ? "0 0 8px rgba(16, 185, 129, 0.7)" :
                        "0 2px 4px rgba(0,0,0,0.1)"
            }}
            className={`
        size-9 2xs:size-10 xs:size-13 sm:size-14 md:size-16 lg:size-18 xl:size-20 2xl:size-22 3xl:size-24 
        rounded-lg flex flex-col items-center justify-center relative backdrop-blur-sm hover:scale-95
        ${cellBgColor[cell.state] ?? 'bg-sky-500'}
        ${bestFrontier ? 'z-10 2xs:translate-x-8 2xs:translate-y-4 2xs:scale-125 sm:translate-x-10 sm:translate-y-5 sm:scale-140 lg:translate-x-12 lg:translate-y-6 lg:scale-150' : ''}
        ${updatedOnThisStep ? 'relative after:absolute after:inset-0 after:rounded-full after:animate-ping after:bg-sky-400/50 after:pointer-events-none' : ''}
        ${isCurrentStep && !isLastStep && cell.state !== 'path' ? 'scale-105 sm:scale-110' : 'scale-100'} 
        ${cell.state === "path" && isCurrentStep && !isLastStep ? "z-10 scale-105 sm:scale-110 animate-bounce" : ""}
        ${cell.state === 'path' && isCurrentStep && isLastStep ? "scale-105 sm:scale-110 z-10" : ""}
        ${cell.state === 'ghost' ? "pointer-events-auto animate-[wiggle_1s_ease-in-out_infinite] z-10" : ""}
        `}
            onClick={() => {
                dispatch({
                    type: "UPDATE_CELL_STATUS",
                    payload: [r, c]
                })
            }}
            onMouseEnter={() => {
                if (isSamePos(hoveredCell, [r, c])) {
                    // console.log("SAME POS")
                    return
                }
                const isGhostable = cellData[r][c].state === 'visited' || cellData[r][c].state === 'ghost'
                if (!isGhostable) {
                    // console.log([r, c], "is ", cellData[r][c].state)
                    return
                }
                setHoveredCell([r, c])

            }}
            onMouseLeave={() => {
                // console.log([r, c], "mouse leave setting to null")
                setHoveredCell(null)
            }}
        >
            {isCurrentStep && isLastStep && (
                <div className="animate-[wiggle_1s_ease-in-out_infinite] absolute top-0 left-0 text-lg">🏁</div>
            )}

            {!hasAStarData && (
                < Popover open={openWeightPopover} onOpenChange={setOpenWeightPopover}>
                    < PopoverTrigger asChild>
                        <BasicCellInfo cell={cell} weightEmoji={weightEmoji}/>
                    </PopoverTrigger>

                    <PopoverContent className="w-72 p-5 ">
                        <Input
                            type="number"
                            min={0}
                            max={10000}
                            value={state.cellData[r][c].cost}
                            //hmm look into if we can add a enter press here to close it automatically
                            onChange={(e) => {
                                const num = Number(e.target.value)
                                dispatch({
                                    type: "SET_CELL_WEIGHT",
                                    payload: {
                                        pos: [r, c],
                                        newWeight: num >= 0 ? num : 0
                                    }
                                })
                            }}
                        />
                        <div className="mt-3 group">
                            <p className="text-sm text-slate-950 mb-2 font-medium">Quick Presets</p>
                            <div className="grid grid-cols-3 gap-1.5 overflow-y-auto">
                                {cellWeight.map(({name, weight}) => (
                                    <button
                                        key={name}
                                        onClick={() => {
                                            dispatch({
                                                type: "SET_CELL_WEIGHT",
                                                payload: {
                                                    pos: [r, c],
                                                    newWeight: weight
                                                }
                                            })
                                            setOpenWeightPopover(false)

                                        }}
                                        className="px-2 py-1.5 text-sm rounded-md border-2 border-transparent hover:border-black hover:bg-gray-100  flex flex-col items-center gap-0.5"
                                    >
                                        <span className="font-medium ">{name}</span>
                                        <span
                                            className={`text-gray-700 group-hover:text-gray-900 text-[14px]`}>
                                        {weight}
                                    </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>)}
            {hasAStarData && (
                < Popover>
                    < PopoverTrigger asChild>
                        <BasicCellInfo cell={cell} weightEmoji={weightEmoji}/>
                    </PopoverTrigger>


                    <PopoverContent className="w-48 p-5 ">
                        <div className="space-y-3">
                            <div className="font-semibold">Cell Details</div>

                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between gap-3">
                                    <span className="text-muted-foreground">Position:</span>
                                    <span>{cell.pos.join(',')}</span>
                                </div>

                                {cell.step && (<div className="flex justify-between gap-3">
                                    <span className="text-muted-foreground">Step:</span>
                                    <span>{cell.step + 1}</span>
                                </div>)}
                                {cell.snapShotStep && (<div className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">SnapshotStep:</span>
                                        <span>{cell.snapShotStep}</span>
                                    </div>
                                )}


                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cost:</span>
                                    <span>{cell.cost}</span>
                                </div>
                                {!isNullOrUndefined(cell.g) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">G-Score:</span>
                                        <span>{(cell.g).toFixed(2)}</span>
                                    </div>
                                )}
                                {!isNullOrUndefined(cell.h) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">H-Score:</span>
                                        <span>{(cell.h * state.gwWeights.hWeight).toFixed(2)}</span>
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
                                    <span className={'text-slate-900'}>
                                        {capitalize(cell.state)}
                                </span>
                                </div>
                            </div>

                            {!isNullOrUndefined(cell.costUpdateHistory) && cell.costUpdateHistory.length > 0 && (
                                <div className="border-t pt-2 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Updates:</span>
                                        <span
                                            className={`bg-gradient-to-l from-amber-700 via-yellow-700 to-orange-700
                                         text-white text-xs px-2 py-1 rounded`}>
                                        {cell.costUpdateHistory.length}
                                    </span>
                                    </div>
                                    {cell.costUpdateHistory.length > 1 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Delta:</span>
                                            <span
                                                className={`bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 
                                            text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm`}>
                                        {(cell.costUpdateHistory[0].gCost - cell.costUpdateHistory[cell.costUpdateHistory.length - 1].gCost).toFixed(2)}</span>
                                        </div>

                                    )}
                                    {cell.costUpdateHistory.length > 2 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Avg:</span>
                                            <span
                                                className={`bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 
                                            text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm`}>{avgDiff(cell.costUpdateHistory.map((foo) => foo.gCost)).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>)}

            {(cell.state === "path" || isCurrentStep) && (
                <div
                    className="absolute inset-0 rounded-md bg-white opacity-0 group-hover:opacity-20  pointer-events-none"></div>
            )
            }


            {
                cell.f !== undefined && (
                    <div
                        className="hidden md:block absolute top-0 right-0 text-xs bg-slate-800 text-white px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg font-bold shadow-lg">
                        f:{cell.f.toFixed(1)}
                    </div>
                )
            }
        </div>
    )
}
//[12,8,4]
//[]
function avgDiff(nums: number[]): number {
    if (isNullOrUndefined(nums)) {
        throw new Error("lets be civilized please")
    }
    if (nums.length === 1) {
        throw new Error('need at least two numbers')
    }
    let totalDiff = 0
    for (let i = 1; i < nums.length; i++) {
        const curr = nums[i - 1]
        const next = nums[i]
        totalDiff += next - curr
    }
    return totalDiff / (nums.length - 1)
}


//not gonna use this method, but wanted a quick and dirty way to just see the weights without inspecting
export function costToColor(cost: number): string {
    const thresholds = [
        {max: 0, color: "#1e293b"},   // Wall — slate-800
        {max: 1, color: "#14b8a6"},   // Road — teal-500
        {max: 2, color: "#65a30d"},   // Plains — lime-600
        {max: 4, color: "#4d7c0f"},   // Forest — green-700
        {max: 7, color: "#ca8a04"},   // Hills — yellow-600
        {max: 12, color: "#854d0e"},  // Swamp — amber-800
        {max: 18, color: "#0ea5e9"},  // River — sky-500
        {max: 25, color: "#f59e0b"},  // Desert — amber-500
        {max: 35, color: "#1e40af"},  // Deep Sea — blue-800
        {max: 50, color: "#e11d48"},  // Lava — rose-600
        {max: 80, color: "#7dd3fc"},  // Blizzard — blue-300
        {max: Infinity, color: "#6b21a8"} // Mountain+ — purple-800
    ];

    for (const {max, color} of thresholds) {
        if (cost <= max) return color;
    }

    return "#6b7280"; // Default: slate-500
}

