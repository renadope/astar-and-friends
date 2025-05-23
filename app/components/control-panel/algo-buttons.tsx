import type {ComponentPropsWithoutRef} from "react";
import {useGridContext} from "~/state/context";
import {cn} from "~/lib/utils";
import {RefreshCcw} from "lucide-react";
import {gridSize} from "~/components/control-panel/control-panel";

export function AlgoButtons({className, ...props}: ComponentPropsWithoutRef<'div'>) {
    const {state, dispatch} = useGridContext()
    return (
        <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm p-3", className)} {...props}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    className="group px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm transform hover:scale-105 hover:-translate-y-0.5"
                    onClick={() => {
                        dispatch({type: "GENERATE_GRID", payload: gridSize})
                    }}
                >
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                             viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                                  clipRule="evenodd"/>
                        </svg>
                        <div
                            className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                    </div>
                    <span>Generate Grid</span>
                </button>

                <button
                    className={`group relative px-8 py-3 bg-gradient-to-r text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm overflow-hidden ${
                        state.configChanged
                            ? 'from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 animate-pulse shadow-rose-500/25 shadow-2xl transform scale-105'
                            : 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 hover:scale-105 hover:-translate-y-0.5'
                    } hover:shadow-xl`}
                    onClick={() => {
                        dispatch({type: "RUN_ASTAR"})
                    }}
                >

                    <div className="relative flex items-center gap-2">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 className={`w-5 h-5 transition-transform duration-300 ${state.configChanged ? 'animate-spin' : 'group-hover:scale-110'}`}
                                 viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                      clipRule="evenodd"/>
                            </svg>
                            {state.configChanged && (
                                <div className="absolute -inset-1 bg-white/30 rounded-full animate-ping"></div>
                            )}
                        </div>
                        <span className="relative">
                        Run Algorithm
                            {state.configChanged && (
                                <span
                                    className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white animate-bounce">
                                Updated!
                            </span>
                            )}
                    </span>
                    </div>
                </button>

                <button
                    className={`group px-6 py-3 bg-gradient-to-br
                         from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700
                         text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300
                          flex items-center justify-center gap-2 font-semibold text-sm transform 
                          hover:scale-105 hover:-translate-y-0.5`}
                    onClick={() => {
                        dispatch({type: "RESET_ASTAR_DATA"})
                    }}
                >
                    <RefreshCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500"/>
                    <span>Reset</span>
                </button>
            </div>

            {state.configChanged && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                    <div
                        className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-amber-700 font-medium">Configuration updated - ready to run!</span>
                    </div>
                </div>
            )}

            {/* Stuff to add later on */}
            {/*<div className="mt-6 flex flex-wrap gap-2 justify-center">*/}
            {/*    <button*/}
            {/*        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-200">*/}
            {/*        Quick Start*/}
            {/*    </button>*/}
            {/*    <button*/}
            {/*        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-200">*/}
            {/*        Load Example*/}
            {/*    </button>*/}
            {/*    <button*/}
            {/*        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-200">*/}
            {/*        Export Results*/}
            {/*    </button>*/}
            {/*</div>*/}
        </div>

    )
}