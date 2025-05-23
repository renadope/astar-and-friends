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
        <div className="w-full max-w-[90%] mx-auto p-2">
            <div className="flex flex-col gap-4">

                <div className="w-full min-w-0">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col xs:flex-row xs:justify-start sm:justify-between xs:items-start gap-2 xs:gap-3 mb-3 sm:mb-4">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                📹 Playback Controls
                            </h4>
                            <div className="xs:flex-shrink-0">
                                <PlaybackSpeedSlider />
                            </div>
                        </div>
                        <div className="w-full min-w-0 overflow-hidden">
                            <PlaybackControls className="w-full" />
                        </div>
                    </div>
                </div>

                <div className="w-full min-w-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
                            <div className="lg:flex-shrink-0 lg:w-auto min-w-0">
                                <Grid />
                            </div>

                            <div className="lg:flex-1 lg:min-w-[320px]">
                                <ControlPanel />
                            </div>

                        </div>
                    </div>
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






