/**
 * Natural volume scaling using cubic mapping (x^3).
 * Gives smoother, more perceptive volume control over linear sliders.
 */
export function cubicVolume(sliderValue: number): number {
  const v = Math.max(0, Math.min(1, sliderValue))
  return Math.pow(v, 3)
}

export interface ActiveFXInstance {
  id: string
  fxTrackId: string
  audio: HTMLAudioElement | null
  startTime: number
}

class AudioEngine {
  private activeFX: ActiveFXInstance[] = []
  private activeSoundscapes: Map<
    string,
    {
      categoryId: string
      audio: HTMLAudioElement
      volume: number
      intensity: string
    }
  > = new Map()

  private onDuckingChangeCallbacks: Set<(isDucked: boolean) => void> = new Set()

  public subscribeDuckingChange(cb: (isDucked: boolean) => void): () => void {
    this.onDuckingChangeCallbacks.add(cb)
    return () => this.onDuckingChangeCallbacks.delete(cb)
  }

  private notifyDuckingChange() {
    const isDucked = this.activeFX.length > 0
    this.onDuckingChangeCallbacks.forEach((cb) => cb(isDucked))
  }

  /**
   * Triggers a soundboard FX. Supports up to 5 global concurrent instances,
   * 5 per-effect instances. Triggers 40% auto-ducking for soundscapes.
   */
  public playFX(fxTrackId: string, url: string, volume = 1.0): ActiveFXInstance {
    // Clean up finished instances first
    this.activeFX = this.activeFX.filter((inst) => {
      if (!inst.audio) return true
      return !inst.audio.ended
    })

    // Per-effect cap: max 5
    const sameFXInstances = this.activeFX.filter((inst) => inst.fxTrackId === fxTrackId)
    if (sameFXInstances.length >= 5) {
      const oldest = sameFXInstances[0]
      this.stopFXInstance(oldest.id)
    }

    // Global cap: max 5
    if (this.activeFX.length >= 5) {
      const oldest = this.activeFX[0]
      this.stopFXInstance(oldest.id)
    }

    const instanceId = `fx-inst-${Date.now()}-${Math.random()}`
    let audio: HTMLAudioElement | null = null

    if (typeof Audio !== 'undefined') {
      try {
        audio = new Audio(url)
        audio.volume = cubicVolume(volume)
        audio.play().catch(() => {
          // Playback error ignore for unit tests or blocked autoplay
        })

        audio.onended = () => {
          this.removeFXInstance(instanceId)
        }
      } catch {
        // Fallback for non-supported environments
      }
    }

    const newInstance: ActiveFXInstance = {
      id: instanceId,
      fxTrackId,
      audio,
      startTime: Date.now(),
    }

    this.activeFX.push(newInstance)
    this.notifyDuckingChange()

    return newInstance
  }

  public stopFXTrack(fxTrackId: string) {
    const matching = this.activeFX.filter((inst) => inst.fxTrackId === fxTrackId)
    matching.forEach((inst) => this.stopFXInstance(inst.id))
  }

  public stopFXInstance(instanceId: string) {
    const inst = this.activeFX.find((i) => i.id === instanceId)
    if (inst?.audio) {
      try {
        inst.audio.pause()
        inst.audio.currentTime = 0
      } catch {
        // Ignore
      }
    }
    this.removeFXInstance(instanceId)
  }

  private removeFXInstance(instanceId: string) {
    this.activeFX = this.activeFX.filter((inst) => inst.id !== instanceId)
    this.notifyDuckingChange()
  }

  public isFXPlaying(fxTrackId: string): boolean {
    return this.activeFX.some((inst) => inst.fxTrackId === fxTrackId)
  }

  public getActiveFXCount(fxTrackId?: string): number {
    if (fxTrackId) {
      return this.activeFX.filter((inst) => inst.fxTrackId === fxTrackId).length
    }
    return this.activeFX.length
  }

  /**
   * Soundscape playback management
   */
  public playSoundscape(
    categoryId: string,
    url: string,
    volume: number,
    masterVolume: number,
    intensity: string,
    onEnded?: () => void,
  ) {
    // Max 10 soundscapes cap
    if (this.activeSoundscapes.size >= 10 && !this.activeSoundscapes.has(categoryId)) {
      const oldestKey = this.activeSoundscapes.keys().next().value
      if (oldestKey) {
        this.stopSoundscape(oldestKey)
      }
    }

    this.stopSoundscape(categoryId)

    if (typeof Audio !== 'undefined') {
      try {
        const audio = new Audio(url)
        const effectiveVolume = cubicVolume(volume) * cubicVolume(masterVolume)
        audio.volume = Math.max(0, Math.min(1, effectiveVolume))

        if (onEnded) {
          audio.onended = onEnded
        }

        audio.play().catch(() => {})

        this.activeSoundscapes.set(categoryId, {
          categoryId,
          audio,
          volume,
          intensity,
        })
      } catch {
        // Ignore
      }
    }
  }

  public stopSoundscape(categoryId: string) {
    const entry = this.activeSoundscapes.get(categoryId)
    if (entry) {
      try {
        entry.audio.pause()
        entry.audio.currentTime = 0
      } catch {
        // Ignore
      }
      this.activeSoundscapes.delete(categoryId)
    }
  }

  public isSoundscapePlaying(categoryId: string): boolean {
    return this.activeSoundscapes.has(categoryId)
  }

  public updateSoundscapeVolume(categoryId: string, volume: number, masterVolume: number) {
    const entry = this.activeSoundscapes.get(categoryId)
    if (entry) {
      entry.volume = volume
      const isDucked = this.activeFX.length > 0
      const duckFactor = isDucked ? 0.4 : 1.0
      const effectiveVolume = cubicVolume(volume) * cubicVolume(masterVolume) * duckFactor
      try {
        entry.audio.volume = Math.max(0, Math.min(1, effectiveVolume))
      } catch {
        // Ignore
      }
    }
  }

  public stopAll() {
    this.activeFX.forEach((inst) => {
      if (inst.audio) {
        try {
          inst.audio.pause()
        } catch {
          // Ignore
        }
      }
    })
    this.activeFX = []

    this.activeSoundscapes.forEach((entry) => {
      try {
        entry.audio.pause()
      } catch {
        // Ignore
      }
    })
    this.activeSoundscapes.clear()

    this.notifyDuckingChange()
  }
}

export const audioEngine = new AudioEngine()
