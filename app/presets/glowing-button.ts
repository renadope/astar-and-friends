export type ColorPreset =
  | 'default'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'fire'
  | 'royal'
  | 'neon'
  | 'monochrome';

export const colorPresets: Record<
  ColorPreset,
  { background: string; gradient: string; textColor: string }
> = {
  default: {
    background: 'bg-black',
    gradient: 'from-pink-600 via-fuchsia-600 to-purple-600',
    textColor: 'text-gray-100',
  },
  ocean: {
    background: 'bg-slate-900',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    textColor: 'text-blue-100',
  },
  sunset: {
    background: 'bg-gray-900',
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    textColor: 'text-orange-100',
  },
  forest: {
    background: 'bg-gray-900',
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    textColor: 'text-green-100',
  },
  fire: {
    background: 'bg-red-950',
    gradient: 'from-red-600 via-orange-500 to-yellow-500',
    textColor: 'text-yellow-100',
  },
  royal: {
    background: 'bg-indigo-950',
    gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    textColor: 'text-indigo-100',
  },
  neon: {
    background: 'bg-black',
    gradient: 'from-lime-400 via-green-400 to-emerald-500',
    textColor: 'text-lime-100',
  },
  monochrome: {
    background: 'bg-gray-800',
    gradient: 'from-gray-400 via-gray-300 to-white',
    textColor: 'text-gray-100',
  },
} as const;
