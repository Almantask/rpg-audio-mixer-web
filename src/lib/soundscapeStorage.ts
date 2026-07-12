import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'

export interface SoundscapeCategoryFilterOptions {
  search?: string
  type?: string
  sort?: 'recent' | 'name'
}

export function getActiveSoundscapeCategories(categories: SoundscapeCategory[]): SoundscapeCategory[] {
  return categories.filter((category) => !category.deletedAt)
}

export function categoryHasTracks(category: SoundscapeCategory): boolean {
  if ((category.trackCount ?? 0) > 0) {
    return true
  }
  if (!category.levels) {
    return false
  }
  return Object.values(category.levels).some((trackIds) => (trackIds?.length ?? 0) > 0)
}

export function getCategoryLayerCount(category: SoundscapeCategory): number {
  if (!category.levels) {
    return (category.trackCount ?? 0) > 0 ? 1 : 0
  }
  return (['I', 'II', 'III'] as const).filter((level) => (category.levels?.[level]?.length ?? 0) > 0).length
}

export function getCategorySampleTrack(
  category: SoundscapeCategory,
  tracks: SoundscapeTrack[],
): SoundscapeTrack | undefined {
  const trackIds = category.levels
    ? [...(category.levels.II ?? []), ...(category.levels.I ?? []), ...(category.levels.III ?? [])]
    : []
  const firstId = trackIds[0]
  if (firstId) {
    return tracks.find((track) => track.id === firstId)
  }
  return tracks[0]
}

export function filterSoundscapeCategories(
  categories: SoundscapeCategory[],
  options: SoundscapeCategoryFilterOptions,
): SoundscapeCategory[] {
  let filtered = getActiveSoundscapeCategories(categories).filter(categoryHasTracks)

  if (options.search?.trim()) {
    const query = options.search.trim().toLowerCase()
    filtered = filtered.filter((category) => category.name.toLowerCase().includes(query))
  }

  if (options.type && options.type !== 'ALL') {
    filtered = filtered.filter((category) => category.type === options.type)
  }

  if (options.sort === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  }

  return filtered
}

export function filterSoundscapeCategoriesForBrowse(
  categories: SoundscapeCategory[],
  options: SoundscapeCategoryFilterOptions,
): SoundscapeCategory[] {
  let filtered = getActiveSoundscapeCategories(categories)

  if (options.search?.trim()) {
    const query = options.search.trim().toLowerCase()
    filtered = filtered.filter((category) => category.name.toLowerCase().includes(query))
  }

  if (options.type && options.type !== 'ALL') {
    filtered = filtered.filter((category) => category.type === options.type)
  }

  switch (options.sort) {
    case 'name':
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'recent':
    default:
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      )
      break
  }

  return filtered
}
