import {beforeEach, describe, expect} from "vitest";
import {makeNodeWithValueAsPriorityAutoID} from "~/queue/helpers";
import {BinaryHeap} from "~/queue/binary-heap";

describe("binary heap", () => {

    const values = Array.from({length: 100}).map((_, index) => makeNodeWithValueAsPriorityAutoID(index + 1))
    const reversedValues = Array.from({length: 100}).map((_, index) => makeNodeWithValueAsPriorityAutoID(100 - index))

    describe("constructor", () => {
        it("should create empty heap", () => {
            const minHeap = new BinaryHeap<number>((a, b) => a.priority - b.priority)
            expect(minHeap.size()).toBe(0)
        })
    })
    describe("minHeap", () => {
        let minHeap: BinaryHeap<number>
        beforeEach(() => {
            minHeap = new BinaryHeap<number>((a, b) => a.priority - b.priority)
        })

        it('should insert 100 elements', () => {
            minHeap.insertAll(values)
            expect(minHeap.size()).toBe(100)
            expect(minHeap.peek()?.value).toBe(1)
        })

        it('should extract elements in ascending order', () => {
            minHeap.insertAll(values)
            expect(minHeap.extractTop()?.value).toBe(1)
            expect(minHeap.size()).toBe(99)

            const expected = [2, 3, 4, 5, 6]
            for (let i = 0; i < 5; i++) {
                expect(minHeap.extractTop()?.value).toBe(expected[i])
            }
            expect(minHeap.extractTop()?.value).toBe(7)
            expect(minHeap.extractTop()?.value).toBe(8)
            expect(minHeap.extractTop()?.value).toBe(9)

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


    })


})