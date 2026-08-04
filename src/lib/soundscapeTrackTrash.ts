import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'

export interface SoundscapeTrackUsage {
  categoryId: string
  categoryName: string
  levels: Array<'I' | 'II' | 'III'>
  playlistOccupiesLevel: boolean
}

export function getActiveSoundscapeTracks(tracks: SoundscapeTrack[]): SoundscapeTrack[] {
  return tracks.filter((track) => !track.deletedAt)
}

export function getTrashedSoundscapeTracks(tracks: SoundscapeTrack[]): SoundscapeTrack[] {
  return tracks.filter((track) => Boolean(track.deletedAt))
}

export function findSoundscapeTrackUsage(
  trackId: string,
  categories: SoundscapeCategory[],
  track?: SoundscapeTrack,
): SoundscapeTrackUsage[] {
  const usage: SoundscapeTrackUsage[] = []

  for (const category of categories) {
    if (category.deletedAt) {
      continue
    }
    const levels = category.levels ?? { I: [], II: [], III: [] }
    const matchedLevels = (['I', 'II', 'III'] as const).filter((level) =>
      levels[level].includes(trackId),
    )
    if (matchedLevels.length === 0) {
      continue
    }
    usage.push({
      categoryId: category.id,
      categoryName: category.name,
      levels: matchedLevels,
      playlistOccupiesLevel: track?.type === 'youtube-playlist',
    })
  }

  return usage
}

export function detachTrackFromCategories(
  trackId: string,
  categories: SoundscapeCategory[],
): SoundscapeCategory[] {
  return categories.map((category) => {
    const levels = category.levels ?? { I: [], II: [], III: [] }
    const nextLevels = {
      I: levels.I.filter((id) => id !== trackId),
      II: levels.II.filter((id) => id !== trackId),
      III: levels.III.filter((id) => id !== trackId),
    }
    const changed =
      nextLevels.I.length !== levels.I.length ||
      nextLevels.II.length !== levels.II.length ||
      nextLevels.III.length !== levels.III.length
    if (!changed) {
      return category
    }
    const uniqueTrackIds = new Set([...nextLevels.I, ...nextLevels.II, ...nextLevels.III])
    return {
      ...category,
      levels: nextLevels,
      trackCount: uniqueTrackIds.size,
      defaultTrackId: category.defaultTrackId === trackId ? undefined : category.defaultTrackId,
    }
  })
}

export function humanizeAudioFileName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, '')
  return baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
