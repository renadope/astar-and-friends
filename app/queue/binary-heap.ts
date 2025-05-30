import {isNullOrUndefined} from "~/utils/helpers";

export type Comparator<T> = (a: T, b: T) => number;

export type HeapNode<T> = {
    value: T;
    priority: number;
    id: string;
};

export class BinaryHeap<T> {
    private heap: HeapNode<T>[] = [];
    private indexMap = new Map<string, number>();

    private readonly compare: Comparator<HeapNode<T>>;

    constructor(compareFunc: Comparator<HeapNode<T>>) {
        this.compare = compareFunc;
    }

    clear() {
        this.heap = []
        this.indexMap = new Map<string, number>()
    }

    toString() {
        return this.size() > 0
            ? this.heap.map((heapEle) => JSON.stringify(heapEle)).join(", ")
            : "";
    }

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    peek(): HeapNode<T> | undefined {
        return this.isEmpty() ? undefined : this.heap[0];
    }

    insert(node: HeapNode<T>) {
        this.heap.push(node);
        this.indexMap.set(node.id, this.heap.length - 1);
        this.heapifyUp();
    }

    insertAll(nodes: HeapNode<T>[]) {
        for (let i = 0; i < nodes.length; i++) {
            this.insert(nodes[i]);
        }
    }

    extractTop(): HeapNode<T> | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const min = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty() && !isNullOrUndefined(last)) {
            this.heap[0] = last;
            this.indexMap.set(last.id, 0);
            this.heapifyDown();
        }
        this.indexMap.delete(min.id);
        return min;
    }

    toSorted(): HeapNode<T>[] {
        const values = [...this.heap];
        const copy = new BinaryHeap<T>(this.compare);
        copy.insertAll(values);
        const result: HeapNode<T>[] = [];
        while (!copy.isEmpty()) {
            const top = copy.extractTop();
            if (!isNullOrUndefined(top)) {
                result.push(top);
            }
        }
        return result;
    }

    updatePriority(node: HeapNode<T>, newPriority: number) {
        this.updatePriorityID(node.id, newPriority);
    }

    updatePriorityID(id: string, newPriority: number) {
        const index = this.indexMap.get(id);
        if (isNullOrUndefined(index)) {
            return;
        }
        if (this.heap[index].priority === newPriority) {
            return;
        }
        this.heap[index].priority = newPriority;
        this.heapifyUpFrom(index);
        this.heapifyDownFrom(index);
    }

    updateNode(node: HeapNode<T>) {
        const index = this.indexMap.get(node.id);
        if (isNullOrUndefined(index)) {
            return;
        }
        this.heap[index] = node;
        this.heapifyUpFrom(index);
        this.heapifyDownFrom(index);
    }

    contains(id: string): boolean {
        return this.indexMap.has(id);
    }

    private getLeftChildIndex(index: number): number {
        return index * 2 + 1;
    }

    private getRightChildIndex(index: number): number {
        return index * 2 + 2;
    }

    private getParentIndex(index: number): number {
        return Math.floor((index - 1) / 2);
    }

    private hasParent(index: number): boolean {
        return this.getParentIndex(index) >= 0;
    }

    private hasLeftChild(index: number): boolean {
        return this.getLeftChildIndex(index) < this.size();
    }

    private hasRightChild(index: number): boolean {
        return this.getRightChildIndex(index) < this.size();
    }

    private swap(index1: number, index2: number): void {
        const tempIndex2 = this.heap[index2];
        this.heap[index2] = this.heap[index1];
        this.heap[index1] = tempIndex2;
        this.indexMap.set(this.heap[index1].id, index1);
        this.indexMap.set(this.heap[index2].id, index2);
        // [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }

    private heapifyUp() {
        return this.heapifyUpFrom(this.size() - 1);
    }

    private heapifyUpFrom(index: number) {
        while (this.hasParent(index)) {
            const parentIndex = this.getParentIndex(index);
            const compareResult = this.compare(
                this.heap[parentIndex],
                this.heap[index],
            );
            if (compareResult <= 0) {
                break;
            } else if (compareResult > 0) {
                this.swap(parentIndex, index);
                index = parentIndex;
            }
        }
    }

    private heapifyDown() {
        this.heapifyDownFrom(0);
    }

    private heapifyDownFrom(index: number): void {
        while (this.hasLeftChild(index)) {
            let betterChildIndex = this.getLeftChildIndex(index);
            if (this.hasRightChild(index)) {
                const rightIndex = this.getRightChildIndex(index);
                const compare = this.compare(
                    this.heap[rightIndex],
                    this.heap[betterChildIndex],
                );
                if (compare < 0) {
                    betterChildIndex = rightIndex;
                }
            }
            const compareToParent = this.compare(
                this.heap[index],
                this.heap[betterChildIndex],
            );
            if (compareToParent <= 0) {
                break;
            }
            this.swap(index, betterChildIndex);
            index = betterChildIndex;
        }
    }
}