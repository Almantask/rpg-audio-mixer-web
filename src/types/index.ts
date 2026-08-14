export interface Campaign {
  id: string
  name: string
  description?: string
  coverUrl?: string
  lastPlayedDate?: string
  createdAt: string
}

export interface Session {
  id: string
  campaignId: string
  number: string
  name: string
  date: string
  description?: string
  coverUrl?: string
  sceneIds: string[]
  createdAt: string
  lastPlayedAt?: string
}

export interface Scene {
  id: string
  name: string
  description?: string
  coverUrl?: string
  tags: string[]
  soundscapeCategories: string[]
  effectIds: string[]
  createdAt: string
  lastPlayedAt?: string
}

export interface FXTrack {
  id: string
  title: string
  duration: string
  durationSeconds: number
  tags: string[]
  fileUrl: string
  isUserUploaded?: boolean
  defaultVolume?: number
}

export interface SoundboardEffectTile {
  id: string
  fxId: string
  title: string
  hotkey: string
  volume: number
}

export interface TrashItem {
  id: string
  type: 'campaign' | 'session' | 'scene' | 'fx'
  originalData: Campaign | Session | Scene | FXTrack
  deletedAt: string
  sessionIds?: string[] // if campaign was deleted, linked sessions
}

export interface PlayingTrackSnapshot {
  id: string
  name: string
  source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  isPlaying: boolean
}

export interface ArcanumAudioVolumes {
  master: number
  [key: string]: number
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
  }
}
