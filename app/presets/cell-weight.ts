type CellWeightPreset = {
    name: string,
    weight: number,
    icon?: string
}
export const cellWeight: CellWeightPreset [] = [
    {name: "Wall", weight: 0, },//icon: "🧱"
    {name: "Road", weight: 1, },//icon: "🛣️"
    {name: "Plains", weight: 2, },//icon: "🌾"
    {name: "Forest", weight: 4, },//icon: "🌲"
    {name: "Hills", weight: 7, icon: "⛰️"},
    {name: "Swamp", weight: 12, icon: "🪵"},
    {name: "River", weight: 18, icon: "🌊"},
    {name: "Desert", weight: 25, icon: "🏜️"},
    {name: "Deep Sea", weight: 35, icon: "🌌"},
    {name: "Lava", weight: 50, icon: "🌋"},
    {name: "Blizzard", weight: 80, icon: "❄️"},
    {name: "Mountain", weight: 999, icon: "🏔️"}
];
