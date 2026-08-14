import { publishAudioState } from './audioState'
import type { PlayingTrackSnapshot } from './audioState'

class AudioEngine {
  private ctx: AudioContext | null = null
  private playingFxInstances: Array<{
    id: string
    trackId: string
    trackName: string
    source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
    node: AudioBufferSourceNode | HTMLAudioElement
    gainNode?: GainNode
    startTime: number
  }> = []

  private masterVolume: number = 1
  private soundboardMasterVolume: number = 1
  private audioBufferCache: Map<string, AudioBuffer> = new Map()

  private initContext(): AudioContext | null {
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

  // Cubic mapping (x^3)
  private mapVolume(vol: number): number {
    const clamped = Math.max(0, Math.min(1, vol))
    return Math.pow(clamped, 3)
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = vol
    this.updatePublishedState()
  }

  public setSoundboardMasterVolume(vol: number): void {
    this.soundboardMasterVolume = vol
    this.updatePublishedState()
  }

  public async playFX(track: {
    id: string
    name: string
    audioUrl: string
    source?: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
    volume?: number
  }): Promise<string> {
    const ctx = this.initContext()
    const source = track.source || 'soundboard'

    // Concurrency enforcement: Max 5 global concurrent FX instances
    if (this.playingFxInstances.length >= 5) {
      const oldest = this.playingFxInstances.shift()
      if (oldest) {
        this.stopInstance(oldest.id)
      }
    }

    // Per-effect cap: Max 5 of same effect
    const sameEffectInstances = this.playingFxInstances.filter((i) => i.trackId === track.id)
    if (sameEffectInstances.length >= 5) {
      const oldestSame = sameEffectInstances[0]
      this.playingFxInstances = this.playingFxInstances.filter((i) => i.id !== oldestSame.id)
      this.stopInstance(oldestSame.id)
    }

    const instanceId = `inst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    if (ctx) {
      try {
        let buffer = this.audioBufferCache.get(track.audioUrl)
        if (!buffer) {
          const res = await fetch(track.audioUrl)
          const arrayBuf = await res.arrayBuffer()
          buffer = await ctx.decodeAudioData(arrayBuf)
          this.audioBufferCache.set(track.audioUrl, buffer)
        }

        const sourceNode = ctx.createBufferSource()
        sourceNode.buffer = buffer

        const gainNode = ctx.createGain()
        const effectiveVol = this.mapVolume((track.volume ?? 1) * this.soundboardMasterVolume * this.masterVolume)
        gainNode.gain.setValueAtTime(effectiveVol, ctx.currentTime)

        sourceNode.connect(gainNode)
        gainNode.connect(ctx.destination)

        sourceNode.start()

        const instance = {
          id: instanceId,
          trackId: track.id,
          trackName: track.name,
          source,
          node: sourceNode,
          gainNode,
          startTime: Date.now(),
        }
        this.playingFxInstances.push(instance)

        sourceNode.onended = () => {
          this.playingFxInstances = this.playingFxInstances.filter((i) => i.id !== instanceId)
          this.updatePublishedState()
        }

        this.updatePublishedState()
        return instanceId
      } catch (err) {
        console.warn('Web Audio buffer play failed, fallback to Audio element:', err)
      }
    }

    // Fallback using HTMLAudioElement
    const audio = new Audio(track.audioUrl)
    audio.volume = this.mapVolume((track.volume ?? 1) * this.soundboardMasterVolume * this.masterVolume)
    void audio.play()

    const instance = {
      id: instanceId,
      trackId: track.id,
      trackName: track.name,
      source,
      node: audio,
      startTime: Date.now(),
    }
    this.playingFxInstances.push(instance)

    audio.onended = () => {
      this.playingFxInstances = this.playingFxInstances.filter((i) => i.id !== instanceId)
      this.updatePublishedState()
    }

    this.updatePublishedState()
    return instanceId
  }

  public stopFXTrack(trackId: string): void {
    const matching = this.playingFxInstances.filter((i) => i.trackId === trackId)
    matching.forEach((inst) => this.stopInstance(inst.id))
    this.playingFxInstances = this.playingFxInstances.filter((i) => i.trackId !== trackId)
    this.updatePublishedState()
  }

  public stopAll(): void {
    this.playingFxInstances.forEach((inst) => this.stopInstance(inst.id))
    this.playingFxInstances = []
    this.updatePublishedState()
  }

  public isTrackPlaying(trackId: string): boolean {
    return this.playingFxInstances.some((i) => i.trackId === trackId)
  }

  private stopInstance(instanceId: string): void {
    const inst = this.playingFxInstances.find((i) => i.id === instanceId)
    if (!inst) return
    try {
      if ('stop' in inst.node && typeof inst.node.stop === 'function') {
        inst.node.stop()
      } else if ('pause' in inst.node && typeof inst.node.pause === 'function') {
        inst.node.pause()
      }
    } catch {
      // Ignore stop errors
    }
  }

  private updatePublishedState(): void {
    const playingTracks: PlayingTrackSnapshot[] = this.playingFxInstances.map((inst) => ({
      id: inst.trackId,
      name: inst.trackName,
      source: inst.source,
      volume: 1,
    }))

    publishAudioState({
      isPlaying: playingTracks.length > 0,
      trackName: playingTracks[0]?.name,
      source: playingTracks[0]?.source,
      playingTracks,
      volumes: {
        master: this.masterVolume,
        soundboardMaster: this.soundboardMasterVolume,
        soundscapeMaster: 1,
      },
    })
  }
}

export const audioEngine = new AudioEngine()
