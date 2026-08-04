export type IntensityLevel = 'I' | 'II' | 'III'

export interface Campaign {
  id: string
  name: string
  description?: string
  coverArt?: string
  lastPlayedAt?: number
  createdAt: number
}

export interface Session {
  id: string
  campaignId: string
  name: string
  sessionNumber: number
  date: string
  coverArt?: string
  description?: string
  lastOpenedAt?: number
  createdAt: number
}

export interface Scene {
  id: string
  name: string // Location name
  description?: string
  backgroundImage?: string
  tags: string[]
  createdAt: number
  lastPlayedAt?: number
}

export interface SessionScene {
  sessionId: string
  sceneId: string
  linkedAt: number
  lastPlayedAt?: number
}

export interface SoundscapeTrack {
  id: string
  title: string
  url: string
  format?: string
  channel?: string
  durationSeconds?: number
}

export interface SoundscapeCategory {
  id: string
  name: string
  thumbnail?: string
  tracksByLevel: Record<IntensityLevel, SoundscapeTrack[]>
  createdAt: number
}

export interface SceneSoundscape {
  sceneId: string
  categoryId: string
  volume: number // 0 - 1
  intensity: IntensityLevel
  order: number
}

export interface FXTrack {
  id: string
  name: string
  url: string
  durationSeconds: number
  intensity: IntensityLevel
  tags: string[]
}

export interface SoundboardItem {
  id: string
  sceneId: string
  fxTrackId: string
  order: number
}

export type TrashEntityType = 'campaign' | 'session' | 'scene' | 'soundscape' | 'fx'

export interface TrashItem {
  id: string
  entityId: string
  entityType: TrashEntityType
  title: string
  deletedAt: number
  expiresAt: number
  payload: Record<string, unknown>
}
