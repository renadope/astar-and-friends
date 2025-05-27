import {useGridContext} from "~/state/context";
import {stringifyPos} from "~/utils/grid-helpers";
import {isNullOrUndefined} from "~/utils/helpers";
import type {Pos} from "~/types/pathfinding";
import type {CellData} from "~/cell-data/types";
import {cellWeight} from "~/presets/cell-weight";
import {type ComponentPropsWithoutRef, useMemo, useState} from "react";
import {cn} from "~/lib/utils";

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
    setClickedCell: (foo: Pos|undefined) => void
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

export default function GridCell({pos, setClickedCell}: CellProps) {
    const {state, dispatch} = useGridContext()
    const {aStarData, currentTimelineIndex, cellData, isPlaying, allReconstructedPathsCache, cellSelectionState} = state
    const [r, c] = pos
    const cell = cellData[r][c]
    const key = stringifyPos(...cell.pos)

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

    const hasVisitedReconstructedPath = !isNullOrUndefined(allReconstructedPathsCache) ? allReconstructedPathsCache.has(stringifyPos(r, c)) : false
    const canGhost = !isPlaying && currentTimelineIndex >= timeline.length - 1 && hasVisitedReconstructedPath

    return (
        <div
            key={key}
            style={{
                transition: "all .3s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
                if (cellSelectionState !== 'inactive') {
                    dispatch({
                        type: "UPDATE_CELL_STATUS",
                        payload: [r, c]
                    })
                    setClickedCell(undefined)
                    return
                }
                setClickedCell([r, c])
            }}
            onMouseEnter={() => {
                if (canGhost) {
                    dispatch({
                        type: "SET_GOAL_GHOST_PATH",
                        payload: [r, c]
                    })
                }
            }}
            onMouseLeave={() => {
                if (canGhost) {
                    dispatch({
                        type: "JUMP_TO_END"
                    })

                }
            }}
        >
            <BasicCellInfo cell={cell} weightEmoji={weightEmoji}/>

            {isCurrentStep && isLastStep && (
                <div className="animate-[wiggle_1s_ease-in-out_infinite] absolute top-0 left-0 text-lg">🏁</div>
            )}


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

