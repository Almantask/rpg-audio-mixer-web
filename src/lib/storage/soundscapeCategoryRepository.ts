import { db } from './db'
import { getE2EState } from './e2eState'
import type { IntensityLevel, SoundscapeCategory, SoundscapeCategoryWithCounts } from './types'

function createId(): string {
  return crypto.randomUUID()
}

async function createIntensityLevels(categoryId: string): Promise<void> {
  const levels: IntensityLevel[] = [1, 2, 3].map((level) => ({
    id: createId(),
    categoryId,
    level: level as 1 | 2 | 3,
    trackIds: [],
  }))
  await db.intensityLevels.bulkAdd(levels)
}

async function getLevelCounts(categoryId: string): Promise<{
  levelICount: number
  levelIICount: number
  levelIIICount: number
}> {
  const levels = await db.intensityLevels.where('categoryId').equals(categoryId).toArray()
  const byLevel = new Map(levels.map((level) => [level.level, level.trackIds.length]))
  return {
    levelICount: byLevel.get(1) ?? 0,
    levelIICount: byLevel.get(2) ?? 0,
    levelIIICount: byLevel.get(3) ?? 0,
  }
}

export async function listActiveCategories(): Promise<SoundscapeCategoryWithCounts[]> {
  const { soundscapesLoadFail } = getE2EState()
  if (soundscapesLoadFail) {
    throw new Error('Failed to load soundscape categories')
  }

  const categories = await db.soundscapeCategories
    .filter((category) => !category.deletedAt)
    .toArray()

  const withCounts = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      ...(await getLevelCounts(category.id)),
    })),
  )

  return withCounts.sort((left, right) => right.createdAt - left.createdAt)
}

export async function getCategory(id: string): Promise<SoundscapeCategory | undefined> {
  const category = await db.soundscapeCategories.get(id)
  if (!category || category.deletedAt) return undefined
  return category
}

export async function createCategory(name: string): Promise<SoundscapeCategory> {
  const now = Date.now()
  const category: SoundscapeCategory = {
    id: createId(),
    name: name.trim(),
    createdAt: now,
  }
  await db.soundscapeCategories.add(category)
  await createIntensityLevels(category.id)
  return category
}

export async function softDeleteCategory(id: string): Promise<void> {
  await db.soundscapeCategories.update(id, { deletedAt: Date.now() })
}

export async function restoreCategory(id: string): Promise<void> {
  await db.soundscapeCategories.update(id, { deletedAt: undefined })
}

export async function listDeletedCategories(): Promise<SoundscapeCategory[]> {
  return db.soundscapeCategories.filter((category) => Boolean(category.deletedAt)).toArray()
}

export function formatIntensityBreakdown(category: SoundscapeCategoryWithCounts): string {
  return `I: ${category.levelICount} · II: ${category.levelIICount} · III: ${category.levelIIICount}`
}

export async function getCategoryWithCounts(
  id: string,
): Promise<SoundscapeCategoryWithCounts | undefined> {
  const category = await getCategory(id)
  if (!category) return undefined
  return {
    ...category,
    ...(await getLevelCounts(id)),
  }
}

export async function getIntensityLevels(categoryId: string): Promise<IntensityLevel[]> {
  const levels = await db.intensityLevels.where('categoryId').equals(categoryId).toArray()
  return levels.sort((left, right) => left.level - right.level)
}

export async function addTrackToLevel(
  categoryId: string,
  level: 1 | 2 | 3,
  trackId: string,
): Promise<void> {
  const intensityLevel = await db.intensityLevels
    .where('categoryId')
    .equals(categoryId)
    .filter((item) => item.level === level)
    .first()
  if (!intensityLevel) return
  if (intensityLevel.trackIds.includes(trackId)) return
  await db.intensityLevels.update(intensityLevel.id, {
    trackIds: [...intensityLevel.trackIds, trackId],
  })
}

export async function removeTrackFromLevel(
  categoryId: string,
  level: 1 | 2 | 3,
  trackId: string,
): Promise<void> {
  const intensityLevel = await db.intensityLevels
    .where('categoryId')
    .equals(categoryId)
    .filter((item) => item.level === level)
    .first()
  if (!intensityLevel) return
  await db.intensityLevels.update(intensityLevel.id, {
    trackIds: intensityLevel.trackIds.filter((id) => id !== trackId),
  })
}

export async function getTracksForLevel(
  categoryId: string,
  level: 1 | 2 | 3,
): Promise<string[]> {
  const intensityLevel = await db.intensityLevels
    .where('categoryId')
    .equals(categoryId)
    .filter((item) => item.level === level)
    .first()
  return intensityLevel?.trackIds ?? []
}

export function filterCategoriesByName(
  categories: SoundscapeCategoryWithCounts[],
  query: string,
): SoundscapeCategoryWithCounts[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return categories
  return categories.filter((category) => category.name.toLowerCase().includes(normalized))
}

export type CategorySortOrder = 'recently-added' | 'name-asc' | 'name-desc'

export interface CategoryFilterOptions {
  search?: string
  categoryType?: string | 'all'
  sortOrder?: CategorySortOrder
}

export function filterCategories(
  categories: SoundscapeCategoryWithCounts[],
  options: CategoryFilterOptions,
): SoundscapeCategoryWithCounts[] {
  let filtered = [...categories]
  const search = options.search?.trim().toLowerCase()
  if (search) {
    filtered = filtered.filter((category) => category.name.toLowerCase().includes(search))
  }
  if (options.categoryType && options.categoryType !== 'all') {
    filtered = filtered.filter((category) => category.categoryType === options.categoryType)
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

export async function seedDemoCategories(): Promise<void> {
  const demoNames: Array<{ name: string; categoryType: string }> = [
    { name: 'Weather', categoryType: 'Ambience' },
    { name: 'Interior', categoryType: 'Interior' },
    { name: 'Monsters', categoryType: 'Combat' },
  ]
  for (const demo of demoNames) {
    const existing = await db.soundscapeCategories
      .filter((item) => item.name === demo.name && !item.deletedAt)
      .first()
    if (!existing) {
      const category = await createCategory(demo.name)
      await db.soundscapeCategories.update(category.id, { categoryType: demo.categoryType })
    }
  }
}
