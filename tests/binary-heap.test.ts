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
        it('should have a heap size of zero', () => {
            minHeap.insertAll(positiveValues)
            minHeap.clear()
            expect(minHeap.size()).toBe(0)
            expect(minHeap.peek()?.value).toBeUndefined()
            expect(minHeap.extractTop()?.value).toBeUndefined()
        })
    })
    describe("maxHeap", () => {
        let maxHeap: BinaryHeap<number>
        let positiveValues: HeapNode<number>[] = []
        let negativeValues: HeapNode<number>[] = []
        beforeEach(() => {
            maxHeap = new BinaryHeap<number>((a, b) => b.priority - a.priority)
            positiveValues = fisherYates(orderedPositiveValues)
            negativeValues = fisherYates(orderedNegativeValues)

        })

        it(`should insert ${positiveValues.length} elements`, () => {
            maxHeap.insertAll(positiveValues)
            expect(maxHeap.size()).toBe(positiveValues.length)
            expect(maxHeap.peek()?.value).toBe(10000)
        })

        it('should extract elements in descending order', () => {
            maxHeap.insertAll(positiveValues)
            expect(maxHeap.extractTop()?.value).toBe(10000)
            expect(maxHeap.size()).toBe(positiveValues.length - 1)

            const expected = [9999, 9998, 9997, 9996, 9995]
            for (let i = 0; i < 5; i++) {
                expect(maxHeap.extractTop()?.value).toBe(expected[i])
            }
            expect(maxHeap.extractTop()?.value).toBe(9994)
            expect(maxHeap.extractTop()?.value).toBe(9993)
            expect(maxHeap.extractTop()?.value).toBe(9992)
            expect(maxHeap.peek()?.value).toBe(9991)

        })

        it('should maintain max heap property with multiple insertions', () => {
            maxHeap.insert(makeNodeWithValueAsPriorityAutoID(12))
            maxHeap.insert(makeNodeWithValueAsPriorityAutoID(120))
            maxHeap.insert(makeNodeWithValueAsPriorityAutoID(6))
            maxHeap.insert(makeNodeWithValueAsPriorityAutoID(3))
            maxHeap.insert(makeNodeWithValueAsPriorityAutoID(45))
            maxHeap.insert(makeNodeWithValueAsPriorityAutoID(1000))
            expect(maxHeap.size()).toBe(6)
            expect(maxHeap.peek()?.value).toBe(1000)

            expect(maxHeap.extractTop()?.value).toBe(1000)
            expect(maxHeap.size()).toBe(5)

            expect(maxHeap.extractTop()?.value).toBe(120)
            expect(maxHeap.size()).toBe(4)

            expect(maxHeap.extractTop()?.value).toBe(45)
            expect(maxHeap.size()).toBe(3)

            expect(maxHeap.peek()?.value).toBe(12)
        });

        it('should handle empty heap extraction', () => {
            expect(maxHeap.extractTop()?.value).toBeUndefined()
        });

        it('should handle duplicate priorities', () => {
            maxHeap.insertAll([5, 5, 1, 1]
                .map(val => makeNodeWithValueAsPriorityAutoID(val)))

            expect(maxHeap.extractTop()?.value).toBe(5)
            expect(maxHeap.extractTop()?.value).toBe(5)
            expect(maxHeap.peek()?.value).toBe(1)
        })


        it('should handle random large dataset', () => {
            const randomValues = fisherYates(Array.from({length: 10000}, () => Math.floor(Math.random() * 10000))
                .map((val) => makeNodeWithValueAsPriorityAutoID(val)))
            maxHeap.insertAll(randomValues)
            let prev = Infinity
            while (maxHeap.size() > 0) {
                //i know this is generally not a good practice, but we guard against empty heaps in the loop
                const curr = maxHeap.extractTop()?.value!
                expect(curr).toBeDefined()
                expect(curr).toBeLessThanOrEqual(prev)
                prev = curr
            }
        });

        it('should handle negative numbers', () => {
            maxHeap.insertAll(negativeValues)
            expect(maxHeap.extractTop()?.value).toBe(-1)
            expect(maxHeap.extractTop()?.value).toBe(-2)
            expect(maxHeap.extractTop()?.value).toBe(-3)
        })

        it('should have the sorted array with each subsequent number being smaller than the previous one', () => {
            maxHeap.insertAll([...negativeValues, ...positiveValues])
            expect(maxHeap.size()).toBe(positiveValues.length + negativeValues.length)
            const sortedArr = maxHeap.toSorted()
            for (let i = 1; i < sortedArr.length; i++) {
                expect(sortedArr[i - 1].value).toBeGreaterThanOrEqual(sortedArr[i].value)
            }

        })

        it('should update priority and maintain heap property', () => {
            const newVal = orderedPositiveValues[orderedPositiveValues.length - 1].value * (Math.floor((Math.random() + 12) * 3))
            const node = makeNodeWithValueAsPriorityAutoID(newVal)
            maxHeap.insertAll(positiveValues)
            expect(maxHeap.peek()?.value).not.toBe(newVal)
            maxHeap.insert(node)
            maxHeap.updatePriorityID(node.id, 1000000)
            expect(maxHeap.peek()?.value).toBe(newVal)
            expect(maxHeap.extractTop()?.value).toBe(newVal)
        })
        it('should silently ignore updatePriority on a missing node', () => {
            //since im currently testing this behavior, i do wonder if its better if we return an error or the node instead of silently ignoring
            expect(() => {
                maxHeap.updatePriorityID('f.r.i.e.n.d.s', 1000000)
            }).not.toThrow()
            expect(maxHeap.size()).toBe(0)
        })
        it('should not change heap if priority was updated to the same value', () => {
            //we just return if the new priority is the same as the old priority, so structure should be exactly the same
            const node = makeNodeWithValueAsPriorityAutoID(100)
            const node2 = makeNodeWithValueAsPriorityAutoID(101)
            maxHeap.insert(node)
            maxHeap.insert(node2)
            maxHeap.updatePriorityID(node.id, 100)
            maxHeap.updatePriorityID(node2.id, 101)
            expect(maxHeap.peek()?.value).toBe(101)
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
