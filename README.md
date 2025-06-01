# 🧭 A* and Friends: Pathfinding Visualizer

<div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vitest-3.1.4-6E9F18?style=for-the-badge&logo=vitest" alt="Vitest" />
</div>

<p style="text-align: center; margin-bottom: 24px;">
  <strong>A high-performance, fully customizable grid-based pathfinding visualizer</strong> featuring multiple search algorithms, detailed configuration, and real-time animation — designed for education, exploration, and technical demonstration.
</p>

<div style="display: flex; justify-content: center; margin-bottom: 32px;">
  <a href="https://astarandfriends.io/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-FF5757?style=for-the-badge" alt="Live Demo" />
  </a>
</div>

<p style="text-align: center; font-size: 0.95rem; color: gray; margin-bottom: 32px;">
  🖥️ Fully functional on mobile, but best experienced on desktop for full grid interaction.
</p>

## ✨ Overview

Visualize how pathfinding algorithms work in real-time on an interactive grid. Perfect for computer science students, algorithm enthusiasts, and developers interested in the inner workings of spatial search algorithms.

## 🎯 Key Features

### 🔁 Supported Algorithms

- **AStar Search**: The gold standard pathfinding algorithm with adjustable `g` (path cost) and `h` (heuristic) weightings
- **Dijkstra's Algorithm**: The classic shortest-path algorithm that uses path cost only (`g`)
- **Greedy Best-First Search**: A faster, less optimal approach that uses heuristic only (`h`)
- **Breadth-First Search**: A fundamental graph traversal technique, simulated by setting *gWeight = 0* and *hWeight = 0*

### 🧮 Unified Algorithm Framework

All algorithms operate under a single elegant formula:

> **f(n) = g(n) × gWeight + h(n) × hWeight**

This design allows seamless real-time transitions between algorithms by simply adjusting weight parameters—no code switching required!

### 🎮 Interactive Visualization Controls

- **Dynamic Speed Control**: Adjust from 0.5× to 10× to match your learning pace
- **Timeline Scrubbing**: Jump to any point in the algorithm's execution
- **Playback Controls**: Play, pause, restart, and skip to solution
- **Dual Visualization Modes**:
  - 📸 **Snapshot Mode**: See the complete state at each algorithm step
  - 🔍 **Granular Mode**: Watch fine-grained changes for deeper understanding

### 🎨 Rich Grid Interaction

- **Interactive Painting**: Drag to add weights, barriers, and customize your grid
- **Node Customization**: Set custom start and goal positions with a click
- **Wall Creation**: Design complex mazes by toggling impassable cells
- **Randomized Environments**: Generate preset scenarios or completely random grids
- **Diagonal Movement Options**:
  - **None**: Classic four-direction movement (up, down, left, right)
  - **Strict**: Diagonal movement only when both adjacent cells are passable (no corner cutting)
  - **Lax**: Diagonal movement when at least one adjacent cell is passable (partial corner cutting)
- **Customizable Costs**: Adjust diagonal movement cost (default: √2)

### 👀 Intuitive Visual Feedback

- **Ghost Path Preview**: Instantly visualize potential paths by hovering over any cell
- **Color-Coded States**: Clear distinction between frontier, visited nodes, and final path
- **Responsive Design**: Optimal experience across devices and screen sizes

### 🧠 Advanced Heuristic Configuration

Choose from multiple distance calculations:
- **Manhattan**: Optimal for grid-based movement without diagonals
- **Euclidean**: True "as the crow flies" distance
- **Octile**: Optimized for grids with diagonal movement at cost √2
- **Chebyshev**: Equal cost in all directions (including diagonals)

Fine-tune algorithm behavior with intuitive weight sliders for perfect customization.

### ⚙️ Streamlined Controls

- **Unified Control Panel**: All settings in one convenient location
- **Real-Time Updates**: See how changes affect pathfinding instantly
- **Feature Toggles**: Enable/disable functionalities based on your needs

### 🧪 Quality Assurance

- **Comprehensive Testing**: Core components thoroughly tested with Vitest
- **CI/CD Pipeline**: Automated testing on every commit ensures reliability

## 🧠 Tech Stack

- **Frontend**: React 19 + React Router + TailwindCSS + shadcn/ui
- **State Management**: Custom hooks and context for efficient state handling
- **Animation Engine**: Purpose-built timeline system for precise playback control
- **Testing**: Vitest for unit and integration tests
- **CI/CD**: GitHub Actions for automated testing and deployment

## 🛠️ Getting Started

Clone and run the project locally in just three simple steps:

```bash
git clone https://github.com/renadope/astar-and-friends.git
cd astar-and-friends
pnpm install
pnpm run dev
```