import {BinaryHeap, type Comparator, type HeapNode} from "~/queue/binary-heap";

export class PriorityQueue<T> {
    private binaryHeap: BinaryHeap<T>;

    constructor(private compareFunc: Comparator<HeapNode<T>>) {
        this.binaryHeap = new BinaryHeap<T>(compareFunc);
    }

    toString() {
        return this.binaryHeap.toString();
    }

    isEmpty() {
        return this.binaryHeap.isEmpty();
    }

    size() {
        return this.binaryHeap.size();
    }

    enqueue(item: HeapNode<T>) {
        this.binaryHeap.insert(item);
    }

    enqueueMany(items: HeapNode<T>[]) {
        this.binaryHeap.insertAll(items);
    }

    dequeue(): HeapNode<T> | undefined {
        return this.binaryHeap.extractTop();
    }

    peek(): HeapNode<T> | undefined {
        return this.binaryHeap.peek();
    }

    updatePriority(node: HeapNode<T>, priority: number) {
        this.binaryHeap.updatePriority(node, priority);
    }

    updatePriorityID(id: string, priority: number) {
        this.binaryHeap.updatePriorityID(id, priority);
    }

    updateNode(node: HeapNode<T>) {
        this.binaryHeap.updateNode(node);
    }

    contains(id: string): boolean {
        return this.binaryHeap.contains(id);
    }

    toArray(): HeapNode<T>[] {
        return this.binaryHeap.toSorted();
    }
}