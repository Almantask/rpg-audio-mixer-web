import { db } from './db'
import { getE2EState } from './e2eState'
import type { FxTrack, FxType, IntensityLevelNumber } from './types'

function createId(): string {
  return crypto.randomUUID()
}

export interface CreateFxTrackInput {
  name: string
  duration?: string
  baseIntensity?: IntensityLevelNumber
  fxType?: FxType
  tags?: string[]
  defaultVolume?: number
  fileName?: string
}

export type FxSortOrder = 'recently-added' | 'name-asc' | 'name-desc'

export interface FxFilterOptions {
  search?: string
  fxType?: FxType | 'all'
  maxBaseIntensity?: IntensityLevelNumber
  sortOrder?: FxSortOrder
}

export async function listActiveFxTracks(): Promise<FxTrack[]> {
  const { fxLoading, fxLoadFail } = getE2EState()
  if (fxLoadFail) {
    throw new Error('Failed to load FX tracks')
  }
  if (fxLoading) {
    return []
  }
  const tracks = await db.fxTracks.filter((track) => !track.deletedAt).toArray()
  return tracks.sort((left, right) => right.createdAt - left.createdAt)
}

export async function getFxTrack(id: string): Promise<FxTrack | undefined> {
  const track = await db.fxTracks.get(id)
  if (!track || track.deletedAt) return undefined
  return track
}

export async function createFxTrack(input: CreateFxTrackInput): Promise<FxTrack> {
  const now = Date.now()
  const track: FxTrack = {
    id: createId(),
    name: input.name.trim(),
    duration: input.duration ?? '0:00',
    baseIntensity: input.baseIntensity ?? 2,
    fxType: input.fxType ?? 'IMPACT',
    tags: input.tags ?? [],
    defaultVolume: input.defaultVolume ?? 100,
    fileName: input.fileName,
    createdAt: now,
  }
  await db.fxTracks.add(track)
  return track
}

export async function updateFxTrack(
  id: string,
  input: Partial<Pick<FxTrack, 'name' | 'tags'>>,
): Promise<void> {
  await db.fxTracks.update(id, input)
}

export async function softDeleteFxTrack(id: string): Promise<void> {
  await db.fxTracks.update(id, { deletedAt: Date.now() })
  const effects = await db.sceneEffects.where('fxTrackId').equals(id).toArray()
  for (const effect of effects) {
    await db.sceneEffects.delete(effect.id)
    const count = await db.sceneEffects.where('sceneId').equals(effect.sceneId).count()
    await db.scenes.update(effect.sceneId, { effectCount: count })
  }
}

export async function restoreFxTrack(id: string): Promise<void> {
  await db.fxTracks.update(id, { deletedAt: undefined })
}

export async function listDeletedFxTracks(): Promise<FxTrack[]> {
  return db.fxTracks.filter((track) => Boolean(track.deletedAt)).toArray()
}

export function filterFxTracks(tracks: FxTrack[], options: FxFilterOptions): FxTrack[] {
  let filtered = [...tracks]
  const search = options.search?.trim().toLowerCase()
  if (search) {
    filtered = filtered.filter(
      (track) =>
        track.name.toLowerCase().includes(search) ||
        track.tags.some((tag) => tag.toLowerCase().includes(search)) ||
        track.fxType.toLowerCase().includes(search),
    )
  }
  if (options.fxType && options.fxType !== 'all') {
    filtered = filtered.filter((track) => track.fxType === options.fxType)
  }
  if (options.maxBaseIntensity) {
    filtered = filtered.filter((track) => track.baseIntensity <= options.maxBaseIntensity!)
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

export async function seedDemoFxTracks(): Promise<void> {
  const demoTracks: CreateFxTrackInput[] = [
    { name: 'Thunder Crack', duration: '0:04', baseIntensity: 3, fxType: 'IMPACT', tags: ['Impact'] },
    { name: 'Wolf Howl', duration: '0:03', baseIntensity: 2, fxType: 'CREATURE', tags: ['Creature', 'Combat'] },
    { name: 'Door Creak', duration: '0:02', baseIntensity: 1, fxType: 'AMBIENCE', tags: ['Ambience'] },
    { name: 'Sword Clash', duration: '0:02', baseIntensity: 2, fxType: 'COMBAT', tags: ['Combat'] },
    { name: 'Soft Tap', duration: '0:01', baseIntensity: 1, fxType: 'UI', tags: ['UI'] },
  ]
  for (const demo of demoTracks) {
    const existing = await db.fxTracks
      .filter((track) => track.name === demo.name && !track.deletedAt)
      .first()
    if (!existing) {
      await createFxTrack(demo)
    }
  }
}

export function formatFxMetadata(track: FxTrack): string {
  const intensity = ['I', 'II', 'III'][track.baseIntensity - 1]
  return `${track.duration} · ${intensity}`
}
