import {describe, expect, it} from "vitest";
import {isSamePos, isValidPos} from "~/utils/grid-helpers";
import type {Pos} from "~/types/pathfinding";
import type {Nullish} from "~/types/helpers";

type IsSamePosTableTest = {
    pos1?: Nullish<Pos>,
    pos2?: Nullish<Pos>,
    expected: boolean,
    case: string
}
describe("isValidPos - are we passing valid positions?", () => {
    const badInputs = [
        {input: 'foo', type: 'string'},
        {input: '', type: 'empty string'},
        {input: 1, type: 'number'},
        {input: undefined, type: 'undefined'},
        {input: null, type: 'null'},
        {input: NaN, type: 'NaN'},
        {input: Infinity, type: 'Infinity'},
        {input: -Infinity, type: '-Infinity'},
        {input: {}, type: 'object'},
        {input: [-1.4, 2], type: 'invalid Pos'},
        {input: [1.1, 4.876543], type: 'invalid Pos'},
    ]

    const validInputs: Pos[] = [
        [1, 1], [1, 3], [3, 1], [3, 3], [1, 2], [2, 1], [2, 2], [2, 3], [3, 2], [3, 3], [12, 134], [4, 5], [1.0000, 2.00000]
    ]

    it.each(badInputs)('should return false for $type', ({input}) => {
        // @ts-expect-error
        expect(isValidPos(input)).toBe(false)
    });
    //bit of a quirk but i think it.each spreads the array out,so we have to reconstruct it
    it.each(validInputs)('should return true for valid Pos', (pos1, pos2) => {
        expect(isValidPos([pos1, pos2])).toBe(true)
    });
})
describe("areGridPositionsEqual", () => {
    const tests: IsSamePosTableTest[] = [
        {pos1: [1, 2], pos2: undefined, expected: false, case: 'defined vs undefined'},
        {pos1: undefined, pos2: [1, 3], expected: false, case: 'undefined vs defined'},
        {pos1: [1, 2], pos2: [1, 2], expected: true, case: 'same positions'},
        {pos1: [0, 0], pos2: [0, 0], expected: true, case: 'same positions'},
        {pos1: [1, 2], pos2: [2, 1], expected: false, case: 'different positions'},
        {pos1: undefined, pos2: undefined, expected: false, case: 'both undefined'},
        {pos1: null, pos2: [1, 2], expected: false, case: 'null vs defined'},
        {pos1: [1, 2], pos2: null, expected: false, case: 'defined vs null'},
        {pos1: null, pos2: null, expected: false, case: 'both null'},
        {pos1: [7, 7], pos2: [7, 7], expected: true, case: 'same positions'},

    ]
    it.each(tests)('isSamePos($pos1, $pos2) should return $expected for $case', ({pos1, pos2, expected}) => {
        expect(isSamePos(pos1, pos2)).toBe(expected)
    });

    it('isSamePos([1,1]) should return false for a single argument given', () => {
        //technically this counts as like the first defined vs undefined case, but wanted to be explicit
        expect(isSamePos([1, 1])).toBe(false)
    })
})

describe("areGridPositionsEqual - battle testing", () => {
    it('should handle various junk inputs gracefully', () => {
        // @ts-expect-error
        expect(isSamePos("garbage", [1, 2])).toBe(false)

        // @ts-expect-error
        expect(isSamePos([1, 2], "more garbage")).toBe(false)

        // @ts-expect-error
        expect(isSamePos(123, [1, 2])).toBe(false)

        // @ts-expect-error
        expect(isSamePos({}, [])).toBe(false)

        // @ts-expect-error
        expect(isSamePos([], {})).toBe(false)
    })

    it('should handle malformed arrays', () => {
        // @ts-expect-error
        expect(isSamePos([1], [1, 2])).toBe(false)

        // @ts-expect-error
        expect(isSamePos([1, 2, 3], [1, 2])).toBe(false)

        // @ts-expect-error
        expect(isSamePos(["a", "b"], [1, 2])).toBe(false)
    })
})