export interface PlayingTrackSnapshot {
  name: string
  source?: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  playing: boolean
  paused?: boolean
  volume?: number
}

export interface ArcanumAudioState {
  isPlaying: boolean
  trackName?: string
  source?: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  playingTracks?: PlayingTrackSnapshot[]
  volumes?: Record<string, number>
  peakLevel?: number
  rmsLevel?: number
}

declare global {
  interface Window {
    __ARCANUM_AUDIO_STATE__?: ArcanumAudioState
  }
}

let currentState: ArcanumAudioState = {
  isPlaying: false,
  playingTracks: [],
  volumes: {},
  peakLevel: 0,
  rmsLevel: 0,
}

export function publishAudioState(update: Partial<ArcanumAudioState>): ArcanumAudioState {
  const playingTracks = update.playingTracks ?? currentState.playingTracks ?? []
  const isPlaying = update.isPlaying ?? playingTracks.some((t) => t.playing)
  
  currentState = {
    ...currentState,
    ...update,
    isPlaying,
    playingTracks,
  }

  if (typeof window !== 'undefined') {
    window.__ARCANUM_AUDIO_STATE__ = currentState
  }

  return currentState
}

export function getAudioState(): ArcanumAudioState {
  if (typeof window !== 'undefined' && window.__ARCANUM_AUDIO_STATE__) {
    return window.__ARCANUM_AUDIO_STATE__
  }
  return currentState
}

export function resetAudioState(): void {
  currentState = {
    isPlaying: false,
    playingTracks: [],
    volumes: {},
    peakLevel: 0,
    rmsLevel: 0,
  }
  if (typeof window !== 'undefined') {
    window.__ARCANUM_AUDIO_STATE__ = currentState
  }
}
