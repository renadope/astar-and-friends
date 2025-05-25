import type {Weights} from "~/types/pathfinding";

export type CellData = {
    pos: [number, number]
    cost: number,
    state: "empty" | "start" | "goal" | "wall" | "visited" | "frontier" | "path" | "ghost"
    g?: number,
    h?: number,
    f?: number,
    step?: number,
    snapShotStep?: number
    costUpdateHistory?: { step: number, gCost: number }[]
}

export type CellToggle = 'set_goal' | 'toggle_wall' | 'set_start' | "inactive"