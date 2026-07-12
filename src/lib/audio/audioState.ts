export interface PlayingTrackSnapshot {
  id: string
  name: string
  source: 'soundboard' | 'soundscape' | 'library' | 'picker'
  slotId?: string
  categoryName?: string
}

export interface ArcanumAudioVolumes {
  soundboardMaster?: number
  soundscapeMaster?: number
  soundscapes?: Record<string, number>
}

export interface ArcanumAudioState {
  isPlaying: boolean
  trackName?: string
  source?: 'library' | 'picker' | 'soundboard' | 'soundscape'
  previewVolume?: number
  playingTracks?: PlayingTrackSnapshot[]
  volumes?: ArcanumAudioVolumes
}

export function publishAudioState(state: ArcanumAudioState): void {
  if (typeof window === 'undefined') {
    return
  }
  window.__ARCANUM_AUDIO_STATE__ = state
}
