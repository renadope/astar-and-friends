# 🧭 A* and Friends: Pathfinding Visualizer

A high-performance, fully customizable grid-based pathfinding visualizer featuring multiple search algorithms, detailed
configuration, and real-time animation — designed for education, exploration, and technical demonstration.

## [🚀 Live Demo](https://astarandfriends.io/)

## 🎯 Key Features

### 🔁 Supported Algorithms

* **AStar** Search: Adjustable `g` (path cost) and `h` (heuristic) weightings.
* **Dijkstra's Algorithm**: Uses path cost only (`g`).
* **Greedy Best-First Search**: Uses heuristic only (`h`).
* **Breadth-First Search**: Simulated by setting *gWeight = 0* and *hWeight = 0*, resulting in uniform-cost, level-order
  traversal where all nodes have equal priority.

### 🧮 Algorithm Scoring Formula

Each algorithm is unified under the same scoring formula:

* f(n) = g(n) * gWeight + h(n) * hWeight

This flexible architecture enables real-time transitions between **Breadth-First Search**, **Dijkstra**, **Greedy
Best-First Search**, and **AStar** by simply adjusting the weight sliders — no core logic changes required.

### 🎮 Interactive Playback

* Control playback speed (0.5x to 10x).
* Full timeline support with scrubbing and jumping.
* Play, pause, and restart actions.
* Jump to final path.
* Dual Timeline Modes:
    * **Snapshot** Mode: Highlights the grid state per algorithm step.
    * **Granular** Mode: Displays fine-grained step-by-step changes.

### 🎨 Grid Interactivity

* Drag to paint weights directly onto the grid.
* Click to set custom start and goal nodes.
* Toggle walls to mark impassable cells.
* Generate randomized grid with presets.
* Enable diagonal movement
    * *none* - Diagonal movement completely disabled, only up,down,left and right movements alone
    * *strict* - Diagonal movement is allowed only if both adjacent cardinal neighbors are passable.
      (This prevents “cutting corners” around walls.)
    * *lax* - Diagonal movement is allowed if at least one of the adjacent cardinal neighbors is passable.
      (Prevents total corner cutting through tight gaps but allows more flexibility than strict.)

* Customize diagonal movement cost (default: √2).

### 👀 Visual Feedback

* **Ghost Path Preview**: Hover to preview the A\* path from start to any cell.
* Color-coded states: frontier, visited nodes, final path.
* Responsive layout for different screen sizes.

### 🧠 Heuristic Configuration

* Select heuristic function:
    * Manhattan Distance
    * Euclidean Distance
    * Octile
    * Chebyshev
* Fine-tune weights for `g` and `h` using intuitive sliders.

### ⚙️ Unified Configuration Panel

* Consolidated control panel for algorithm and grid options.
* Real-time updates with toggleable features.

### 🧪 Testing & CI Integration

* Unit tests for core components (e.g., min-heap, grid utilities, algorithm functionality).
* CI/CD pipeline runs tests automatically on commit.

## 🧠 Tech Stack

* **Frontend**: React + ReactRouter + TailwindCSS + shadcn/ui
* **Animation Engine**: Custom timeline logic for frame-based playback
* **Testing**: Vitest
* **CI/CD**: GitHub Actions

## 🛠 Getting Started

```bash
git clone https://github.com/renadope/astar-and-friends.git
cd astar-and-friends
pnpm install
pnpm run dev
```

[//]: # (## 🔭 Future Enhancements)

[//]: # ()

[//]: # (*)


