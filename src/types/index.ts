export interface Campaign {
  id: string
  name: string
  description?: string
  createdAt: string
  deletedAt?: string | null
}

export interface Session {
  id: string
  campaignId: string
  name: string
  number?: number | string
  description?: string
  createdAt: string
  deletedAt?: string | null
}

export interface Scene {
  id: string
  name: string
  description?: string
  tags: string[]
  soundscapeCategoryIds: string[]
  soundboardFxIds: string[]
  isUserOwned?: boolean
  createdAt: string
  deletedAt?: string | null
}

export interface SessionScene {
  sessionId: string
  sceneId: string
  linkedAt: string
  lastActiveAt?: string | null
}

export interface FxTrack {
  id: string
  name: string
  category?: string
  tags: string[]
  audioUrl: string
  durationSeconds: number
  deletedAt?: string | null
}

export interface SoundscapeTrack {
  id: string
  name: string
  youtubeId?: string
  audioUrl?: string
  durationSeconds?: number
}

export interface SoundscapeCategory {
  id: string
  name: string
  description?: string
  tags: string[]
  tracks: {
    level1: SoundscapeTrack[]
    level2: SoundscapeTrack[]
    level3: SoundscapeTrack[]
  }
  deletedAt?: string | null
}
