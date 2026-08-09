import type { ArcanumAudioState } from './lib/audio/audioState'

declare global {
  interface Window {
    __ARCANUM_AUDIO_STATE__?: ArcanumAudioState
  }
}
