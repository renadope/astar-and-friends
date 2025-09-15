export type ColorPreset =
  | 'default'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'fire'
  | 'royal'
  | 'neon'
  | 'monochrome'
  | 'cyberpunk'
  | 'matrix'
  | 'synthwave'
  | 'discord'
  | 'spotify'
  | 'netflix'
  | 'aurora'
  | 'volcano'
  | 'galaxy';

type ColorPresets = Record<
  ColorPreset,
  { background: string; gradient: string; textColor: string; iconColor: string }
>;

export const colorPresets: ColorPresets = {
  default: {
    background: 'bg-black',
    gradient: 'from-pink-600 via-fuchsia-600 to-purple-600',
    textColor: 'text-gray-100',
    iconColor: 'text-pink-600',
  },
  ocean: {
    background: 'bg-slate-900',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    textColor: 'text-blue-100',
    iconColor: 'text-cyan-400',
  },
  sunset: {
    background: 'bg-gray-900',
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    textColor: 'text-orange-100',
    iconColor: 'text-orange-400',
  },
  forest: {
    background: 'bg-gray-900',
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    textColor: 'text-green-100',
    iconColor: 'text-emerald-400',
  },
  fire: {
    background: 'bg-red-950',
    gradient: 'from-red-600 via-orange-500 to-yellow-500',
    textColor: 'text-yellow-100',
    iconColor: 'text-red-400',
  },
  royal: {
    background: 'bg-indigo-950',
    gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    textColor: 'text-indigo-100',
    iconColor: 'text-purple-400',
  },
  neon: {
    background: 'bg-black',
    gradient: 'from-lime-400 via-green-400 to-emerald-500',
    textColor: 'text-lime-100',
    iconColor: 'text-lime-400',
  },
  monochrome: {
    background: 'bg-gray-800',
    gradient: 'from-gray-400 via-gray-300 to-white',
    textColor: 'text-gray-100',
    iconColor: 'text-gray-300',
  },
  cyberpunk: {
    background: 'bg-black',
    gradient: 'from-cyan-400 via-purple-500 to-pink-500',
    textColor: 'text-cyan-100',
    iconColor: 'text-cyan-400',
  },
  matrix: {
    background: 'bg-black',
    gradient: 'from-green-400 via-lime-400 to-green-300',
    textColor: 'text-green-100',
    iconColor: 'text-lime-400',
  },
  synthwave: {
    background: 'bg-purple-950',
    gradient: 'from-pink-500 via-purple-500 to-cyan-400',
    textColor: 'text-pink-100',
    iconColor: 'text-pink-400',
  },
  discord: {
    background: 'bg-slate-800',
    gradient: 'from-indigo-500 via-purple-500 to-indigo-600',
    textColor: 'text-indigo-100',
    iconColor: 'text-indigo-400',
  },
  spotify: {
    background: 'bg-black',
    gradient: 'from-green-400 via-green-500 to-emerald-500',
    textColor: 'text-green-100',
    iconColor: 'text-green-400',
  },
  netflix: {
    background: 'bg-black',
    gradient: 'from-red-600 via-red-500 to-orange-500',
    textColor: 'text-red-100',
    iconColor: 'text-red-400',
  },
  aurora: {
    background: 'bg-slate-900',
    gradient: 'from-emerald-400 via-cyan-400 to-blue-500',
    textColor: 'text-cyan-100',
    iconColor: 'text-emerald-400',
  },
  volcano: {
    background: 'bg-red-950',
    gradient: 'from-orange-600 via-red-500 to-yellow-400',
    textColor: 'text-orange-100',
    iconColor: 'text-orange-400',
  },
  galaxy: {
    background: 'bg-purple-950',
    gradient: 'from-purple-600 via-blue-600 to-indigo-700',
    textColor: 'text-purple-100',
    iconColor: 'text-purple-400',
  },
} as const;
