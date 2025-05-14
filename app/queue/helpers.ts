import type {HeapNode} from "~/queue/binary-heap";

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