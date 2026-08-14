export interface Campaign {
  id: string
  name: string
  description?: string
  coverArt?: string
  createdAt: string
  updatedAt?: string
  lastPlayedAt?: string
  isDeleted?: boolean
  deletedAt?: string
}

export interface Session {
  id: string
  campaignId: string
  sessionNumber: number
  name: string
  date: string
  description?: string
  coverArt?: string
  createdAt: string
  updatedAt?: string
  lastOpenedAt?: string
  isDeleted?: boolean
  deletedAt?: string
}

export interface SoundboardEffect {
  id: string
  fxTrackId: string
  name: string
  hotkeyLabel?: string
  orderIndex?: number
  order?: number
  color?: string
  icon?: string
}

export interface Scene {
  id: string
  name: string
  description?: string
  coverImage?: string
  tags: string[]
  soundscapeCategoryIds: string[]
  soundboardEffects: SoundboardEffect[]
  sessionIds: string[]
  soundboardMasterVolume: number
  soundscapesMasterVolume?: number
  createdAt: string
  updatedAt?: string
  lastPlayedAt?: string
  isDeleted?: boolean
  deletedAt?: string
}

export interface FxTrack {
  id: string
  name: string
  fileName?: string
  tags: string[]
  duration: string
  durationSeconds: number
  intensity?: 'I' | 'II' | 'III'
  url: string
  defaultVolume?: number
  createdAt?: string
  isDeleted?: boolean
  deletedAt?: string
}

export interface SoundscapeCategory {
  id: string
  name: string
  description?: string
  tags: string[]
  isDeleted?: boolean
  deletedAt?: string
  tracks: {
    id: string
    name: string
    url: string
    durationSeconds: number
    level: 'I' | 'II' | 'III'
  }[]
}

export type TrashEntityType = 'campaign' | 'session' | 'scene' | 'soundscape' | 'fx'

export interface TrashItem {
  id: string
  entityType: TrashEntityType
  title: string
  originalId: string
  deletedAt: string
  expiresAt: string
  data: unknown
}

export interface PlayingTrackSnapshot {
  trackId?: string
  trackName: string
  source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  instanceId?: string
  startTime?: number
  durationSeconds?: number
  duration?: number
  elapsed?: number
  isLooping?: boolean
  volume?: number
}

export interface ArcanumAudioVolumes {
  master: number
  soundboardMaster: number
  soundscapesMaster: number
}

export interface ArcanumAudioState {
  isPlaying: boolean
  trackName?: string
  source?: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  playingTracks?: PlayingTrackSnapshot[]
  volumes?: ArcanumAudioVolumes
}

declare global {
  interface Window {
    __ARCANUM_AUDIO_STATE__?: ArcanumAudioState
    __ARCANUM_AUDIO_ENGINE__?: unknown
  }
}
