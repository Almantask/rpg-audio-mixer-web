import type { SoundscapeCategoryWithCounts } from '@/lib/storage/types'

export function getCategoryTrackStats(category: SoundscapeCategoryWithCounts): {
  trackCount: number
  layerCount: number
} {
  const counts = [category.levelICount, category.levelIICount, category.levelIIICount]
  return {
    trackCount: counts.reduce((sum, count) => sum + count, 0),
    layerCount: counts.filter((count) => count > 0).length,
  }
}

export function categoryHasTracks(category: SoundscapeCategoryWithCounts): boolean {
  return getCategoryTrackStats(category).trackCount > 0
}

export type SoundscapeSortOrder = 'recently-added' | 'name-asc' | 'name-desc'

export interface SoundscapePickerFilterOptions {
  search?: string
  categoryType?: string
  sortOrder?: SoundscapeSortOrder
}

export function filterPickerCategories(
  categories: SoundscapeCategoryWithCounts[],
  options: SoundscapePickerFilterOptions,
): SoundscapeCategoryWithCounts[] {
  let filtered = categories.filter(categoryHasTracks)
  const search = options.search?.trim().toLowerCase()
  if (search) {
    filtered = filtered.filter((category) => category.name.toLowerCase().includes(search))
  }
  if (options.categoryType && options.categoryType !== 'all') {
    filtered = filtered.filter(
      (category) => (category.categoryType ?? 'Ambience') === options.categoryType,
    )
  }
  const sortOrder = options.sortOrder ?? 'recently-added'
  if (sortOrder === 'name-asc') {
    filtered.sort((left, right) => left.name.localeCompare(right.name))
  } else if (sortOrder === 'name-desc') {
    filtered.sort((left, right) => right.name.localeCompare(left.name))
  } else {
    filtered.sort((left, right) => right.createdAt - left.createdAt)
  }
  return filtered
}
