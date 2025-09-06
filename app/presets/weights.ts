import type { CostAndWeightKind } from '~/utils/grid-weights';

type WeightData = {
  label: string;
  value: CostAndWeightKind;
  description: string;
  emoji: string;
};
export const weightPresets: WeightData[] = [
  {
    label: 'Uniform',
    value: 'uniform',
    description: 'All cells have the same traversal cost. Ideal for basic testing.',
    emoji: '📏',
  },
  {
    label: 'Fake Noise',
    value: 'fakeNoise',
    description: 'Adds pseudo-random variation in weights to simulate natural terrain.',
    emoji: '🌫️',
  },
  {
    label: 'Center Ridge',
    value: 'centerRidge',
    description: 'Creates a high-cost ridge down the center of the simple-grid.',
    emoji: '⛰️',
  },
  {
    label: 'Circular Basin',
    value: 'circularBasin',
    description: 'Lower weights near the center and higher costs as you move outward.',
    emoji: '🌀',
  },
  {
    label: 'Wall Corridor Bias',
    value: 'wall',
    description: 'Biases cost around walls and corridors to simulate bottlenecks.',
    emoji: '🚧',
  },
  {
    label: 'Diagonal Gradient',
    value: 'diagonal',
    description: 'Increases cost gradually from top-left to bottom-right diagonally.',
    emoji: '📐',
  },
  {
    label: 'Random Terrain',
    value: 'random',
    description: 'Completely randomized weights for each cell. Unpredictable paths.',
    emoji: '🎲',
  },
  {
    label: 'Random (No walls)',
    value: 'randomNoWalls',
    description: 'Completely randomized weights for each cell with no walls. Unpredictable paths.',
    emoji: '🎲',
  },
  {
    label: 'Biome Weights',
    value: 'biome',
    description: 'Mimics different biome zones with clustered terrain types.',
    emoji: '🌍',
  },
  {
    label: 'High Cost',
    value: 'highCost',
    description: 'Generates a simple-grid with higher costs having a greater chace.',
    emoji: '💰',
  },
  {
    label: '0-10 Even',
    value: 'zeroToTenEven',
    description: 'Even distribution of zero to 10 weights.',
    emoji: '2️⃣',
  },
];
