import type { gwWeights } from '~/state/types';

export type Algorithm = {
  id: string;
  label: string;
  title: string;
  weights: gwWeights;
  variant: 'default' | 'primary';
};

export const DEFAULT_ALGORITHMS: Algorithm[] = [
  {
    id: 'bfs',
    label: 'BFS',
    title: 'Breadth First Search',
    weights: { gWeight: 0, hWeight: 0 },
    variant: 'default',
  },
  {
    id: 'greedy-bfs',
    label: 'Greedy',
    title: 'Greedy Best-First',
    weights: { gWeight: 0, hWeight: 1 },
    variant: 'default',
  },
  {
    id: 'dijkstra',
    label: 'Dijkstra',
    title: "Dijkstra's Algorithm",
    weights: { gWeight: 1, hWeight: 0 },
    variant: 'default',
  },
  {
    id: 'astar',
    label: 'Classic A*',
    title: 'Classic A*',
    weights: { gWeight: 1, hWeight: 1 },
    variant: 'primary',
  },
  {
    id: 'weighted-astar',
    label: 'Weighted A*',
    title: 'Weighted A*',
    weights: { gWeight: 1, hWeight: 2 },
    variant: 'default',
  },
];
