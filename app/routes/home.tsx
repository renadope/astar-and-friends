import type {Route} from "./+types/home";
import {aStar} from "~/services/aStar";
import {manhattan} from "~/utils/heuristics";
import {useState} from "react";

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

    return (
        <div>
            {JSON.stringify(aStarResult.value,null,2)}
        </div>
    )
}



