import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import {manhattan} from "~/utils/heuristics";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "New React Router App"},
        {name: "description", content: "Welcome to React Router!"},
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
    const {value: {costs}} = aStarResult

    return (
        <div className={'flex flex-col gap-2 p-10'}>
            {Array.from({length: size}, (_, r) => (
                <div key={r} className={'flex gap-0.5'}>
                    {Array.from({length: size}, (_, c) => (
                        <div key={`${r}_${c}`}
                             className="size-24 bg-sky-100  border border-sky-300 rounded flex items-center justify-center shadow-sm hover:bg-sky-200">
                            <p className="text-gray-800 font-medium">{costs[r][c].toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}



