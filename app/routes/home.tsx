import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
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






