import { updateTrackState, stopAllTracks, publishAudioState } from './audioState'

class AudioEngine {
  private ctx: AudioContext | null = null
  private soundboardMasterVolume = 0.85
  private masterVolume = 1.0

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  public getSoundboardMasterVolume(): number {
    return this.soundboardMasterVolume
  }

  public setSoundboardMasterVolume(vol: number) {
    this.soundboardMasterVolume = vol / 100
    publishAudioState({ volumes: { master: Math.round(this.masterVolume * 100), soundboardMaster: vol } })
  }

  public playFX(trackName: string, source: 'library' | 'picker' | 'soundboard' | 'home' = 'soundboard') {
    this.getContext()
    updateTrackState(trackName, 'playing', source)

    // Simulate auto-ducking or end of clip
    setTimeout(() => {
      // clip finished after short duration unless stopped
    }, 3000)
  }

  public stopFX(trackName: string, source: 'library' | 'picker' | 'soundboard' | 'home' = 'soundboard') {
    updateTrackState(trackName, 'stopped', source)
  }

  public pauseFX(trackName: string, source: 'library' | 'picker' | 'soundboard' | 'home' = 'soundboard') {
    updateTrackState(trackName, 'paused', source)
  }

  public stopAll() {
    stopAllTracks()
  }
}

export const audioEngine = new AudioEngine()
