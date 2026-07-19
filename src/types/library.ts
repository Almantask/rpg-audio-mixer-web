export type FxIntensity = 'I' | 'II' | 'III'

export type FxType =
  | 'IMPACT'
  | 'COMBAT'
  | 'CREATURE'
  | 'UI'
  | 'MAGIC'
  | 'AMBIENT'
  | 'OTHER'

export interface FxTrack {
  id: string
  name: string
  durationSeconds: number
  baseIntensity: FxIntensity
  type: FxType
  tags: string[]
  audioUrl: string
  thumbnailUrl?: string
  defaultVolume: number
  createdAt: string
  deletedAt?: string
}

export interface SoundscapeTrack {
  id: string
  name: string
  durationSeconds: number
  format: string
  channels: string
  audioUrl: string
  createdAt: string
  deletedAt?: string
  type?: 'local' | 'youtube' | 'youtube-playlist'
  youtubeId?: string
  playlistVideos?: { youtubeId: string; name: string; durationSeconds: number }[]
  isOfflineReady?: boolean
}

export interface SoundscapeCategory {
  id: string
  name: string
  trackCount: number
  createdAt?: string
  deletedAt?: string
  defaultTrackId?: string
  levels?: {
    I: string[]
    II: string[]
    III: string[]
  }
  type?: string
}

