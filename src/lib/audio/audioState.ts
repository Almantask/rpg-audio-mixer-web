import type { ArcanumAudioState, ArcanumAudioVolumes } from '../types'

let currentState: ArcanumAudioState = {
  isPlaying: false,
  trackName: undefined,
  source: undefined,
  playingTracks: [],
  volumes: {
    master: 1,
    soundboardMaster: 0.85,
    soundscapesMaster: 1,
  },
}

const listeners = new Set<(state: ArcanumAudioState) => void>()

export function getAudioState(): ArcanumAudioState {
  return currentState
}

export function subscribeAudioState(listener: (state: ArcanumAudioState) => void): () => void {
  listeners.add(listener)
  listener(currentState)
  return () => {
    listeners.delete(listener)
  }
}

export function publishAudioState(partial: Partial<ArcanumAudioState>): void {
  currentState = {
    ...currentState,
    ...partial,
    volumes: partial.volumes ? { ...currentState.volumes, ...partial.volumes } as ArcanumAudioVolumes : currentState.volumes,
    playingTracks: partial.playingTracks ?? currentState.playingTracks,
  }

  // Update window object for test and QA state inspection
  if (typeof window !== 'undefined') {
    window.__ARCANUM_AUDIO_STATE__ = currentState
  }

  for (const listener of listeners) {
    listener(currentState)
  }
}

export function updateTrackVolumeSnapshot(volumes: Partial<ArcanumAudioVolumes>): void {
  publishAudioState({
    volumes: {
      ...currentState.volumes,
      ...volumes,
    } as ArcanumAudioVolumes,
  })
}

export function resetAudioState(): void {
  publishAudioState({
    isPlaying: false,
    trackName: undefined,
    source: undefined,
    playingTracks: [],
  })
}
