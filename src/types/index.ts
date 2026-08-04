export interface Campaign {
  id: string
  name: string
  system?: string
  description?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface Session {
  id: string
  campaignId: string
  title: string
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface Scene {
  id: string
  name: string
  description?: string
  tags: string[]
  isUserOwned: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface SessionSceneLink {
  id: string
  sessionId: string
  sceneId: string
  linkedAt: string
  lastPlayedAt?: string
}

export interface FxTrack {
  id: string
  name: string
  category: string
  tags: string[]
  durationSeconds: number
  audioUrl: string
  isUserOwned: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface SoundscapeTrack {
  id: string
  name: string
  tags: string[]
  audioUrl: string
  durationSeconds: number
}

export interface SoundscapeCategory {
  id: string
  name: string
  description?: string
  tags: string[]
  level1TrackIds: string[]
  level2TrackIds: string[]
  level3TrackIds: string[]
  isUserOwned: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface ActiveSceneSoundboardItem {
  id: string
  sceneId: string
  fxTrackId: string
  customName?: string
  order: number
}

export interface ActiveSceneSoundscapeItem {
  id: string
  sceneId: string
  categoryId: string
  volume: number // 0 to 100
  intensityLevel: 1 | 2 | 3
  isMuted: boolean
  isSolo: boolean
  order: number
}

export interface SceneMixerState {
  sceneId: string
  masterVolume: number // 0 to 100
  categories: Record<string, { volume: number; intensityLevel: 1 | 2 | 3; isMuted: boolean; isSolo: boolean }>
}

export type EntityType = 'campaign' | 'session' | 'scene' | 'soundscape' | 'fx'

export interface TrashItem {
  id: string
  entityType: EntityType
  entityId: string
  name: string
  deletedAt: string
  expiresAt: string // 7 days from deletedAt
  payload: Campaign | Session | Scene | SoundscapeCategory | FxTrack
}
