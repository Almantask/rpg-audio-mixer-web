import type { AppData, E2EControls } from '../src/types/campaign'

export interface ArcanumAudioState {
  isPlaying: boolean
  trackName?: string
  source?: 'library' | 'picker' | 'soundboard'
  previewVolume?: number
}

declare global {
  interface Window {
    __ARCANUM_E2E__?: {
      reset: () => void
      seed: (partial: Partial<AppData & Record<string, unknown>>) => void
      setE2EControls: (controls: Partial<E2EControls>) => void
      formatTodayIso: () => string
      getAppData?: () => AppData & Record<string, unknown>
    }
    __ARCANUM_AUDIO_STATE__?: ArcanumAudioState
  }
}

export {}
