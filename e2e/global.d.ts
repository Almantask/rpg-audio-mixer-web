import type { AppData, E2EControls } from '../src/types/campaign'

export interface PlayingTrackSnapshot {
  id: string
  name: string
  source: 'soundboard' | 'soundscape' | 'library' | 'picker' | 'home'
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
  source?: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  previewVolume?: number
  playingTracks?: PlayingTrackSnapshot[]
  volumes?: ArcanumAudioVolumes
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
    __ARCANUM_MEDIA_NEXT__?: () => void
  }
}

export {}
