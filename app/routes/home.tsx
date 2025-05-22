import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import {useEffect, useId} from "react";
import {isNullOrUndefined} from "~/utils/helpers";
import {DEFAULT_PLAYBACK_SPEED_MS} from "~/state/constants";
import {GridProvider, useGridContext} from "~/state/context";
import Grid from "~/components/grid";
import ControlPanel from "~/components/control-panel";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}


export function Main() {
    const gridSize = 8
    const {state, dispatch} = useGridContext()
    const {currentTimelineIndex, aStarData, playbackSpeedFactor} = state
    const timeline = state.timeline === 'snapshot' ? state.snapshotTimeline : state.granularTimeline

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
                <Grid/>
                <ControlPanel/>
            </div>
        </div>
    );
}

export default function Home() {

    return (
        <div className={'flex flex-col'}>
            <GridProvider>
                <Main/>
            </GridProvider>
            {/*<GridProvider>*/}
            {/*    <Foo/>*/}
            {/*</GridProvider>*/}
        </div>
    )
}






