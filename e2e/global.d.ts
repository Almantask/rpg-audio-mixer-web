import type { ArcanumAudioState } from '../src/types'

declare global {
  interface Window {
    __ARCANUM_AUDIO_STATE__?: ArcanumAudioState
    __ARCANUM_STORE__?: Record<string, unknown>
    __ARCANUM_RESET_DATA__?: () => void
    __ARCANUM_SEED_DATA__?: (data: unknown) => void
  }
}
export {}
