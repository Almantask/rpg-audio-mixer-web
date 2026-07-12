export interface Campaign {
  id: string
  name: string
  description?: string
  coverArtUrl?: string
  lastPlayedAt: number
  deletedAt?: number
  createdAt: number
}

export interface Session {
  id: string
  campaignId: string
  name: string
  number: number
  date: string
  description?: string
  coverArtUrl?: string
  sceneCount: number
  lastOpenedAt?: number
  deletedAt?: number
  createdAt: number
}

export interface CampaignWithSessionCount extends Campaign {
  sessionCount: number
}

export interface CreateCampaignInput {
  name: string
  description?: string
  coverArtUrl?: string
}

export interface CreateSessionInput {
  campaignId: string
  name: string
  date: string
  description?: string
  coverArtUrl?: string
}

export interface UpdateSessionInput {
  name?: string
  date?: string
  description?: string
  coverArtUrl?: string
}

export interface Scene {
  id: string
  name: string
  description?: string
  coverArtUrl?: string
  tags: string[]
  soundscapeCategoryCount: number
  effectCount: number
  masterVolume?: number
  masterMuted?: boolean
  soundboardMaster?: number
  sessionLocked?: boolean
  notes?: string
  deletedAt?: number
  createdAt: number
}

export interface CreateSceneInput {
  name: string
  description?: string
  coverArtUrl?: string
}

export interface UpdateSceneInput {
  name?: string
  description?: string
  coverArtUrl?: string
  tags?: string[]
}

export interface SessionSceneLink {
  id: string
  sessionId: string
  sceneId: string
  lastPlayedAt?: number
  createdAt: number
}

export interface SoundscapeCategory {
  id: string
  name: string
  categoryType?: string
  defaultTrackId?: string
  deletedAt?: number
  createdAt: number
}

export interface PlayStat {
  id: string
  entityType: 'soundscape' | 'fx'
  entityId: string
  playCount: number
}

export type FxType = 'IMPACT' | 'COMBAT' | 'CREATURE' | 'UI' | 'MAGIC' | 'AMBIENCE' | 'NATURE'

export interface FxTrack {
  id: string
  name: string
  duration: string
  baseIntensity: IntensityLevelNumber
  fxType: FxType
  tags: string[]
  defaultVolume: number
  fileName?: string
  deletedAt?: number
  createdAt: number
}

export type IntensityLevelNumber = 1 | 2 | 3

export interface IntensityLevel {
  id: string
  categoryId: string
  level: IntensityLevelNumber
  trackIds: string[]
}

export interface Track {
  id: string
  name: string
  format: string
  channel: string
  duration: string
  fileName?: string
  createdAt: number
}

export interface SceneSoundscape {
  id: string
  sceneId: string
  categoryId: string
  categoryName: string
  volume: number
  intensity: IntensityLevelNumber
  loadedTrackId?: string
  loadedTrackName?: string
  sortOrder: number
}

export interface SceneEffect {
  id: string
  sceneId: string
  fxTrackId?: string
  name: string
  volume: number
  sortOrder: number
}

export const PREDEFINED_FX_TAGS = [
  'Combat',
  'Creature',
  'Impact',
  'Magic',
  'UI',
  'Ambience',
] as const

export interface SceneWithStats extends Scene {
  soundscapeCategoryCount: number
  effectCount: number
}

export interface SoundscapeCategoryWithCounts extends SoundscapeCategory {
  levelICount: number
  levelIICount: number
  levelIIICount: number
}

export const PREDEFINED_SCENE_TAGS = [
  'Tavern',
  'Forest',
  'Combat',
  'City',
  'Dungeon',
  'Night',
  'Ocean',
  'Temple',
] as const
