import type { ArcanumAudioState } from '../../src/types'

declare global {
  interface Window {
    __ARCANUM_AUDIO_STATE__?: ArcanumAudioState
  }
}
