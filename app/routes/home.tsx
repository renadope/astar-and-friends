import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import {GridProvider, useGridContext} from "~/state/context";
import Grid from "~/components/grid";
import ControlPanel from "~/components/control-panel/control-panel";
import {PlaybackControls} from "~/components/control-panel/playback-controls";
import {isNullOrUndefined} from "~/utils/helpers";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}


export function Main() {
    const {state} = useGridContext()

    const hasAStarData = !isNullOrUndefined(state.aStarData)
    return (
        <div className={'max-w-10/12 mx-auto   p-2'}>
            <div className={'grid grid-cols-2'}>
                <div className={'flex p-4 col-span-full rounded-lg shadow-sm  gap-2 '}>
                    <Grid/>
                    <ControlPanel/>
                </div>
                <div className={'place-content-end'}>
                    {hasAStarData && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                📹 Playback Controls
                            </h4>
                            <PlaybackControls className={'w-2/3'}/>
                        </div>
                    )}
                </div>
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






