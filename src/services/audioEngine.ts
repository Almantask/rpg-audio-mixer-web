// Web Audio API Audio Engine

// Helper for cubic volume mapping
export function cubicVolume(linearVolume: number): number {
  const v = Math.max(0, Math.min(1, linearVolume))
  return Math.pow(v, 3)
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private fxMasterGain: GainNode | null = null
  private soundscapeMasterGain: GainNode | null = null
  private duckingGain: GainNode | null = null

  // Soundboard FX state
  private fxBuffers: Map<string, AudioBuffer> = new Map()
  private activeFXInstances: {
    fxTrackId: string
    source: AudioBufferSourceNode
    gainNode: GainNode
    startTime: number
  }[] = []

  // Soundscapes state
  private activeSoundscapes: Map<
    string,
    {
      categoryId: string
      activeTrackId: string
      intensity: string
      volume: number // linear 0-1
      gainNode: GainNode
      audioElement: HTMLAudioElement
      mediaSourceNode?: MediaElementAudioSourceNode
    }
  > = new Map()

  private isDucked = false

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
      this.masterGain = this.ctx.createGain()
      this.fxMasterGain = this.ctx.createGain()
      this.soundscapeMasterGain = this.ctx.createGain()
      this.duckingGain = this.ctx.createGain()

      // Route: soundscapes -> soundscapeMasterGain -> duckingGain -> masterGain -> destination
      //        fx -> fxMasterGain -> masterGain -> destination
      this.soundscapeMasterGain.connect(this.duckingGain)
      this.duckingGain.connect(this.masterGain)

      this.fxMasterGain.connect(this.masterGain)
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  // --- Master Control Methods ---

  public setMasterVolume(linearVolume: number) {
    this.getContext()
    if (this.masterGain) {
      this.masterGain.gain.value = cubicVolume(linearVolume)
    }
  }

  public setSoundboardMasterVolume(linearVolume: number) {
    this.getContext()
    if (this.fxMasterGain) {
      this.fxMasterGain.gain.value = cubicVolume(linearVolume)
    }
  }

  public setSoundscapeMasterVolume(linearVolume: number) {
    this.getContext()
    if (this.soundscapeMasterGain) {
      this.soundscapeMasterGain.gain.value = cubicVolume(linearVolume)
    }
  }

  public setMuted(isMuted: boolean) {
    this.getContext()
    if (this.soundscapeMasterGain) {
      this.soundscapeMasterGain.gain.value = isMuted ? 0 : 1
    }
  }

  // --- Soundboard FX Methods ---

  public async preloadFX(fxTrackId: string, url: string): Promise<AudioBuffer | null> {
    const ctx = this.getContext()
    if (this.fxBuffers.has(fxTrackId)) {
      return this.fxBuffers.get(fxTrackId)!
    }
    try {
      const resp = await fetch(url)
      const arrayBuffer = await resp.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      this.fxBuffers.set(fxTrackId, audioBuffer)
      return audioBuffer
    } catch (e) {
      console.warn(`Failed to decode FX audio for ${fxTrackId}:`, e)
      return null
    }
  }

  public async playFX(
    fxTrackId: string,
    url: string,
    individualVolume = 1.0,
    onEnded?: () => void
  ) {
    const ctx = this.getContext()

    // Concurrency check: max 5 global instances, max 5 for this effect
    const perEffectCount = this.activeFXInstances.filter((i) => i.fxTrackId === fxTrackId).length
    if (this.activeFXInstances.length >= 5 || perEffectCount >= 5) {
      // Silently stop oldest instance
      const oldest = this.activeFXInstances.shift()
      if (oldest) {
        try {
          oldest.source.stop()
        } catch (_) {}
      }
    }

    let buffer = this.fxBuffers.get(fxTrackId)
    if (!buffer) {
      buffer = (await this.preloadFX(fxTrackId, url)) ?? undefined
    }

    if (!buffer) {
      // Fallback HTML5 Audio if decode fails
      const audio = new Audio(url)
      audio.volume = cubicVolume(individualVolume)
      audio.play()
      return
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const gainNode = ctx.createGain()
    gainNode.gain.value = cubicVolume(individualVolume)

    source.connect(gainNode)
    gainNode.connect(this.fxMasterGain!)

    const instance = {
      fxTrackId,
      source,
      gainNode,
      startTime: ctx.currentTime,
    }
    this.activeFXInstances.push(instance)

    this.checkAutoDucking()

    source.onended = () => {
      this.activeFXInstances = this.activeFXInstances.filter((i) => i !== instance)
      this.checkAutoDucking()
      onEnded?.()
    }

    source.start(0)
  }

  public stopFX(fxTrackId: string) {
    const instancesToStop = this.activeFXInstances.filter((i) => i.fxTrackId === fxTrackId)
    for (const inst of instancesToStop) {
      try {
        inst.source.stop()
      } catch (_) {}
    }
    this.activeFXInstances = this.activeFXInstances.filter((i) => i.fxTrackId !== fxTrackId)
    this.checkAutoDucking()
  }

  public stopAllFX() {
    for (const inst of this.activeFXInstances) {
      try {
        inst.source.stop()
      } catch (_) {}
    }
    this.activeFXInstances = []
    this.checkAutoDucking()
  }

  private checkAutoDucking() {
    if (!this.duckingGain || !this.ctx) return
    const hasActiveFX = this.activeFXInstances.length > 0
    if (hasActiveFX && !this.isDucked) {
      this.isDucked = true
      this.duckingGain.gain.setTargetAtTime(0.4, this.ctx.currentTime, 0.1)
    } else if (!hasActiveFX && this.isDucked) {
      this.isDucked = false
      this.duckingGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.3)
    }
  }

  // --- Soundscape Category Methods ---

  public playSoundscapeCategory(
    categoryId: string,
    trackId: string,
    url: string,
    intensity: string,
    linearVolume: number,
    onTrackEnd: () => void
  ) {
    const ctx = this.getContext()

    // Concurrency limit: max 10 active soundscapes
    if (this.activeSoundscapes.size >= 10 && !this.activeSoundscapes.has(categoryId)) {
      // Stop oldest
      const firstKey = this.activeSoundscapes.keys().next().value
      if (firstKey) {
        this.stopSoundscapeCategory(firstKey)
      }
    }

    const existing = this.activeSoundscapes.get(categoryId)

    if (existing) {
      // If same track, just adjust volume/intensity
      if (existing.activeTrackId === trackId) {
        existing.volume = linearVolume
        existing.intensity = intensity
        existing.gainNode.gain.setTargetAtTime(cubicVolume(linearVolume), ctx.currentTime, 0.1)
        return
      }

      // Crossfade to new track
      const oldGain = existing.gainNode
      const oldAudio = existing.audioElement

      // Fade out old
      oldGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5)
      setTimeout(() => {
        oldAudio.pause()
        oldAudio.src = ''
      }, 2000)

      // Fade in new
      const newAudio = new Audio(url)
      newAudio.crossOrigin = 'anonymous'
      const newGain = ctx.createGain()
      newGain.gain.value = 0

      const mediaNode = ctx.createMediaElementSource(newAudio)
      mediaNode.connect(newGain)
      newGain.connect(this.soundscapeMasterGain!)

      newAudio.play().catch(() => {})
      newGain.gain.setTargetAtTime(cubicVolume(linearVolume), ctx.currentTime, 0.5)

      newAudio.onended = onTrackEnd

      this.activeSoundscapes.set(categoryId, {
        categoryId,
        activeTrackId: trackId,
        intensity,
        volume: linearVolume,
        gainNode: newGain,
        audioElement: newAudio,
        mediaSourceNode: mediaNode,
      })
      return
    }

    // New category playing
    const audio = new Audio(url)
    audio.crossOrigin = 'anonymous'
    const gainNode = ctx.createGain()
    gainNode.gain.value = cubicVolume(linearVolume)

    let mediaNode: MediaElementAudioSourceNode | undefined
    try {
      mediaNode = ctx.createMediaElementSource(audio)
      mediaNode.connect(gainNode)
      gainNode.connect(this.soundscapeMasterGain!)
    } catch (_) {
      // Fallback if media element source fails
    }

    audio.play().catch(() => {})
    audio.onended = onTrackEnd

    this.activeSoundscapes.set(categoryId, {
      categoryId,
      activeTrackId: trackId,
      intensity,
      volume: linearVolume,
      gainNode,
      audioElement: audio,
      mediaSourceNode: mediaNode,
    })
  }

  public setSoundscapeCategoryVolume(categoryId: string, linearVolume: number) {
    const item = this.activeSoundscapes.get(categoryId)
    if (item && this.ctx) {
      item.volume = linearVolume
      item.gainNode.gain.setTargetAtTime(cubicVolume(linearVolume), this.ctx.currentTime, 0.1)
    }
  }

  public stopSoundscapeCategory(categoryId: string) {
    const item = this.activeSoundscapes.get(categoryId)
    if (item) {
      if (this.ctx) {
        item.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3)
      }
      setTimeout(() => {
        item.audioElement.pause()
        item.audioElement.src = ''
      }, 400)
      this.activeSoundscapes.delete(categoryId)
    }
  }

  public stopAllSoundscapes() {
    for (const categoryId of Array.from(this.activeSoundscapes.keys())) {
      this.stopSoundscapeCategory(categoryId)
    }
  }

  public stopAll() {
    this.stopAllSoundscapes()
    this.stopAllFX()
  }

  public isCategoryPlaying(categoryId: string): boolean {
    return this.activeSoundscapes.has(categoryId)
  }

  public getCategoryActiveTrack(categoryId: string): string | undefined {
    return this.activeSoundscapes.get(categoryId)?.activeTrackId
  }
}

export const audioEngine = new AudioEngine()
