import { Color } from 'src/domain/models/session'

export const projectColors: Record<Color, { base: string; hover: string; accent: string }> = {
  red: {
    base: 'bg-red-950 text-white',
    hover: 'transition-colors hover:bg-red-900',
    accent: 'bg-red-500'
  },
  orange: {
    base: 'bg-orange-950 text-white',
    hover: 'transition-colors hover:bg-orange-900',
    accent: 'bg-orange-500'
  },
  amber: {
    base: 'bg-amber-950 text-white',
    hover: 'transition-colors hover:bg-amber-900',
    accent: 'bg-amber-500'
  },
  yellow: {
    base: 'bg-yellow-950 text-white',
    hover: 'transition-colors hover:bg-yellow-900',
    accent: 'bg-yellow-500'
  },
  lime: {
    base: 'bg-lime-950 text-white',
    hover: 'transition-colors hover:bg-lime-900',
    accent: 'bg-lime-500'
  },
  green: {
    base: 'bg-green-950 text-white',
    hover: 'transition-colors hover:bg-green-900',
    accent: 'bg-green-500'
  },
  emerald: {
    base: 'bg-emerald-950 text-white',
    hover: 'transition-colors hover:bg-emerald-900',
    accent: 'bg-emerald-500'
  },
  teal: {
    base: 'bg-teal-950 text-white',
    hover: 'transition-colors hover:bg-teal-900',
    accent: 'bg-teal-500'
  },
  cyan: {
    base: 'bg-cyan-950 text-white',
    hover: 'transition-colors hover:bg-cyan-900',
    accent: 'bg-cyan-500'
  },
  sky: {
    base: 'bg-sky-950 text-white',
    hover: 'transition-colors hover:bg-sky-900',
    accent: 'bg-sky-500'
  },
  blue: {
    base: 'bg-blue-950 text-white',
    hover: 'transition-colors hover:bg-blue-900',
    accent: 'bg-blue-500'
  },
  indigo: {
    base: 'bg-indigo-950 text-white',
    hover: 'transition-colors hover:bg-indigo-900',
    accent: 'bg-indigo-500'
  },
  violet: {
    base: 'bg-violet-950 text-white',
    hover: 'transition-colors hover:bg-violet-900',
    accent: 'bg-violet-500'
  },
  purple: {
    base: 'bg-purple-950 text-white',
    hover: 'transition-colors hover:bg-purple-900',
    accent: 'bg-purple-500'
  },
  fuchsia: {
    base: 'bg-fuchsia-950 text-white',
    hover: 'transition-colors hover:bg-fuchsia-900',
    accent: 'bg-fuchsia-500'
  },
  pink: {
    base: 'bg-pink-950 text-white',
    hover: 'transition-colors hover:bg-pink-900',
    accent: 'bg-pink-500'
  },
  rose: {
    base: 'bg-rose-950 text-white',
    hover: 'transition-colors hover:bg-rose-900',
    accent: 'bg-rose-500'
  }
}
