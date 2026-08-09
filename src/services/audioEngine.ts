import { updateTrackState, stopAllTracks, publishAudioState } from './audioState'

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private activeSources: Map<string, AudioBufferSourceNode> = new Map()
  private audioBufferCache: Map<string, AudioBuffer> = new Map()
  private synthBuffer: AudioBuffer | null = null
  private soundboardMasterVolume = 0.85
  private masterVolume = 1.0

  constructor() {
    if (typeof window !== 'undefined') {
      window.__ARCANUM_AUDIO_PROBE__ = () => this.probeAudioSignal()
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.setValueAtTime(this.soundboardMasterVolume, this.ctx.currentTime)
        this.analyser = this.ctx.createAnalyser()
        this.analyser.fftSize = 256
        this.masterGain.connect(this.analyser)
        this.analyser.connect(this.ctx.destination)
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  private resolveAssetUrl(trackName: string, audioUrl?: string): string | undefined {
    if (audioUrl) return audioUrl
    const lower = trackName.toLowerCase()
    if (lower.includes('sword') || lower.includes('clash')) return '/assets/audio/soundboard/sword.ogg'
    if (lower.includes('dragon') || lower.includes('roar')) return '/assets/audio/soundboard/dragon-studio-dragon-roar-364478.ogg'
    if (lower.includes('owl') || lower.includes('hoot')) return '/assets/audio/soundboard/owl_hooting.ogg'
    if (lower.includes('arrow') || lower.includes('shot')) return '/assets/audio/soundboard/arrow.ogg'
    if (lower.includes('dog') || lower.includes('bark') || lower.includes('wolf')) return '/assets/audio/soundboard/dog_bark.ogg'
    if (lower.includes('whip') || lower.includes('crack')) return '/assets/audio/soundboard/whip.ogg'
    return undefined
  }

  private getSynthBuffer(ctx: AudioContext): AudioBuffer {
    if (this.synthBuffer) return this.synthBuffer
    const sampleRate = ctx.sampleRate
    const length = sampleRate * 2
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      // Gentle noise/percussion envelope sound instead of harsh pure tone
      const env = Math.exp(-i / (sampleRate * 0.3))
      data[i] = (Math.random() * 2 - 1) * env * 0.3
    }
    this.synthBuffer = buffer
    return buffer
  }

  private async loadAudioBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
    if (this.audioBufferCache.has(url)) {
      return this.audioBufferCache.get(url)!
    }
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      const arrayBuffer = await res.arrayBuffer()
      const decoded = await ctx.decodeAudioData(arrayBuffer)
      this.audioBufferCache.set(url, decoded)
      return decoded
    } catch {
      return null
    }
  }

  public getSoundboardMasterVolume(): number {
    return this.soundboardMasterVolume
  }

  public setSoundboardMasterVolume(vol: number) {
    this.soundboardMasterVolume = vol / 100
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.soundboardMasterVolume, this.ctx.currentTime)
    }
    publishAudioState({ volumes: { master: Math.round(this.masterVolume * 100), soundboardMaster: vol } })
  }

  public async playFX(trackName: string, source: 'library' | 'picker' | 'soundboard' | 'home' = 'soundboard', audioUrl?: string) {
    const ctx = this.getContext()
    updateTrackState(trackName, 'playing', source)

    const key = `${source}-${trackName}`
    this.stopActiveSource(key)

    if (ctx && this.masterGain) {
      try {
        const url = this.resolveAssetUrl(trackName, audioUrl)
        let buffer: AudioBuffer | null = null
        if (url) {
          buffer = await this.loadAudioBuffer(ctx, url)
        }
        if (!buffer) {
          buffer = this.getSynthBuffer(ctx)
        }
        // Ensure source node wasn't stopped while loading
        const currentState = window.__ARCANUM_AUDIO_STATE__
        const isStillPlaying = currentState?.playingTracks?.some((t) => t.trackName === trackName && t.source === source && t.state === 'playing')
        if (!isStillPlaying) return

        const srcNode = ctx.createBufferSource()
        srcNode.buffer = buffer
        srcNode.loop = false
        srcNode.onended = () => {
          this.stopFX(trackName, source)
        }
        srcNode.connect(this.masterGain)
        srcNode.start(0)
        this.activeSources.set(key, srcNode)
      } catch {
        // Fallback for audio context restrictions
      }
    }
  }

  public stopFX(trackName: string, source: 'library' | 'picker' | 'soundboard' | 'home' = 'soundboard') {
    updateTrackState(trackName, 'stopped', source)
    this.stopActiveSource(`${source}-${trackName}`)
  }

  public pauseFX(trackName: string, source: 'library' | 'picker' | 'soundboard' | 'home' = 'soundboard') {
    updateTrackState(trackName, 'paused', source)
    this.stopActiveSource(`${source}-${trackName}`)
  }

  public stopAll() {
    stopAllTracks()
    for (const key of Array.from(this.activeSources.keys())) {
      this.stopActiveSource(key)
    }
  }

  private stopActiveSource(key: string) {
    const node = this.activeSources.get(key)
    if (node) {
      try {
        node.stop()
        node.disconnect()
      } catch {
        // Ignore if already stopped
      }
      this.activeSources.delete(key)
    }
  }

  public probeAudioSignal(): { isPlaying: boolean; signalLevel: number; hasSignal: boolean } {
    if (!this.analyser || this.activeSources.size === 0) {
      return { isPlaying: false, signalLevel: 0, hasSignal: false }
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteTimeDomainData(dataArray)
    let sumSq = 0
    for (let i = 0; i < dataArray.length; i++) {
      const diff = dataArray[i] - 128
      sumSq += diff * diff
    }
    const rms = Math.sqrt(sumSq / dataArray.length)
    return {
      isPlaying: this.activeSources.size > 0,
      signalLevel: rms,
      hasSignal: rms > 0.1,
    }
  }
}

export const audioEngine = new AudioEngine()

