import type { ArcanumAudioState, PlayingTrackSnapshot } from '../types'

let currentState: ArcanumAudioState = {
  isPlaying: false,
  playingTracks: [],
  volumes: { master: 1 },
}

export function getAudioState(): ArcanumAudioState {
  return currentState
}

export function publishAudioState(newState: Partial<ArcanumAudioState>): void {
  currentState = {
    ...currentState,
    ...newState,
  }
  if (typeof window !== 'undefined') {
    window.__ARCANUM_AUDIO_STATE__ = currentState
  }
}

export function updateTrackPlayingState(
  id: string,
  name: string,
  source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home',
  isPlaying: boolean,
): void {
  const existingTracks = currentState.playingTracks || []
  let updatedTracks: PlayingTrackSnapshot[] = []

  if (isPlaying) {
    // Replace or add track
    updatedTracks = [
      ...existingTracks.filter((t) => t.id !== id),
      { id, name, source, isPlaying: true },
    ]
  } else {
    updatedTracks = existingTracks.filter((t) => t.id !== id)
  }

  const activeTrack = updatedTracks[updatedTracks.length - 1]

  publishAudioState({
    isPlaying: updatedTracks.length > 0,
    trackName: activeTrack ? activeTrack.name : undefined,
    source: activeTrack ? activeTrack.source : undefined,
    playingTracks: updatedTracks,
  })
}

export function stopAllAudioState(): void {
  publishAudioState({
    isPlaying: false,
    trackName: undefined,
    source: undefined,
    playingTracks: [],
  })
}
