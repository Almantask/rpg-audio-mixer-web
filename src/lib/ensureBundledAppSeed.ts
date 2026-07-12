import type { AppData } from '@/types/campaign'
import type { FxTrack, SoundscapeCategory, SoundscapeTrack } from '@/types/library'
import { createBundledFxTracks } from '@/lib/seedBundledFx'
import { createBundledSoundscapeLibrary } from '@/lib/seedBundledSoundscapes'
import {
  createDemoCampaignData,
  DEMO_CAMPAIGN_ID,
  DEMO_SCENE_SOUNDSCAPE_CATEGORY_NAMES,
  isDemoSceneConfigured,
  mergeDemoCampaignInto,
} from '@/lib/seedDemoCampaign'
import { categoryHasTracks } from '@/lib/soundscapeStorage'
import { dedupeSoundboardEntries } from '@/lib/sceneStorage'

function countAssignedTracks(category: SoundscapeCategory): number {
  return (
    (category.levels?.I?.length ?? 0) +
    (category.levels?.II?.length ?? 0) +
    (category.levels?.III?.length ?? 0)
  )
}

function isBundledSoundscapeCategory(name: string): boolean {
  return DEMO_SCENE_SOUNDSCAPE_CATEGORY_NAMES.some(
    (categoryName) => categoryName.toLowerCase() === name.toLowerCase(),
  )
}

function bundledCategoryNeedsRefresh(
  current: SoundscapeCategory,
  bundled: SoundscapeCategory,
): boolean {
  if (!categoryHasTracks(current)) {
    return true
  }
  if (!isBundledSoundscapeCategory(current.name)) {
    return false
  }
  return countAssignedTracks(bundled) > countAssignedTracks(current)
}

function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map(existing.map((item) => [item.id, item]))
  for (const item of incoming) {
    map.set(item.id, item)
  }
  return Array.from(map.values())
}

function mergeFxByName(existing: FxTrack[], incoming: FxTrack[]): FxTrack[] {
  const names = new Set(existing.map((track) => track.name.toLowerCase()))
  return [...existing, ...incoming.filter((track) => !names.has(track.name.toLowerCase()))]
}

function syncBundledFxTracks(existing: FxTrack[], bundled: FxTrack[]): { fxTracks: FxTrack[]; changed: boolean } {
  const bundledById = new Map(bundled.map((track) => [track.id, track]))
  let changed = false
  const synced = existing.map((track) => {
    const seed = bundledById.get(track.id)
    if (!seed) {
      return track
    }
    if (track.audioUrl === seed.audioUrl && track.name === seed.name) {
      return track
    }
    changed = true
    return { ...track, audioUrl: seed.audioUrl, name: seed.name }
  })
  const merged = mergeFxByName(synced, bundled)
  if (merged.length !== existing.length) {
    changed = true
  }
  return { fxTracks: merged, changed }
}

function mergeSoundscapeCategories(
  existing: SoundscapeCategory[],
  incoming: SoundscapeCategory[],
): { categories: SoundscapeCategory[]; changed: boolean } {
  const byName = new Map(existing.map((category) => [category.name.toLowerCase(), category]))
  let changed = false

  for (const category of incoming) {
    const current = byName.get(category.name.toLowerCase())
    if (!current) {
      byName.set(category.name.toLowerCase(), category)
      changed = true
      continue
    }
    if (bundledCategoryNeedsRefresh(current, category)) {
      byName.set(category.name.toLowerCase(), { ...current, ...category })
      changed = true
    }
  }

  return { categories: Array.from(byName.values()), changed }
}

function mergeBundledLibrary(
  current: AppData,
  bundledSoundscapes: ReturnType<typeof createBundledSoundscapeLibrary>,
  bundledFx: FxTrack[],
): { data: AppData; changed: boolean } {
  const mergedCategories = mergeSoundscapeCategories(
    current.soundscapeCategories,
    bundledSoundscapes.categories,
  )
  const mergedTracks = mergeById(current.soundscapeTracks ?? [], bundledSoundscapes.tracks)
  const mergedFxResult = syncBundledFxTracks(current.fxTracks, bundledFx)

  const changed =
    mergedCategories.changed ||
    mergedTracks.length !== (current.soundscapeTracks ?? []).length ||
    mergedFxResult.changed

  return {
    changed,
    data: {
      ...current,
      soundscapeCategories: mergedCategories.categories,
      soundscapeTracks: mergedTracks,
      fxTracks: mergedFxResult.fxTracks,
    },
  }
}

export function ensureBundledAppSeed(
  current: AppData,
  now = new Date().toISOString(),
): AppData | null {
  const bundledSoundscapes = createBundledSoundscapeLibrary(now)
  const bundledFx = createBundledFxTracks(now)
  const { data: merged, changed: libraryChanged } = mergeBundledLibrary(
    current,
    bundledSoundscapes,
    bundledFx,
  )
  const next = merged

  const hasDemoCampaign = next.campaigns.some(
    (campaign) => campaign.id === DEMO_CAMPAIGN_ID && !campaign.deletedAt,
  )
  const shouldEnsureDemoCampaign = !hasDemoCampaign
  const shouldRepairDemoScene =
    hasDemoCampaign &&
    !isDemoSceneConfigured(
      next.sceneSoundscapeSlots,
      next.sceneSoundboardEntries,
      next.soundscapeCategories,
      next.fxTracks,
    )

  if (!shouldEnsureDemoCampaign && !shouldRepairDemoScene) {
    const sceneSoundboardEntries = dedupeSoundboardEntries(next.sceneSoundboardEntries)
    const entriesChanged = sceneSoundboardEntries.length !== next.sceneSoundboardEntries.length
    if (!libraryChanged && !entriesChanged) {
      return null
    }
    return entriesChanged ? { ...next, sceneSoundboardEntries } : next
  }

  const demo = createDemoCampaignData(
    {
      soundscapeCategories: next.soundscapeCategories,
      soundscapeTracks: next.soundscapeTracks,
      fxTracks: next.fxTracks,
    },
    now,
  )

  return mergeDemoCampaignInto(next, demo)
}

export function hasBundledSoundscapeLibrary(categories: SoundscapeCategory[]): boolean {
  return ['Forest', 'Boss', 'Combat', 'Mystery'].every((name) =>
    categories.some(
      (category) => !category.deletedAt && category.name.toLowerCase() === name.toLowerCase(),
    ),
  )
}

export function hasBundledSoundscapeTracks(
  categories: SoundscapeCategory[],
  tracks: SoundscapeTrack[],
): boolean {
  if (!hasBundledSoundscapeLibrary(categories)) {
    return false
  }
  const trackIds = new Set(tracks.map((track) => track.id))
  return categories
    .filter((category) => ['Forest', 'Boss', 'Combat', 'Mystery'].includes(category.name))
    .every((category) => {
      const ids = [
        ...(category.levels?.I ?? []),
        ...(category.levels?.II ?? []),
        ...(category.levels?.III ?? []),
      ]
      return ids.length > 0 && ids.every((id) => trackIds.has(id))
    })
}
