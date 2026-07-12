import type { IntensityLevelNumber } from '@/lib/storage/types'

export type PlaybackStatus = 'idle' | 'playing' | 'paused'

export interface LoopSlot {
  sceneSoundscapeId: string
  categoryId: string
  categoryName: string
  trackId: string
  trackName: string
  intensityLevel: IntensityLevelNumber
  status: PlaybackStatus
  startedAt: number
  progress: number
}

export interface FxInstance {
  id: string
  effectName: string
  startedAt: number
}

export interface CategoryPlaybackState {
  categoryName: string
  status: PlaybackStatus
  trackId?: string
  trackName?: string
  intensityLevel: IntensityLevelNumber
  progress: number
  gain: number
  ducked: boolean
}

export interface EffectPlaybackState {
  effectName: string
  instanceCount: number
  playing: boolean
  gain: number
}

export interface EngineSnapshot {
  loops: CategoryPlaybackState[]
  effects: EffectPlaybackState[]
  masterVolume: number
  masterMuted: boolean
  soundboardMaster: number
  duckActive: boolean
  activeFxCount: number
  activeLoopCount: number
}
