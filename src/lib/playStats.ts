import type { PlayStats } from '@/types/campaign'
import type { FxTrack, SoundscapeCategory } from '@/types/library'

export function getTopSoundscapeCategory(
  playStats: PlayStats,
  categories: SoundscapeCategory[],
): { category: SoundscapeCategory; count: number } | null {
  const active = categories.filter((item) => !item.deletedAt)
  let top: { category: SoundscapeCategory; count: number } | null = null

  for (const category of active) {
    const count = playStats.soundscapeCategories[category.id] ?? 0
    if (count <= 0) {
      continue
    }
    if (!top || count > top.count) {
      top = { category, count }
    }
  }

  return top
}

export function getTopFxTrack(
  playStats: PlayStats,
  fxTracks: FxTrack[],
): { track: FxTrack; count: number } | null {
  const active = fxTracks.filter((item) => !item.deletedAt)
  let top: { track: FxTrack; count: number } | null = null

  for (const track of active) {
    const count = playStats.fxTracks[track.id] ?? 0
    if (count <= 0) {
      continue
    }
    if (!top || count > top.count) {
      top = { track, count }
    }
  }

  return top
}

export function incrementSoundscapePlayCount(
  playStats: PlayStats,
  categoryId: string,
): PlayStats {
  return {
    ...playStats,
    soundscapeCategories: {
      ...playStats.soundscapeCategories,
      [categoryId]: (playStats.soundscapeCategories[categoryId] ?? 0) + 1,
    },
  }
}

export function incrementFxPlayCount(playStats: PlayStats, fxTrackId: string): PlayStats {
  return {
    ...playStats,
    fxTracks: {
      ...playStats.fxTracks,
      [fxTrackId]: (playStats.fxTracks[fxTrackId] ?? 0) + 1,
    },
  }
}

export function resolveCategoryPreviewTrackId(
  category: SoundscapeCategory,
): string | undefined {
  if (category.defaultTrackId) {
    return category.defaultTrackId
  }
  const levels = category.levels
  if (!levels) {
    return undefined
  }
  for (const level of ['I', 'II', 'III'] as const) {
    const trackId = levels[level][0]
    if (trackId) {
      return trackId
    }
  }
  return undefined
}
