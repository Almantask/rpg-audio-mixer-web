import type { ArcanumAudioState, PlayingTrackSnapshot, ArcanumAudioVolumes } from '../types'

let currentState: ArcanumAudioState = {
  isPlaying: false,
  playingTracks: [],
  volumes: {
    master: 100,
    soundboardMaster: 85,
  },
}

export function getAudioState(): ArcanumAudioState {
  return currentState
}

export function publishAudioState(newState: Partial<ArcanumAudioState>): ArcanumAudioState {
  const currentVols: ArcanumAudioVolumes = currentState.volumes ?? { master: 100, soundboardMaster: 85 }
  const newVols: Partial<ArcanumAudioVolumes> = newState.volumes ?? {}
  const volumes: ArcanumAudioVolumes = {
    master: typeof newVols.master === 'number' ? newVols.master : currentVols.master,
    soundboardMaster: typeof newVols.soundboardMaster === 'number' ? newVols.soundboardMaster : currentVols.soundboardMaster,
  }

  currentState = {
    ...currentState,
    ...newState,
    playingTracks: newState.playingTracks ?? currentState.playingTracks ?? [],
    volumes,
    isPlaying:
      newState.isPlaying !== undefined
        ? newState.isPlaying
        : (newState.playingTracks ?? currentState.playingTracks ?? []).some(
            (t) => t.state === 'playing',
          ),
  }

  const activePlaying = currentState.playingTracks?.find((t) => t.state === 'playing')
  if (activePlaying) {
    currentState.trackName = activePlaying.trackName
    currentState.source = activePlaying.source
  } else if (currentState.playingTracks?.length === 0) {
    currentState.trackName = undefined
    currentState.source = undefined
  }

  if (typeof window !== 'undefined') {
    window.__ARCANUM_AUDIO_STATE__ = currentState
  }

  return currentState
}

export function updateTrackState(
  trackName: string,
  state: 'playing' | 'paused' | 'stopped',
  source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home',
  categoryName?: string,
): ArcanumAudioState {
  let tracks = [...(currentState.playingTracks ?? [])]
  const existingIdx = tracks.findIndex((t) => t.trackName === trackName && t.source === source)

  if (state === 'stopped') {
    tracks = tracks.filter((_, idx) => idx !== existingIdx)
  } else {
    const snapshot: PlayingTrackSnapshot = {
      id: `${source}-${trackName}`,
      trackName,
      source,
      state,
      categoryName,
    }
    if (existingIdx >= 0) {
      tracks[existingIdx] = snapshot
    } else {
      tracks.push(snapshot)
    }
  }

  return publishAudioState({ playingTracks: tracks })
}

export function stopAllTracks(): ArcanumAudioState {
  return publishAudioState({
    isPlaying: false,
    trackName: undefined,
    source: undefined,
    playingTracks: [],
  })
}
