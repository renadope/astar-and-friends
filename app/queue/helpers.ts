import type {HeapNode} from "~/queue/binary-heap";
import { randomUUID } from 'node:crypto';

export function makeNode<T>(
    value: T,
    priority: number,
    id: string,
): HeapNode<T> {
    return {
        value,
        priority,
        id,
    };
}

//quick helpers so we don't have to keep specifying it each time

export function makeNodeWithValueAsPriority(value: number, id: string) {
    return makeNode(value, value, id)
}

export function makeNodeWithValueAsPriorityAutoID(value: number,) {
    return makeNodeWithValueAsPriority(value, randomUUID())
}