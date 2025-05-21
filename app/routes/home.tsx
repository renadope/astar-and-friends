import type {Route} from "./+types/home";
import {aStar, getAlgorithmName} from "~/services/aStar";
import {type ChangeEvent, useEffect, useReducer, useState} from "react";
import {stringifyPos} from "~/utils/grid-helpers";
import {capitalize, isNullOrUndefined} from "~/utils/helpers";
import {type CostAndWeightKind, predefinedWeightFuncs} from "~/utils/grid-weights";
import {type HeuristicName, heuristics} from "~/utils/heuristics";
import {ToggleGroup, ToggleGroupItem} from "~/components/ui/toggle-group";
import {Check, ChevronsUpDown, FastForwardIcon, Map as MapIcon, RefreshCcw, RewindIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "~/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "~/components/ui/command";
import {Button} from "~/components/ui/button";
import {cn} from "~/lib/utils";
import {type FlattenedStep, isPathStep} from "~/utils/timeline-generation";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "~/components/ui/select";
import {PauseIcon, PlayIcon} from "~/components/icons/icons";
import type {AppState, TimelineOptions} from "~/state/types";
import {reducer} from "~/state/reducer";
import {
    DEFAULT_PLAYBACK_SPEED_MS,
    LARGEST_PLAYBACK_FACTOR,
    PLAYBACK_INCREMENT,
    SMALLEST_PLAYBACK_FACTOR
} from "~/state/constants";
import type {CellToggle} from "~/cell-data/types";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}


//rem
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
const heuristicInfo: { label: string; value: HeuristicName }[] = [
    {label: "Manhattan: (|dx| + |dy|)", value: "manhattan"},
    {label: "Euclidean: (√(dx² + dy²))", value: "euclidean"},
    {label: "Octile: D * (|dx| + |dy| + (√2 - 2 * D) × min(dx, dy))", value: "octile"},
    {label: "Chebyshev: (max(|dx|, |dy|))", value: "chebyshev"}
];
type WeightData = {
    label: string;
    value: CostAndWeightKind;
    description: string;
    emoji: string;
    tag?: "Recommended" | "Simple" | "Challenging" | "Experimental";
}
const weightPresets: WeightData[] = [
    {
        label: "Uniform",
        value: "uniform",
        description: "All cells have the same traversal cost. Ideal for basic testing.",
        emoji: "📏",
        tag: "Simple"
    },
    {
        label: "Fake Noise",
        value: "noise",
        description: "Adds pseudo-random variation in weights to simulate natural terrain.",
        emoji: "🌫️",
        tag: "Experimental"
    },
    {
        label: "Center Ridge",
        value: "centerRidge",
        description: "Creates a high-cost ridge down the center of the simple-grid.",
        emoji: "⛰️",
        tag: "Challenging"
    },
    {
        label: "Circular Basin",
        value: "circularBasin",
        description: "Lower weights near the center and higher costs as you move outward.",
        emoji: "🌀",
        tag: "Recommended"
    },
    {
        label: "Wall Corridor Bias",
        value: "wall",
        description: "Biases cost around walls and corridors to simulate bottlenecks.",
        emoji: "🚧",
        tag: "Challenging"
    },
    {
        label: "Diagonal Gradient",
        value: "diagonal",
        description: "Increases cost gradually from top-left to bottom-right diagonally.",
        emoji: "📐",
        tag: "Simple"
    },
    {
        label: "Random Terrain",
        value: "random",
        description: "Completely randomized weights for each cell. Unpredictable paths.",
        emoji: "🎲",
        tag: "Experimental"
    },
    {
        label: "Biome Weights",
        value: "biome",
        description: "Mimics different biome zones with clustered terrain types.",
        emoji: "🌍",
        tag: "Recommended"
    },
    {
        label: "High Cost",
        value: "highCost",
        description: "Generates a simple-grid with higher costs having a greater chace.",
        emoji: "💰",
        tag: "Recommended"
    }
];


const initialState: AppState = {
    weightGrid: [],
    cellData: [],
    snapshotTimeline: [],
    granularTimeline: [],
    currentTimelineIndex: 0,
    gridSize: 10,
    aStarData: undefined,
    gwWeights: {gWeight: 1, hWeight: 1},
    diagonalSettings: {allowed: true, cornerCutting: "lax", diagonalMultiplier: Math.SQRT2},
    cellSelectionState: 'inactive',
    startPos: undefined,
    goalPos: undefined,
    heuristic: {name: "manhattan", func: heuristics['manhattan']},
    weightPreset: {
        func: predefinedWeightFuncs['uniform'],
        name: 'uniform'
    },
    timeline: 'snapshot',
    isPlaying: false,
    playbackSpeedFactor: 1,
    configChanged: false,
}


export default function Home() {
    const gridSize = 8
    const [state, dispatch] = useReducer(reducer, initialState)
    const {cellData, currentTimelineIndex, aStarData, diagonalSettings, playbackSpeedFactor} = state
    const [heuristicPopoverOpen, setHeuristicPopoverOpen] = useState(false)
    const [weightPresetOpen, setWeightPresetOpen] = useState(false)
    const algorithmName = getAlgorithmName(state.gwWeights.gWeight, state.gwWeights.hWeight)
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline
    const hasCellData = !isNullOrUndefined(cellData) && cellData.length > 0
    const hasNoAStarData = isNullOrUndefined(aStarData)

    useEffect(() => {
        dispatch({
            type: 'GENERATE_GRID', payload: gridSize
        })
    }, [])

    useEffect(() => {
        if (isNullOrUndefined(aStarData) || state.weightGrid.length === 0 || state.cellSelectionState !== 'inactive') {
            return
        }

        if (!state.isPlaying) {
            return
        }
        const delay = Math.max(DEFAULT_PLAYBACK_SPEED_MS / playbackSpeedFactor, 50);
        const interval = setTimeout(() => {
            dispatch({
                type: 'INCREMENT_INDEX'
            })
        }, delay)
        return () => clearTimeout(interval)

    }, [aStarData, currentTimelineIndex, timeline.length, state.cellSelectionState, state.isPlaying, playbackSpeedFactor])

    return (
        <div className={'max-w-10/12 mx-auto   p-2'}>
            <div className={'flex p-4 rounded-lg shadow-sm  gap-2 '}>
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
                                                    cost:{cell.costUpdateHistory[cell.costUpdateHistory.length-1].gCost.toFixed(2)}
                                                </p>
                                            )}{cell.costUpdateHistory && cell.costUpdateHistory.length > 1 && (
                                                <p className={`text-xs ${textColors[cell.state] || "text-slate-500"} opacity-70 group-hover:opacity-100`}>
                                                    dlta:{Math.abs(cell.costUpdateHistory[cell.costUpdateHistory.length-1].gCost-cell.costUpdateHistory[0].gCost).toFixed(2)}
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
                                                    all:{cell.costUpdateHistory.map((foo)=>foo.gCost.toFixed(1)).join(',')}
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
                <div
                    className=" flex flex-col gap-4 p-4  backdrop-blur-sm rounded-xl shadow-sm border-fuchsia-500 border-2">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap gap-2">
                                <div className="flex gap-1.5">
                                    <button
                                        disabled={hasNoAStarData}
                                        onClick={() => dispatch({
                                            type: "SET_PLAYING_STATUS",
                                            payload: !state.isPlaying
                                        })}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
                                    >
                                        {state.isPlaying ?
                                            <><PauseIcon/> <span>Pause</span></> :
                                            <><PlayIcon/> <span>Play</span></>
                                        }
                                    </button>

                                    <button
                                        disabled={hasNoAStarData}
                                        onClick={() => dispatch({type: "DECREMENT_INDEX"})}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M15 19l-7-7 7-7"/>
                                        </svg>
                                        <span>Back</span>
                                    </button>

                                    <button
                                        disabled={hasNoAStarData}
                                        onClick={() => dispatch({type: "INCREMENT_INDEX"})}
                                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <span>Next</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex gap-1.5">
                                    <button
                                        disabled={hasNoAStarData}
                                        onClick={() => dispatch({type: "JUMP_TO_START"})}
                                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <RewindIcon className="h-4 w-4"/>
                                        <span>Start</span>
                                    </button>

                                    <button
                                        disabled={hasNoAStarData}
                                        onClick={() => dispatch({type: "JUMP_TO_PATH_START"})}
                                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <MapIcon className="h-4 w-4"/>
                                        <span>Path Start</span>
                                    </button>

                                    <button
                                        disabled={hasNoAStarData}
                                        onClick={() => dispatch({type: "JUMP_TO_END"})}
                                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <FastForwardIcon className="h-4 w-4"/>
                                        <span>End</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 items-center w-1/2">
                                <div className="grow">
                                    <div className="flex justify-between mb-1">
                                        <label htmlFor="playbackSpeed" className="text-xs font-medium text-gray-500">
                                            Playback
                                            Speed: {Math.floor(DEFAULT_PLAYBACK_SPEED_MS / playbackSpeedFactor)}ms
                                        </label>
                                        <span
                                            className="text-xs font-medium text-blue-600">{playbackSpeedFactor}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        id="playbackSpeed"
                                        min={SMALLEST_PLAYBACK_FACTOR}
                                        max={LARGEST_PLAYBACK_FACTOR}
                                        step={PLAYBACK_INCREMENT}
                                        value={playbackSpeedFactor}
                                        onChange={(e) => {
                                            dispatch({
                                                type: 'SET_PLAYBACK_SPEED_FACTOR',
                                                payload: {factor: Number(e.target.value)}
                                            })
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-sky-500"></div>
                                <div className="text-sm font-medium text-gray-700">
                                    {currentTimelineIndex >= 0 ? (
                                        <>
                                            <span>Step {currentTimelineIndex + 1} of {timeline.length}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">Waiting to start...</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <input
                            id="timeline"
                            type="range"
                            min={-1}
                            max={timeline.length - 1}
                            disabled={timeline.length === 0}
                            value={currentTimelineIndex}
                            onChange={(e) =>
                                dispatch({
                                    type: 'SET_INDEX',
                                    payload: parseInt(e.target.value, 10),
                                })
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg   cursor-pointer accent-blue-500 "
                        />

                        <div className="w-full flex justify-between mt-1 px-1">
                            <span className="text-xs text-gray-500">Start</span>
                            <span className="text-xs text-gray-500">End</span>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center pt-2">
                        <button
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                            onClick={() => {
                                dispatch({type: "GENERATE_GRID", payload: gridSize})
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                 fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                                      clipRule="evenodd"/>
                            </svg>
                            Generate Grid
                        </button>

                        <button
                            className={`px-4 py-2  ${state.configChanged ? 'scale-105 rotate-2 animate-pulse bg-rose-600 hover:bg-rose-700' : 'scale-100 bg-rose-500 hover:bg-rose-600'}
                          text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium`}
                            onClick={() => {
                                dispatch({type: "RUN_ASTAR"})
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                 fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                      clipRule="evenodd"/>
                            </svg>
                            Run {algorithmName}
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                            onClick={() => {
                                dispatch({type: "RESET_ASTAR_DATA"})
                            }}
                        >
                            <RefreshCcw/>
                            Reset
                        </button>
                    </div>
                    <div className={'simple-grid simple-grid-cols-2 gap-2'}>
                        <div
                            className="flex flex-col gap-4 max-w-md  mt-4 p-4 bg-white hover:bg-slate-50 rounded-lg shadow-md">
                            <h3 className={'text-sm font-mono'}>Control A* Behavior with Weights</h3>
                            <div className="w-full ">
                                <label htmlFor="gWeight" className="block text-sm font-semibold text-blue-600 mb-1">
                                    G-Weight (Cost So Far): <span
                                    className="font-mono text-black">{state.gwWeights.gWeight}</span>
                                </label>
                                <input
                                    id={`gWeight`}
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={0.5}
                                    value={state.gwWeights.gWeight}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        dispatch({
                                            type: 'SET_G_WEIGHT',
                                            payload: Number(e.target.value),
                                        })
                                    }
                                    }
                                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                            <div className="w-full pt-2">
                                <label htmlFor="hWeight" className="block text-sm font-semibold text-pink-600 mb-1">
                                    H-Weight (Heuristic): <span
                                    className="font-mono text-black">{state.gwWeights.hWeight}</span>
                                </label>
                                <input
                                    id={`hWeight`}
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={0.5}
                                    value={state.gwWeights.hWeight}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        dispatch({
                                            type: 'SET_H_WEIGHT',
                                            payload: Number(e.target.value),
                                        })
                                    }

                                    }
                                    className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                                />
                            </div>
                        </div>
                        <div
                            className="flex flex-col gap-4 max-w-md  mt-4 p-4 bg-white hover:bg-slate-50 rounded-lg shadow-md">
                            <h3 className={'text-sm font-mono'}>Diagonal Contorls</h3>
                            <fieldset className="border p-3 rounded-md">
                                <legend className="text-sm font-semibold text-gray-700">Diagonal Movement</legend>

                                <label className="flex items-center gap-2 mt-2">
                                    <input type="checkbox" checked={diagonalSettings.allowed} onChange={() => {
                                        dispatch({
                                            type: 'TOGGLE_DIAGONAL',
                                            payload: !diagonalSettings.allowed
                                        })

                                    }}/>
                                    Allow Diagonal
                                </label>

                                {diagonalSettings.allowed && (
                                    <div className="ml-4 mt-2 space-y-2">
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="diagonalMode"
                                                    value="strict"
                                                    checked={diagonalSettings.cornerCutting === 'strict'}
                                                    onChange={() => {
                                                        dispatch({
                                                            type: "TOGGLE_CORNER_CUTTING",
                                                            payload: "strict"
                                                        })

                                                    }}
                                                />
                                                Strict
                                            </label>

                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="diagonalMode"
                                                    value="lax"
                                                    checked={diagonalSettings.cornerCutting === 'lax'}
                                                    onChange={() => {
                                                        dispatch({
                                                            type: "TOGGLE_CORNER_CUTTING",
                                                            payload: "lax"
                                                        })

                                                    }}
                                                />
                                                Lax
                                            </label>
                                        </div>

                                        <div>
                                            <label className="text-sm text-gray-600 font-medium">
                                                Diagonal Cost
                                                Multiplier: {diagonalSettings.diagonalMultiplier.toFixed(4)}
                                            </label>
                                            <input
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
                                    </div>
                                )}
                            </fieldset>

                        </div>
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

                        <div className={'space-y-2 flex flex-col'}>
                            <label className="text-sm font-medium text-muted-foreground">Select Heuristic
                                Function</label>
                            <Popover open={heuristicPopoverOpen} onOpenChange={setHeuristicPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={heuristicPopoverOpen}
                                        className="w-2/3 justify-between"
                                    >
                                        {capitalize(heuristicInfo.find(
                                            (heuristic) => heuristic.value === state.heuristic.name)?.value ?? "no selection")}
                                        <ChevronsUpDown className="opacity-50"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-2/3">
                                    <Command>
                                        <CommandInput placeholder="Search heuristic..."/>
                                        <CommandList>
                                            <CommandEmpty>No heuristic found.</CommandEmpty>
                                            <CommandGroup>
                                                {heuristicInfo.map((heuristicInfo) => (
                                                    <CommandItem
                                                        key={heuristicInfo.value}
                                                        value={heuristicInfo.value}
                                                        onSelect={(currentValue: string) => {
                                                            dispatch({
                                                                type: "SET_HEURISTIC_FUNC",
                                                                payload: currentValue as HeuristicName
                                                            })
                                                            setHeuristicPopoverOpen(false)
                                                        }}
                                                    >
                                                        {heuristicInfo.label}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                state.heuristic.name === heuristicInfo.value ? " opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className={'space-y-2 flex flex-col'}>
                            <label className="text-sm font-medium text-muted-foreground">Select Weight Preset</label>
                            <Popover open={weightPresetOpen} onOpenChange={setWeightPresetOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={weightPresetOpen}
                                        className="w-2/3 justify-between"
                                    >
                                        {capitalize(weightPresets.find(
                                            (weightPreset) => weightPreset.value === state.weightPreset.name)?.label ?? "no selection")}
                                        <ChevronsUpDown className="opacity-50"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-f">
                                    <Command>
                                        <CommandInput placeholder="Search Preset..."/>
                                        <CommandList>
                                            <CommandEmpty>No Preset found.</CommandEmpty>
                                            <CommandGroup>
                                                {weightPresets.map((weightPresetInfo) => (
                                                    <CommandItem
                                                        key={weightPresetInfo.value}
                                                        value={weightPresetInfo.value}
                                                        onSelect={(currentValue: string) => {
                                                            dispatch({
                                                                type: "SET_WEIGHT_PRESET",
                                                                payload: currentValue as CostAndWeightKind
                                                            })
                                                            setWeightPresetOpen(false)
                                                        }}
                                                    >

                                                        {weightPresetInfo.emoji} {weightPresetInfo.label}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                state.weightPreset.name === weightPresetInfo.value ? " opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
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


                    </div>

                </div>
            </div>
        </div>
    );
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




