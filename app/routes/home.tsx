import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import {manhattan} from "~/utils/heuristics";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "aStar"},
        {name: "description", content: "aStar Demo!"},
    ];
}

export default function Home() {
    const grid = [
        [12, 9001, 50],
        [9002, 28, 11000],
        [45, 800, 11212],
    ]
    const size = 3
    const aStarResult = aStar(grid, [0, 0], [grid.length - 1, grid[0].length - 1], manhattan, {
        allowed: true,
        cornerCutting: 'lax'
    })

    if (!aStarResult.success) {
        return (
            <div className={'bg-red-500'}>
                <p className={'text-7xl'}>Sad</p>
            </div>
        )
    }
    const {value: {costs, costUpdateHistory}} = aStarResult

    return (
        <div className={'flex gap-10'}>
            <SimpleGrid grid={grid}/>
            <SimpleGrid grid={costs}/>
        </div>
    )
}

type SimpleGridProps = {
    grid: number[][]
}

function SimpleGrid({grid}: SimpleGridProps) {
    return (
        <div className={'flex flex-col gap-2'}>
            {grid.map((row, r) => (
                    <div key={r} className={'flex gap-x-0.5'}>
                        {row.map((_, c) => {
                            const key = `${r},${c}`
                            return (
                                <div key={key}
                                     style={{
                                         height: "8rem",
                                         width: "8rem",
                                         backgroundColor: "#dff2fe"
                                     }}
                                     className={` rounded flex items-center justify-center shadow-sm border border-sky-300 `}>
                                    <p className="text-gray-800 font-medium">
                                        {grid[r][c].toFixed(2)}</p>
                                </div>
                            )
                        })}
                    </div>
                )
            )}
        </div>
    )

}




