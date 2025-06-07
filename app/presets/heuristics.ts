import type { HeuristicName } from '~/utils/heuristics';

export const heuristicInfo: { label: string; value: HeuristicName }[] = [
  { label: 'Manhattan: (|dx| + |dy|)', value: 'manhattan' },
  { label: 'Euclidean: (√(dx² + dy²))', value: 'euclidean' },
  { label: 'Octile: D * (|dx| + |dy| + (√2 - 2 * D) × min(dx, dy))', value: 'octile' },
  { label: 'Chebyshev: (max(|dx|, |dy|))', value: 'chebyshev' },
];
