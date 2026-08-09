export interface Campaign {
  id: string
  name: string
  description?: string
  coverArt?: string
  createdAt: string
  lastPlayedAt: string
  deletedAt?: string | null
}

export interface Session {
  id: string
  campaignId: string
  sessionNumber: number
  name: string
  date: string
  coverArt?: string
  description?: string
  lastActiveAt?: string
  deletedAt?: string | null
}

export interface Scene {
  id: string
  name: string
  description?: string
  coverImage?: string
  tags: string[]
  createdAt: string
  lastPlayedAt?: string
  deletedAt?: string | null
}

export interface SessionSceneLink {
  sessionId: string
  sceneId: string
  lastPlayedAt?: string
}

export interface FXTrack {
  id: string
  name: string
  duration: string // formatted e.g. "0:04"
  durationSeconds: number
  intensityLevel: 'I' | 'II' | 'III'
  tags: string[]
  audioUrl?: string
  defaultVolume?: number
  deletedAt?: string | null
}

export interface SoundscapeCategory {
  id: string
  name: string
  description?: string
  intensityBreakdown: { level1: number; level2: number; level3: number }
  tracks: Array<{
    id: string
    name: string
    level: 'I' | 'II' | 'III'
    audioUrl?: string
  }>
  deletedAt?: string | null
}

export interface SoundboardTile {
  id: string
  sceneId: string
  fxTrackId: string
  name: string
  icon?: string
  hotkey?: string
  position: number
}

export interface PlayingTrackSnapshot {
  id: string
  trackName: string
  categoryName?: string
  source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  state: 'playing' | 'paused' | 'stopped'
}

export interface ArcanumAudioVolumes {
  master: number
  soundboardMaster: number
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
    __ARCANUM_STORE__?: Record<string, unknown>
    __ARCANUM_RESET_DATA__?: () => void
    __ARCANUM_SEED_DATA__?: (data: unknown) => void
    __ARCANUM_AUDIO_PROBE__?: () => { isPlaying: boolean; signalLevel: number; hasSignal: boolean }
  }
}
