import type {Route} from "./+types/home";
import {GridProvider} from "~/state/context";
import Grid from "~/components/grid";
import ControlPanel from "~/components/control-panel/control-panel";
import {PlaybackControls} from "~/components/control-panel/playback-controls";
import {PlaybackSpeedSlider} from "~/components/control-panel/playback-speed-slider";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}


export function Main() {

    return (
        <div className={'max-w-10/12 mx-auto   p-2'}>
            <div className={'grid grid-cols-3 border-black border-8 rounded-lg'}>
                <div className={'col-span-2'}>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            📹 Playback Controls
                        </h4>
                        <PlaybackControls className={'w-full'}/>

                    </div>
                </div>
                <div className="flex sm:flex-col 2xl:flex-row p-4 col-span-full rounded-lg shadow-sm gap-2">
                    <Grid/>
                    <ControlPanel/>
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
            {/*    <Main/>*/}
            {/*</GridProvider>*/}
        </div>
    )
}






