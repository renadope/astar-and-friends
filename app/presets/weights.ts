import type {CostAndWeightKind} from "~/utils/grid-weights";

type WeightData = {
    label: string;
    value: CostAndWeightKind;
    description: string;
    emoji: string;
    tag?: "Recommended" | "Simple" | "Challenging" | "Experimental";
}
export const weightPresets: WeightData[] = [
    {
        label: "Uniform",
        value: "uniform",
        description: "All cells have the same traversal cost. Ideal for basic testing.",
        emoji: "📏",
        tag: "Simple"
    },
    {
        label: "Fake Noise",
        value: "fake_noise",
        description: "Adds pseudo-random variation in weights to simulate natural terrain.",
        emoji: "🌫️",
        tag: "Experimental"
    },
    {
        label: "Center Ridge",
        value: "centerRidge",
        description: "Creates a high-cost ridge down the center of the simple-grid.",
        emoji: "⛰️",
        tag: "Challenging"
    },
    {
        label: "Circular Basin",
        value: "circularBasin",
        description: "Lower weights near the center and higher costs as you move outward.",
        emoji: "🌀",
        tag: "Recommended"
    },
    {
        label: "Wall Corridor Bias",
        value: "wall",
        description: "Biases cost around walls and corridors to simulate bottlenecks.",
        emoji: "🚧",
        tag: "Challenging"
    },
    {
        label: "Diagonal Gradient",
        value: "diagonal",
        description: "Increases cost gradually from top-left to bottom-right diagonally.",
        emoji: "📐",
        tag: "Simple"
    },
    {
        label: "Random Terrain",
        value: "random",
        description: "Completely randomized weights for each cell. Unpredictable paths.",
        emoji: "🎲",
        tag: "Experimental"
    },
    {
        label: "Biome Weights",
        value: "biome",
        description: "Mimics different biome zones with clustered terrain types.",
        emoji: "🌍",
        tag: "Recommended"
    },
    {
        label: "High Cost",
        value: "highCost",
        description: "Generates a simple-grid with higher costs having a greater chace.",
        emoji: "💰",
        tag: "Recommended"
    },
    {
        label: "0-10 Even",
        value: "zeroToTenEven",
        description: "Even distribution of zero to 10 weights.",
        emoji: "2️⃣",
        tag: "Simple"
    }
];
