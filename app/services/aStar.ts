import type {AStarData, AStarNode, CostHistory, DiagonalConfig, PathData, Pos, Weights} from "~/types/pathfinding";
import {checkPosEquality, isValidGridIndex, isValidNode, isNodePassable, stringifyPos} from "~/utils/grid-helpers";
import {isNullOrUndefined, ResultErr, ResultOk} from "~/utils/helpers";
import type {Result} from "~/types/helpers";
import {makeNode} from "~/queue/helpers";
import {PriorityQueue} from "~/queue/priority-queue";


export const fourDirection = [[-1, 0], [1, 0], [0, -1], [0, 1]];
export const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

export function aStar(
    grid: number[][],
    start: Pos,
    goal: Pos,
    heuristic: (a: Pos, b: Pos) => number,
    allowDiagonal: DiagonalConfig,
    weights: Weights = { gWeight: 1, hWeight: 1, name: "AStar" },
): Result<AStarData> {
    function heuristicFromNodeToGoal(node: Pos) {
        return heuristic(node, goal);
    }

    if (weights.hWeight === 0 && weights.gWeight === 0) {
        return ResultErr(new Error("Invalid weight combo, both cannot be zero"));
    }
    if (!isValidNode(grid, start[0], start[1])) {
        return ResultErr(new Error("Invalid Start"));
    }
    if (!isValidNode(grid, goal[0], goal[1])) {
        return ResultErr(new Error("Invalid Goal"));
    }
    const startAndGoalSame = checkPosEquality(start, goal);
    const [startR, startC] = start;
    let goalFound = false;
    const visitedOrder: AStarNode[] = [];
    const frontier: AStarNode[][] = [];
    const prev = new Map<string, string>();
    const updatesPerStep = new Map<number, number>();
    const costUpdateHistory = new Map<string, CostHistory[]>();
    const costs: typeof grid = grid.map((row) => row.map(() => Infinity));
    const startGCost = grid[startR][startC];
    const startHCost = heuristicFromNodeToGoal(start);
    const startFCost = calculateFCost(weights, startGCost, startHCost);

    costs[startR][startC] = startGCost;

    const startNode: AStarNode = {
        pos: [startR, startC],
        gCost: startGCost,
        hCost: startHCost,
        fCost: startFCost,
    };

    if (startAndGoalSame) {
        return ResultOk({
            goalFound: true,
            path: [{
                pos: [...start],
                step: 0,
                edgeCost: grid[startR][startC],
                gCost: startFCost,
                hCost: startHCost,
                fCost: startFCost,
            }],
            costs: costs,
            visitedOrder: [startNode],
            costUpdateHistory: {},
            updatesPerStep: {},
            frontier: [],
            totalCost: costs[startR][startC],
            steps: 0,
            fallBack: null,
        });
    }

    const node = makeNode(startNode, startFCost, stringifyPos(startR, startC));

    const openSet = new PriorityQueue<AStarNode>((a, b) =>
        a.priority - b.priority
    );
    openSet.enqueue(node);

    const deltas = allowDiagonal.allowed
        ? [...fourDirection, ...diagonals]
        : [...fourDirection];

    let step = 0;
    while (!openSet.isEmpty()) {
        const currSet = openSet.toArray();
        frontier.push(currSet.map((st) => st.value));
        const minNode = openSet.dequeue();

        if (isNullOrUndefined(minNode)) {
            throw new Error(
                "should not happen, as we are only looping if there is content in the queue",
            );
        }

        step++;
        visitedOrder.push(minNode.value);

        const [currRow, currCol] = minNode.value.pos;
        if (currRow === goal[0] && currCol === goal[1]) {
            goalFound = true;
            break;
        }

        const currNodeCost = minNode.value.gCost;
        for (const delta of deltas) {
            const rowDelta = delta[0];
            const colDelta = delta[1];

            const isDiagonal = Math.abs(rowDelta) === 1 &&
                Math.abs(colDelta) === 1;

            if (isDiagonal) {
                const sideACoordinates = [currRow + rowDelta, currCol];
                const sideBCoordinates = [currRow, currCol + colDelta];

                const sideA = isValidGridIndex(grid, currRow + rowDelta, currCol)
                    ? grid[sideACoordinates[0]][sideACoordinates[1]]
                    : undefined;

                const sideB = isValidGridIndex(grid, currRow, currCol + colDelta)
                    ? grid[sideBCoordinates[0]][sideBCoordinates[1]]
                    : undefined;

                if (isNullOrUndefined(sideA) && isNullOrUndefined(sideB)) {
                    continue;
                }

                const sideAIsWall = !(isNullOrUndefined(sideA)) &&
                    !isNodePassable(sideA);
                const sideBIsWall = !(isNullOrUndefined(sideB)) &&
                    !isNodePassable(sideB);

                const cantGoDiagonal = allowDiagonal.cornerCutting === "lax"
                    ? sideAIsWall && sideBIsWall
                    : sideAIsWall || sideBIsWall;

                if (cantGoDiagonal) {
                    continue;
                }
            }
            const moveMultiplier = isDiagonal ? Math.SQRT2 : 1;

            const neighborRow = currRow + rowDelta;
            const neighborCol = currCol + colDelta;

            if (isValidNode(grid, neighborRow, neighborCol)) {
                const neighborID = stringifyPos(neighborRow, neighborCol);
                const neighborDist = grid[neighborRow][neighborCol] * moveMultiplier;
                const neighborCost = costs[neighborRow][neighborCol];
                const neighborG = currNodeCost + neighborDist;
                if (neighborG < neighborCost) {
                    costs[neighborRow][neighborCol] = neighborG;
                    const history = costUpdateHistory.get(neighborID) ?? [];
                    history.push({ step: step, gCost: neighborG });
                    costUpdateHistory.set(
                        neighborID,
                        history,
                    );
                    updatesPerStep.set(step, (updatesPerStep.get(step) ?? 0) + 1);
                    prev.set(
                        neighborID,
                        stringifyPos(currRow, currCol),
                    );
                    const h = heuristicFromNodeToGoal([neighborRow, neighborCol]);

                    const fCost = calculateFCost(weights, neighborG, h);
                    const updatedNode: AStarNode = {
                        pos: [neighborRow, neighborCol],
                        hCost: h,
                        gCost: neighborG,
                        fCost,
                    };
                    const node = makeNode(updatedNode, fCost, neighborID);
                    if (openSet.contains(neighborID)) {
                        openSet.updateNode(node);
                    } else {
                        openSet.enqueue(node);
                    }
                }
            }
        }
    }

    if (!goalFound) {
        let minH = Infinity;
        let closest: Pos | undefined = undefined;
        if (weights.hWeight > 0) {
            for (let i = 0; i < visitedOrder.length; i++) {
                const h = heuristicFromNodeToGoal(visitedOrder[i].pos) *
                    weights.hWeight;
                if (h < minH) {
                    minH = h;
                    closest = [...visitedOrder[i].pos];
                }
            }
            if (closest) {
                goal = [...closest];
            }
        } else {
            if (visitedOrder.length > 0) {
                goal = [...visitedOrder[visitedOrder.length - 1].pos];
            }
        }
    }

    console.log("");
    const allPathData = reconstructPath(
        grid,
        costs,
        prev,
        heuristicFromNodeToGoal,
        weights,
        goal,
    );
    const data: AStarData = {
        goalFound: goalFound,
        path: allPathData,
        visitedOrder: visitedOrder,
        frontier: frontier,
        costs: costs,
        costUpdateHistory: Object.fromEntries(costUpdateHistory),
        updatesPerStep: Object.fromEntries(updatesPerStep),
        //the goal becomes the fallback if not found otherwise if it's found just return null as there is no fallback
        fallBack: !goalFound ? goal : null,
        steps: allPathData.length - 1,
        totalCost: allPathData[allPathData.length - 1].gCost,
    };
    // console.log(JSON.stringify(data));
    return ResultOk<AStarData>(data);
}



export function reconstructPath(
    grid: number[][],
    costs: number[][],
    prev: Map<string, string>,
    heuristicFromNodeToGoal: (node: Pos) => number,
    weights: Weights,
    goal: Pos,
): PathData[] {
    let current: string | undefined = stringifyPos(goal[0], goal[1]);
    const path: string[] = [];
    while (!isNullOrUndefined(current)) {
        path.push(current);
        current = prev.get(current);
    }
    const actualPath = path.reverse().map((coords) => {
        const [r, c] = coords.split(",").map((val) => Number(val));
        return [r, c];
    });
    const allPathData: PathData[] = [];
    let step: number = 0;
    for (let i = 0; i < actualPath.length; i++) {
        const row = actualPath[i][0];
        const col = actualPath[i][1];
        let from: Pos | undefined = undefined;
        if (i > 0) {
            const [r, c] = actualPath[i - 1];
            from = [r, c];
        }
        const h = heuristicFromNodeToGoal([row, col]);
        const g = costs[row][col];
        const f = calculateFCost(weights, g, h);
        const pathData: PathData = {
            from: from,
            pos: [row, col],
            step: step++,
            edgeCost: grid[row][col],
            gCost: g,
            hCost: h,
            fCost: f,
        };
        allPathData.push(pathData);
    }
    return allPathData;
}


function calculateFCost(
    weights: Weights,
    gCost: number,
    hCost: number,
): number {
    return (weights.gWeight * gCost) + (weights.hWeight * hCost);
}