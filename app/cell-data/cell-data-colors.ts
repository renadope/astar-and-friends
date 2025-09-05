import type { CellData } from '~/cell-data/types';

export const cellBgColor: Record<CellData['state'], string> = {
  empty: 'bg-slate-50',
  wall: 'bg-slate-900',
  visited: 'bg-purple-400',
  frontier: 'bg-yellow-300',
  path: 'bg-emerald-400',
  start: 'bg-sky-500',
  goal: 'bg-pink-500',
  ghost: 'bg-cyan-600/90',
};
export const textColors: Record<CellData['state'], string> = {
  wall: 'text-white',
  path: 'text-white',
  visited: 'text-white',
  start: 'text-white',
  goal: 'text-white',
  empty: 'text-slate-800',
  frontier: 'text-slate-950',
  ghost: 'text-white',
};
