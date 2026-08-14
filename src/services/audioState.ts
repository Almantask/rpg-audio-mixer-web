export interface PlayingTrackSnapshot {
  id: string
  name: string
  source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  volume: number
  isLooping?: boolean
  categoryName?: string
}

export interface ArcanumAudioVolumes {
  master: number
  soundboardMaster: number
  soundscapeMaster: number
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

export function publishAudioState(state: Partial<ArcanumAudioState>): void {
  if (typeof window === 'undefined') return
  window.__ARCANUM_AUDIO_STATE__ = {
    isPlaying: false,
    playingTracks: [],
    volumes: { master: 1, soundboardMaster: 1, soundscapeMaster: 1 },
    ...window.__ARCANUM_AUDIO_STATE__,
    ...state,
  }
}

export function getAudioState(): ArcanumAudioState {
  if (typeof window === 'undefined') {
    return { isPlaying: false, playingTracks: [], volumes: { master: 1, soundboardMaster: 1, soundscapeMaster: 1 } }
  }
  if (!window.__ARCANUM_AUDIO_STATE__) {
    publishAudioState({})
  }
  return window.__ARCANUM_AUDIO_STATE__!
}
