import type {Route} from "./+types/home";
import {GridProvider} from "~/state/context";
import Grid from "~/components/grid";
import ControlPanel from "~/components/control-panel/control-panel";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}

export function Main() {


    return (
        <div className="w-full max-w-[90%] mx-auto 2xs:p-0.5 sm:p-2 md:pt-10 pb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex flex-col 3xl:flex-row gap-3 sm:gap-4 3xl:gap-6">
                    <div className="3xl:flex-shrink-0 3xl:w-auto min-w-0">
                        <Grid/>
                    </div>
                    <div className="3xl:flex-1 3xl:min-w-[360px]">
                        <ControlPanel/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <GridProvider>
            <Main/>
        </GridProvider>
    )
}






