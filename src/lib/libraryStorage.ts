import type { FxIntensity, FxTrack, FxType } from '@/types/library'

export interface FxFilterOptions {
  search?: string
  type?: FxType | 'ALL'
  maxIntensity?: FxIntensity
  sort?: 'recent' | 'name' | 'duration'
}

const INTENSITY_RANK: Record<FxIntensity, number> = {
  I: 1,
  II: 2,
  III: 3,
}

export function getActiveFxTracks(tracks: FxTrack[]): FxTrack[] {
  return tracks.filter((track) => !track.deletedAt)
}

export function getTrashedFxTracks(tracks: FxTrack[]): FxTrack[] {
  return tracks.filter((track) => track.deletedAt)
}

export function filterFxTracks(tracks: FxTrack[], options: FxFilterOptions): FxTrack[] {
  let filtered = getActiveFxTracks(tracks)

  if (options.search?.trim()) {
    const query = options.search.trim().toLowerCase()
    filtered = filtered.filter(
      (track) =>
        track.name.toLowerCase().includes(query) ||
        track.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  if (options.type && options.type !== 'ALL') {
    filtered = filtered.filter((track) => track.type === options.type)
  }

  if (options.maxIntensity) {
    const maxRank = INTENSITY_RANK[options.maxIntensity]
    filtered = filtered.filter((track) => INTENSITY_RANK[track.baseIntensity] <= maxRank)
  }

  switch (options.sort) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'duration':
      filtered.sort((a, b) => b.durationSeconds - a.durationSeconds)
      break
    case 'recent':
    default:
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
  }

  return filtered
}

export function getFxTypeLabel(type: FxType): string {
  return type
}
