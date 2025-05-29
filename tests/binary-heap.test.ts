import {beforeEach, describe, expect} from "vitest";
import {BinaryHeap, type HeapNode} from "~/queue/binary-heap";
import {makeNodeWithValueAsPriorityAutoID} from "~/queue/helpers";

describe("binary heap", () => {

    const orderedPositiveValues = Array.from({length: 10000}).map((_, index) => makeNodeWithValueAsPriorityAutoID(index + 1))
    const orderedNegativeValues = Array.from({length: 100}).map((_, index) => makeNodeWithValueAsPriorityAutoID(-index - 1))

    describe("constructor", () => {
        it("should create empty heap", () => {
            const minHeap = new BinaryHeap<number>((a, b) => a.priority - b.priority)
            expect(minHeap.size()).toBe(0)
        })
    })
    describe("minHeap", () => {
        let minHeap: BinaryHeap<number>
        let positiveValues: HeapNode<number>[] = []
        let negativeValues: HeapNode<number>[] = []
        beforeEach(() => {
            minHeap = new BinaryHeap<number>((a, b) => a.priority - b.priority)
            positiveValues = fisherYates(orderedPositiveValues)
            negativeValues = fisherYates(orderedNegativeValues)

        })

        it(`should insert ${positiveValues.length} elements`, () => {
            minHeap.insertAll(positiveValues)
            expect(minHeap.size()).toBe(positiveValues.length)
            expect(minHeap.peek()?.value).toBe(1)
        })

        it('should extract elements in ascending order', () => {
            minHeap.insertAll(positiveValues)
            expect(minHeap.extractTop()?.value).toBe(1)
            expect(minHeap.size()).toBe(positiveValues.length - 1)

            const expected = [2, 3, 4, 5, 6]
            for (let i = 0; i < 5; i++) {
                expect(minHeap.extractTop()?.value).toBe(expected[i])
            }
            expect(minHeap.extractTop()?.value).toBe(7)
            expect(minHeap.extractTop()?.value).toBe(8)
            expect(minHeap.extractTop()?.value).toBe(9)
            expect(minHeap.peek()?.value).toBe(10)

        })

        it('should maintain min heap property with multiple insertions', () => {
            minHeap.insert(makeNodeWithValueAsPriorityAutoID(12))
            minHeap.insert(makeNodeWithValueAsPriorityAutoID(120))
            minHeap.insert(makeNodeWithValueAsPriorityAutoID(6))
            minHeap.insert(makeNodeWithValueAsPriorityAutoID(3))
            minHeap.insert(makeNodeWithValueAsPriorityAutoID(45))
            minHeap.insert(makeNodeWithValueAsPriorityAutoID(1000))
            expect(minHeap.size()).toBe(6)
            expect(minHeap.peek()?.value).toBe(3)
            expect(minHeap.extractTop()?.value).toBe(3)
            expect(minHeap.size()).toBe(5)
            expect(minHeap.extractTop()?.value).toBe(6)
            expect(minHeap.size()).toBe(4)
            expect(minHeap.extractTop()?.value).toBe(12)
            expect(minHeap.size()).toBe(3)
            expect(minHeap.peek()?.value).toBe(45)
        });

        it('should handle empty heap extraction', () => {
            expect(minHeap.extractTop()?.value).toBeUndefined()
        });

        it('should handle duplicate priorities', () => {
            minHeap.insertAll([5, 5, 1, 1]
                .map(val => makeNodeWithValueAsPriorityAutoID(val)))

            expect(minHeap.extractTop()?.value).toBe(1)
            expect(minHeap.extractTop()?.value).toBe(1)
            expect(minHeap.peek()?.value).toBe(5)
        })


        it('should handle random large dataset', () => {
            const randomValues = fisherYates(Array.from({length: 10000}, () => Math.floor(Math.random() * 10000))
                .map((val) => makeNodeWithValueAsPriorityAutoID(val)))
            minHeap.insertAll(randomValues)
            let prev = -Infinity
            while (minHeap.size() > 0) {
                //i know this is generally not a good practice, but we guard against empty heaps in the loop
                const curr = minHeap.extractTop()?.value!
                expect(curr).toBeDefined()
                expect(curr).toBeGreaterThanOrEqual(prev)
                prev = curr
            }
        });

        it('should handle negative numbers', () => {
            minHeap.insertAll(negativeValues)
            expect(minHeap.extractTop()?.value).toBe(-100)
            expect(minHeap.extractTop()?.value).toBe(-99)
            expect(minHeap.extractTop()?.value).toBe(-98)
        })

        it('should have the sorted array with each subsequent number being larger than the previous one', () => {
            minHeap.insertAll([...negativeValues, ...positiveValues])
            expect(minHeap.size()).toBe(positiveValues.length + negativeValues.length)
            const sortedArr = minHeap.toSorted()
            for (let i = 1; i < sortedArr.length; i++) {
                expect(sortedArr[i - 1].value).toBeLessThanOrEqual(sortedArr[i].value)
            }

        })

        it('should correctly identify if a node exists by ID', () => {
            const node = makeNodeWithValueAsPriorityAutoID(88)
            minHeap.insert(node)
            expect(minHeap.contains(node.id)).toBe(true)
            minHeap.extractTop()
            expect(minHeap.contains(node.id)).toBe(false)
        })

        it('should update priority and maintain heap property', () => {
            const newVal = orderedPositiveValues[orderedPositiveValues.length - 1].value * (Math.floor((Math.random() + 1) * 20))
            const node = makeNodeWithValueAsPriorityAutoID(newVal)
            minHeap.insertAll(positiveValues)
            minHeap.insert(node)
            expect(minHeap.peek()?.value).not.toBe(newVal)
            minHeap.updatePriority(node, -10000)
            expect(minHeap.peek()?.value).toBe(newVal)
            expect(minHeap.extractTop()?.value).toBe(newVal)
        })
    })


})

function fisherYates<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = shuffled[i]
        shuffled[i] = shuffled[j]
        shuffled[j] = temp
    }

    return shuffled
}
