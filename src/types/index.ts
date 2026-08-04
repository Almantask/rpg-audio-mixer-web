export interface Campaign {
  id: string
  name: string
  description?: string
  coverUrl?: string
  lastPlayedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  campaignId: string
  name: string
  sessionNumber: number
  date: string
  description?: string
  coverUrl?: string
  sceneIds: string[]
  lastPlayedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Scene {
  id: string
  name: string
  description?: string
  coverUrl?: string
  tags: string[]
  soundscapeCategories: SceneSoundscapeCategory[]
  soundboardTiles: SoundboardTile[]
  notes?: string
  isUserOwned?: boolean
  lastPlayedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SceneSoundscapeCategory {
  categoryId: string
  volume: number // 0 to 1
  intensity: 'I' | 'II' | 'III' | 'IV' | 'V'
  isPlaying?: boolean
  currentTrackId?: string
}

export interface SoundboardTile {
  id: string
  fxTrackId: string
  hotkey?: number
  position: number
}

export interface SoundscapeCategory {
  id: string
  name: string
  description?: string
  coverUrl?: string
  levels: {
    I: string[] // SoundscapeTrack IDs
    II: string[]
    III: string[]
    IV?: string[]
    V?: string[]
  }
  isUserOwned?: boolean
  createdAt: string
  updatedAt: string
}

export interface SoundscapeTrack {
  id: string
  title: string
  audioUrl: string
  durationSeconds?: number
  format?: string
  channels?: string
  youtubeId?: string
  createdAt: string
}

export interface FXTrack {
  id: string
  title: string
  audioUrl: string
  durationSeconds?: number
  defaultIntensity?: 'I' | 'II' | 'III'
  tags: string[]
  defaultVolume?: number
  isUserOwned?: boolean
  createdAt: string
}

export interface TrashItem {
  id: string
  entityType: 'campaign' | 'session' | 'scene' | 'soundscape' | 'fx'
  deletedAt: string
  originalData: Campaign | Session | Scene | SoundscapeCategory | FXTrack
  parentCampaignId?: string
}

export interface ActiveSceneMixerState {
  sceneId: string | null
  masterVolume: number // 0 to 1
  isMuted: boolean
  soundboardMasterVolume: number // 0 to 1
  isSessionLocked: boolean
  playingCategories: Record<string, {
    trackId: string
    intensity: string
    volume: number
  }>
  playingFX: Record<string, number> // fxTrackId -> count
}
