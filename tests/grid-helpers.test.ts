import { describe, expect, it } from 'vitest';
import {
  isNodePassable,
  isSamePos,
  isValidGridIndex,
  isValidGridOfNumbers,
  isValidGridStructure,
  isValidNode,
  isValidNonEmptyGridStructure,
  isValidPos,
  isValidRectangularGridOfNumbers,
} from '~/utils/grid-helpers';
import type { Pos } from '~/types/pathfinding';
import type { Nullish } from '~/types/helpers';

type IsSamePosTableTest = {
  pos1?: Nullish<Pos>;
  pos2?: Nullish<Pos>;
  expected: boolean;
  case: string;
};
describe('isValidPos - are we passing valid positions?', () => {
  const badInputs = [
    { input: 'foo', type: 'string' },
    { input: '', type: 'empty string' },
    { input: 1, type: 'number' },
    { input: undefined, type: 'undefined' },
    { input: null, type: 'null' },
    { input: NaN, type: 'NaN' },
    { input: Infinity, type: 'Infinity' },
    { input: -Infinity, type: '-Infinity' },
    { input: {}, type: 'object' },
    { input: [-1.4, 2], type: 'invalid Pos' },
    { input: [1.1, 4.876543], type: 'invalid Pos' },
    { input: ['1', '1'], type: 'invalid Pos' },
    { input: [12.5, 12], type: 'invalid Pos' },
    { input: [1, 12.178213], type: 'invalid Pos' },
  ];

  const validInputs: Pos[] = [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
    [1, 2],
    [2, 1],
    [2, 2],
    [2, 3],
    [3, 2],
    [3, 3],
    [12, 134],
    [4, 5],
    [1.0, 2.0],
  ];

  it.each(badInputs)('should return false for $type', ({ input }) => {
    // @ts-expect-error
    expect(isValidPos(input)).toBe(false);
  });
  //bit of a quirk but i think it.each spreads the array out,so we have to reconstruct it
  it.each(validInputs)('should return true for valid Pos', (pos1, pos2) => {
    expect(isValidPos([pos1, pos2])).toBe(true);
  });
});
describe('areGridPositionsEqual', () => {
  const tests: IsSamePosTableTest[] = [
    { pos1: [1, 2], pos2: undefined, expected: false, case: 'defined vs undefined' },
    { pos1: undefined, pos2: [1, 3], expected: false, case: 'undefined vs defined' },
    { pos1: [1, 2], pos2: [1, 2], expected: true, case: 'same positions' },
    { pos1: [0, 0], pos2: [0, 0], expected: true, case: 'same positions' },
    { pos1: [1, 2], pos2: [2, 1], expected: false, case: 'different positions' },
    { pos1: undefined, pos2: undefined, expected: false, case: 'both undefined' },
    { pos1: null, pos2: [1, 2], expected: false, case: 'null vs defined' },
    { pos1: [1, 2], pos2: null, expected: false, case: 'defined vs null' },
    { pos1: null, pos2: null, expected: false, case: 'both null' },
    { pos1: [7, 7], pos2: [7, 7], expected: true, case: 'same positions' },
  ];
  it.each(tests)(
    'isSamePos($pos1, $pos2) should return $expected for $case',
    ({ pos1, pos2, expected }) => {
      expect(isSamePos(pos1, pos2)).toBe(expected);
    }
  );

  it('isSamePos([1,1]) should return false for a single argument given', () => {
    //technically this counts as like the first defined vs undefined case, but wanted to be explicit
    expect(isSamePos([1, 1])).toBe(false);
  });
});

describe('areGridPositionsEqual - battle testing', () => {
  it('should handle various junk inputs gracefully', () => {
    // @ts-expect-error
    expect(isSamePos('garbage', [1, 2])).toBe(false);

    // @ts-expect-error
    expect(isSamePos([1, 2], 'more garbage')).toBe(false);

    // @ts-expect-error
    expect(isSamePos(123, [1, 2])).toBe(false);

    // @ts-expect-error
    expect(isSamePos({}, [])).toBe(false);

    // @ts-expect-error
    expect(isSamePos([], {})).toBe(false);
  });

  it('should handle malformed arrays', () => {
    // @ts-expect-error
    expect(isSamePos([1], [1, 2])).toBe(false);

    // @ts-expect-error
    expect(isSamePos([1, 2, 3], [1, 2])).toBe(false);

    // @ts-expect-error
    expect(isSamePos(['a', 'b'], [1, 2])).toBe(false);
  });
});

describe('isNodePassable', () => {
  const invalidCases = [
    { input: 0, expected: false, case: 'zero' },
    { input: -1, expected: false, case: 'negative number' },
    { input: Infinity, expected: false, case: 'Infinity' },
    { input: -Infinity, expected: false, case: '-Infinity' },
    { input: NaN, expected: false, case: 'NaN' },
    { input: '1', expected: false, case: 'string number' },
    { input: 'abc', expected: false, case: 'string' },
    { input: true, expected: false, case: 'boolean true' },
    { input: false, expected: false, case: 'boolean false' },
    { input: [], expected: false, case: 'empty array' },
    { input: [1], expected: false, case: 'array' },
    { input: {}, expected: false, case: 'empty object' },
    { input: null, expected: false, case: 'null' },
    { input: undefined, expected: false, case: 'undefined' },
    { input: Number.MIN_SAFE_INTEGER, expected: false, case: 'min integer' },
    { input: -Number.MIN_VALUE, expected: false, case: 'smallest negative number' },
  ];

  const validCases = [
    { input: 1, expected: true, case: 'one' },
    { input: 42, expected: true, case: 'positive integer' },
    { input: Number.MAX_SAFE_INTEGER, expected: true, case: 'max integer' },
    { input: Number.MAX_VALUE, expected: true, case: 'max value' },
    { input: 1.5, expected: true, case: 'positive float' },
    { input: 0.000001, expected: true, case: 'positive float' },
  ];

  it.each(invalidCases)('should return false for $case', ({ input, expected }) => {
    //@ts-expect-error
    expect(isNodePassable(input)).toBe(expected);
  });

  it.each(validCases)('should return true for $case', ({ input, expected }) => {
    expect(isNodePassable(input)).toBe(expected);
  });
});

describe('isValidGridIndex', () => {
  const invalidGrids = [
    { grid: [], row: 0, col: 0, case: 'empty grid' },
    { grid: null, row: 0, col: 0, case: 'null grid' },
    { grid: undefined, row: 0, col: 0, case: 'undefined grid' },
    { grid: true, row: 0, col: 0, case: 'boolean' },
    { grid: false, row: 0, col: 0, case: 'boolean' },
    { grid: Infinity, row: 0, col: 0, case: 'Infinity' },
    { grid: NaN, row: 0, col: 0, case: 'NaN' },
    { grid: [1, 2, 3], row: 0, col: 0, case: 'non-2D array' },
    { grid: [[]], row: 0, col: 0, case: 'grid with empty row' },
    { grid: {}, row: 0, col: 0, case: 'object' },
    { grid: [null, [1, 2]], row: 0, col: 0, case: 'null row in grid' },
    { grid: [[1, 2], undefined], row: 1, col: 0, case: 'undefined row in grid' },
    { grid: [[1, 2], 'not array'], row: 1, col: 0, case: 'non-array row' },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 1.5,
      col: 0,
      case: 'decimal row',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 0,
      col: 1.9,
      case: 'decimal column',
    },
  ];

  const invalidIndices = [
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: -1,
      col: 0,
      case: 'negative row',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 0,
      col: -1,
      case: 'negative column',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 2,
      col: 0,
      case: 'row out of bounds',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 0,
      col: 2,
      case: 'column out of bounds',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: NaN,
      col: 0,
      case: 'NaN row',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 0,
      col: NaN,
      case: 'NaN column',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: Infinity,
      col: NaN,
      case: 'Infinity row',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 0,
      col: Infinity,
      case: 'Infinity column',
    },
  ];

  const validCases = [
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 0,
      col: 0,
      case: 'top-left corner',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 0,
      col: 1,
      case: 'top-right corner',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 1,
      col: 0,
      case: 'bottom-left corner',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      row: 1,
      col: 1,
      case: 'bottom-right corner',
    },
    {
      grid: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
      row: 2,
      col: 1,
      case: 'bottom-right corner',
    },
    {
      grid: [
        ['1', '2'],
        ['3', '4'],
        ['5', '6'],
      ],
      row: 2,
      col: 1,
      case: 'bottom-right corner',
    },
    { grid: [[1]], row: 0, col: 0, case: '1x1 grid' },
    { grid: [[1, 2, 3, 4, 5]], row: 0, col: 4, case: 'single row grid' },
    { grid: [[1], [2], [3]], row: 2, col: 0, case: 'single column grid' },
  ];

  it.each(invalidGrids)('should return false for $case', ({ grid, row, col }) => {
    expect(isValidGridIndex(grid, row, col)).toBe(false);
  });

  it.each(invalidIndices)('should return false for $case', ({ grid, row, col }) => {
    expect(isValidGridIndex(grid, row, col)).toBe(false);
  });

  it.each(validCases)('should return true for $case', ({ grid, row, col }) => {
    expect(isValidGridIndex(grid, row, col)).toBe(true);
  });

  describe('isValidNode', () => {
    const invalidNodes = [
      {
        grid: [
          [0, 1],
          [1, 1],
        ],
        row: 0,
        col: 0,
        case: 'zero value',
      },
      {
        grid: [
          [-1, 1],
          [1, 1],
        ],
        row: 0,
        col: 0,
        case: 'negative value',
      },
      {
        grid: [
          [Infinity, 1],
          [1, 1],
        ],
        row: 0,
        col: 0,
        case: 'Infinity',
      },
      {
        grid: [
          [-Infinity, 1],
          [1200, 1],
        ],
        row: 0,
        col: 0,
        case: 'Infinity',
      },
      {
        grid: [
          [1, 1],
          [1200, 0],
        ],
        row: 1,
        col: 1,
        case: 'zero value',
      },
      {
        grid: [
          [NaN, 1],
          [1, 1],
        ],
        row: 0,
        col: 0,
        case: 'NaN',
      },
    ];

    const validCases = [
      {
        grid: [
          [1, 2],
          [3, 4],
        ],
        row: 0,
        col: 0,
        case: 'valid positive integer',
      },
      {
        grid: [
          [1.5, 2],
          [3, 4],
        ],
        row: 0,
        col: 0,
        case: 'valid positive float',
      },
      {
        grid: [
          [Number.MAX_VALUE, 2],
          [3, 4],
        ],
        row: 0,
        col: 0,
        case: 'valid max value',
      },
      {
        grid: [
          [Number.MAX_VALUE, 2],
          [3, 4],
        ],
        row: 1,
        col: 0,
        case: 'valid  value',
      },
    ];

    it.each(invalidGrids)('should return false for $case', ({ grid, row, col }) => {
      // @ts-expect-error
      expect(isValidNode(grid, row, col)).toBe(false);
    });

    it.each(invalidIndices)('should return false for $case', ({ grid, row, col }) => {
      expect(isValidNode(grid, row, col)).toBe(false);
    });

    it.each(invalidNodes)('should return false for $case', ({ grid, row, col }) => {
      expect(isValidNode(grid, row, col)).toBe(false);
    });

    it.each(validCases)('should return true for $case', ({ grid, row, col }) => {
      expect(isValidNode(grid, row, col)).toBe(true);
    });
  });
});
describe('isValidGridStructure', () => {
  const invalidGrids = [
    { grid: null, case: 'null grid' },
    { grid: undefined, case: 'undefined grid' },
    { grid: true, case: 'boolean' },
    { grid: false, case: 'boolean' },
    { grid: Infinity, case: 'Infinity' },
    { grid: NaN, case: 'NaN' },
    { grid: [1, 2, 3], case: 'non-2D array' },
    { grid: {}, case: 'object' },
    { grid: [null, [1, 2]], case: 'null row in grid' },
    { grid: [[1, 2], undefined], case: 'undefined row in grid' },
    { grid: [[1, 2], 'not array'], case: 'non-array row' },
  ];

  const validGrids = [
    { grid: [], case: 'empty grid' },
    {
      grid: [[1]],
      case: '1x1 minimal grid',
    },
    {
      grid: [
        [0, 0],
        [0, 0],
      ],
      case: '2x2 all-zero grid',
    },
    {
      grid: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      case: '3x3 sequential grid',
    },
    {
      grid: [
        [5, 5],
        [5, 5],
        [5, 5],
        [5, 5],
      ],
      case: '4x2 constant value grid',
    },
    {
      grid: [
        [1.1, 2.2],
        [3.3, 4.4],
      ],
      case: '2x2 floating point grid',
    },
    {
      grid: [
        [Infinity, 1],
        [1, Infinity],
      ],
      case: '2x2 with Infinity',
    },
    {
      grid: [
        [-1, 0],
        [0, -1],
      ],
      case: '2x2 with negative numbers',
    },
  ];

  it.each(invalidGrids)('should return false for $case', ({ grid }) => {
    expect(isValidGridStructure(grid)).toBe(false);
  });

  it.each(validGrids)('should return true for $case', ({ grid }) => {
    expect(isValidGridStructure(grid)).toBeTruthy();
  });
});

describe('isValidNonEmptyGridStructure', () => {
  const invalidGrids = [{ grid: [], case: 'empty grid' }];
  const validGrids = [
    { grid: [[]], case: 'has at least one row but is still empty' },
    {
      grid: [[1]],
      case: '1x1 minimal grid',
    },
    {
      grid: [
        [0, 0],
        [0, 0],
      ],
      case: '2x2 all-zero grid',
    },
    {
      grid: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      case: '3x3 sequential grid',
    },
    {
      grid: [
        [5, 5],
        [5, 5],
        [5, 5],
        [5, 5],
      ],
      case: '4x2 constant value grid',
    },
    {
      grid: [
        [1.1, 2.2],
        [3.3, 4.4],
      ],
      case: '2x2 floating point grid',
    },
    {
      grid: [
        [Infinity, 1],
        [1, Infinity],
      ],
      case: '2x2 with Infinity',
    },
    {
      grid: [
        [-1, 0],
        [0, -1],
      ],
      case: '2x2 with negative numbers',
    },
  ];

  it.each(invalidGrids)('should return false for $case', ({ grid }) => {
    expect(isValidNonEmptyGridStructure(grid)).toBeFalsy();
  });

  it.each(validGrids)('should return true for $case', ({ grid }) => {
    expect(isValidNonEmptyGridStructure(grid)).toBeTruthy();
  });
});

describe('isValidGridOfNumbers', () => {
  const invalidGrids = [
    { grid: [], case: 'empty grid' },
    {
      grid: [[]],
      case: 'has at least one row but is still empty',
    },
  ];
  const validGrids = [
    {
      grid: [[1]],
      case: '1x1 minimal grid',
    },
    {
      grid: [
        [0, 0],
        [0, 0],
      ],
      case: '2x2 all-zero grid',
    },
    {
      grid: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      case: '3x3 sequential grid',
    },
    {
      grid: [
        [5, 5],
        [5, 5],
        [5, 5],
        [5, 5],
      ],
      case: '4x2 constant value grid',
    },
    {
      grid: [
        [1.1, 2.2],
        [3.3, 4.4],
      ],
      case: '2x2 floating point grid',
    },
    {
      grid: [
        [Infinity, 1],
        [1, Infinity],
      ],
      case: '2x2 with Infinity',
    },
    {
      grid: [
        [-1, 0],
        [0, -1],
      ],
      case: '2x2 with negative numbers',
    },
  ];

  it.each(invalidGrids)('should return false for $case', ({ grid }) => {
    expect(isValidGridOfNumbers(grid)).toBeFalsy();
  });

  it.each(validGrids)('should return true for $case', ({ grid }) => {
    expect(isValidGridOfNumbers(grid)).toBeTruthy();
  });
});

describe('isValidRectangularGrid', () => {
  const invalidGrids = [
    { grid: [], case: 'empty grid' },
    { grid: [[]], case: 'has at least one row but is still empty' },

    {
      grid: [
        [1, 2, 3],
        [4, 5],
      ],
      case: 'second row is shorter',
    },
    {
      grid: [
        [1, 2],
        [3, 4, 5],
      ],
      case: 'second row is longer',
    },
    {
      grid: [[0], [1, 2], [3, 4, 5]],
      case: 'gradually increasing row lengths',
    },
    {
      grid: [[7, 8], []],
      case: 'one row is empty, rest are not',
    },
    {
      grid: [[1, 2, 3], [4, 5, 6], [7]],
      case: 'last row is too short',
    },
  ];
  const validGrids = [
    {
      grid: [[1]],
      case: '1x1 minimal grid',
    },
    {
      grid: [
        [0, 0],
        [0, 0],
      ],
      case: '2x2 all-zero grid',
    },
    {
      grid: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      case: '3x3 sequential grid',
    },
    {
      grid: [
        [5, 5],
        [5, 5],
        [5, 5],
        [5, 5],
      ],
      case: '4x2 constant value grid',
    },
    {
      grid: [
        [1.1, 2.2],
        [3.3, 4.4],
      ],
      case: '2x2 floating point grid',
    },
    {
      grid: [
        [Infinity, 1],
        [1, Infinity],
      ],
      case: '2x2 with Infinity',
    },
    {
      grid: [
        [-1, 0],
        [0, -1],
      ],
      case: '2x2 with negative numbers',
    },
  ];

  it.each(invalidGrids)('should return false for $case', ({ grid }) => {
    expect(isValidRectangularGridOfNumbers(grid)).toBeFalsy();
  });

  it.each(validGrids)('should return true for $case', ({ grid }) => {
    expect(isValidRectangularGridOfNumbers(grid)).toBeTruthy();
  });
});
