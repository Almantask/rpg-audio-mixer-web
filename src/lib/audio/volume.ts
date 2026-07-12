/** Cubic volume curve: slider percent → linear gain (0–1). */
export function percentToGain(percent: number): number {
  const normalized = Math.max(0, Math.min(100, percent)) / 100
  return normalized ** 3
}

/** Master × category volume using cubic mapping on each axis. */
export function mappedVolume(masterPercent: number, categoryPercent: number): number {
  return percentToGain(masterPercent) * percentToGain(categoryPercent)
}

export const DUCK_RATIO = 0.4
export const MAX_LOOPING_CATEGORIES = 10
export const MAX_FX_INSTANCES = 5
export const MAX_FX_INSTANCES_PER_EFFECT = 5
export const CROSSFADE_SECONDS = 2
export const STOP_FADE_SECONDS = 0.5
