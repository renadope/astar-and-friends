import {createContext, type Dispatch, type ReactNode, useContext, useMemo, useReducer} from "react";
import type {Action, AppState} from "~/state/types";
import {initialState, reducer} from "~/state/reducer";
import {isNullOrUndefined} from "~/utils/helpers";

type GridContextType = {
    state: AppState,
    dispatch: Dispatch<Action>
}

const GridContext = createContext<GridContextType | null>(null)

export function GridProvider({children}: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const contextValue = useMemo(() => {
        return {state, dispatch}
    }, [state])
    return (
        <GridContext.Provider value={contextValue}>
            {children}
        </GridContext.Provider>
    )

}

export function useGridContext() {
    const ctx = useContext(GridContext)
    if (isNullOrUndefined(ctx)) {
        throw new Error('useGridContext must be used within a GridProvider');
    }
    return ctx
}
