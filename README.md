# A* and Friends: Pathfinding Visualizer

<div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vitest-3.1.4-6E9F18?style=for-the-badge&logo=vitest" alt="Vitest" />
</div>

<p style="text-align: center; margin-bottom: 24px;">
  <strong>A high-performance, fully customizable grid-based pathfinding visualizer</strong> featuring multiple search algorithms, comprehensive configuration options, and real-time animation capabilities designed for educational purposes, algorithmic exploration, and technical demonstration.
</p>

<div style="display: flex; justify-content: center; margin-bottom: 32px;">
  <a href="https://astarandfriends.io/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-FF5757?style=for-the-badge" alt="Live Demo" />
  </a>
</div>

<p style="text-align: center; font-size: 0.95rem; color: gray; margin-bottom: 32px;">
  Note: While fully functional on mobile devices, the application is optimized for desktop environments to provide the best grid interaction experience.
</p>

## Overview

This application provides real-time visualization of pathfinding algorithms operating on interactive grids. It serves as
an educational tool for computer science students, algorithm enthusiasts, and software developers seeking to understand
the mechanics of spatial search algorithms.

## Core Features

### Supported Algorithms

- **A* Search**: An informed search algorithm utilizing both path cost and heuristic evaluation with adjustable
  weighting parameters
- **Dijkstra's Algorithm**: A graph search algorithm that finds the shortest path between nodes using cumulative path
  costs
- **Greedy Best-First Search**: A heuristic-driven search algorithm that prioritizes nodes based on estimated distance
  to the goal
- **Breadth-First Search**: A fundamental graph traversal algorithm implemented through weight parameter configuration

### Unified Algorithm Framework

All pathfinding algorithms operate within a single mathematical framework:

> **f(n) = g(n) × gWeight + h(n) × hWeight**

This architectural approach enables seamless algorithm transitions through parameter adjustment without requiring code
modifications, facilitating real-time algorithm comparison and analysis.

### Visualization and Control System

- **Variable Speed Control**: Animation speed adjustment ranging from 0.5× to 10× normal speed
- **Timeline Navigation**: Precise control over algorithm execution state with scrubbing capabilities
- **Comprehensive Playback Controls**: Standard media controls including play, pause, restart, and skip-to-solution
- **Dual Visualization Modes**:
    - **Snapshot Mode**: Displays complete algorithm state at discrete time intervals
    - **Granular Mode**: Provides detailed step-by-step visualization for comprehensive analysis

### Grid Interaction Capabilities

- **Interactive Grid Modification**: Direct manipulation of grid properties through drag-and-drop interface
- **Dynamic Node Configuration**: Real-time adjustment of start and goal positions
- **Obstacle Creation**: Support for complex maze and barrier configurations
- **Procedural Generation**: Automated creation of randomized grid environments
- **Movement Configuration Options**:
    - **Orthogonal Movement**: Traditional four-directional movement (cardinal directions only)
    - **Strict Diagonal Movement**: Diagonal movement permitted only when adjacent cells are passable
    - **Permissive Diagonal Movement**: Diagonal movement allowed with relaxed adjacency constraints
- **Configurable Movement Costs**: Adjustable diagonal movement penalties (default: √2)

### Visual Feedback System

- **Path Preview Functionality**: Real-time path visualization through mouse interaction
- **State-Based Color Coding**: Visual distinction between explored nodes, frontier nodes, and optimal paths
- **Responsive Interface Design**: Adaptive layout supporting multiple device form factors

### Heuristic Configuration

Multiple distance calculation methods are supported:

- **Manhattan Distance**: Optimal for orthogonal movement patterns
- **Euclidean Distance**: True geometric distance calculation
- **Octile Distance**: Specialized for grids supporting diagonal movement at cost √2
- **Chebyshev Distance**: Uniform cost distance metric for all movement directions

Algorithm behavior can be precisely tuned through intuitive weight adjustment controls.

### User Interface Design

- **Centralized Control Panel**: Consolidated settings interface for streamlined user experience
- **Modular Feature System**: Selective activation of functionality based on user requirements

### Quality Assurance

- **Comprehensive Test Suite**: Extensive unit and integration testing using Vitest framework
- **Continuous Integration**: Automated testing pipeline ensuring code quality and reliability

## Technical Architecture

- **Frontend Framework**: React 19 with React Router for navigation and TailwindCSS with shadcn/ui for styling
- **State Management**: Custom React hooks and context providers for efficient state handling
- **Animation System**: Purpose-built timeline engine providing precise playback control
- **Testing Framework**: Vitest for comprehensive test coverage
- **Deployment Pipeline**: GitHub Actions for automated testing and continuous deployment

## Installation and Setup

To run the application locally, execute the following commands:

```bash
git clone https://github.com/renadope/astar-and-friends.git
cd astar-and-friends
pnpm install
pnpm run dev
```

The application will be available at the default development server address.