/// <reference types="vite/client" />

interface PlayingTrackSnapshot {
  id: string
  name: string
  source: 'soundboard' | 'soundscape' | 'library' | 'picker' | 'home'
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
  source?: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  previewVolume?: number
  playingTracks?: PlayingTrackSnapshot[]
  volumes?: ArcanumAudioVolumes
}

declare global {
  interface Window {
    __ARCANUM_AUDIO_STATE__?: ArcanumAudioState
    __ARCANUM_MEDIA_NEXT__?: () => void
    __ARCANUM_SIMULATE_INTERRUPTION_START__?: (simulatedDurationMs?: number) => void
    __ARCANUM_SIMULATE_INTERRUPTION_END__?: () => void
    __ARCANUM_MEDIA_PAUSE__?: () => void
  }
}

export {}
