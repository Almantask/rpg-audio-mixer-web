/// <reference types="vite/client" />

interface ArcanumAudioState {
  isPlaying: boolean
  trackName?: string
  source?: 'library' | 'picker' | 'soundboard'
  previewVolume?: number
}

declare global {
  interface Window {
    __ARCANUM_AUDIO_STATE__?: ArcanumAudioState
  }
}

export {}
