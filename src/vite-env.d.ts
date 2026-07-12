/// <reference types="vite/client" />

interface PlayingTrackSnapshot {
  id: string
  name: string
  source: 'soundboard' | 'soundscape' | 'library' | 'picker'
  slotId?: string
  categoryName?: string
}

interface ArcanumAudioVolumes {
  soundboardMaster?: number
  soundscapeMaster?: number
  soundscapes?: Record<string, number>
}

interface ArcanumAudioState {
  isPlaying: boolean
  trackName?: string
  source?: 'library' | 'picker' | 'soundboard' | 'soundscape'
  previewVolume?: number
  playingTracks?: PlayingTrackSnapshot[]
  volumes?: ArcanumAudioVolumes
}

declare global {
  interface Window {
    __ARCANUM_AUDIO_STATE__?: ArcanumAudioState
  }
}

export {}
