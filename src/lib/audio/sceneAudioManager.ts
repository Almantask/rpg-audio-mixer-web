import { publishAudioState, getAudioState } from './audioState'
import type { PlayingTrackSnapshot } from '../types'

interface ActiveInstance {
  id: string
  trackId: string
  name: string
  sourceNode: AudioBufferSourceNode | null
  gainNode: GainNode
  sourceCategory: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  startTime: number
  duration: number
  defaultVolume: number
  timerId?: ReturnType<typeof setTimeout>
}


class SceneAudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private soundboardMasterGain: GainNode | null = null
  private soundscapesMasterGain: GainNode | null = null

  private activeInstances: ActiveInstance[] = []
  private bufferCache = new Map<string, AudioBuffer>()
  public isDucked = false

  private MAX_GLOBAL_INSTANCES = 5
  private MAX_PER_EFFECT_INSTANCES = 5

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioContextClass) {
        this.ctx = new AudioContextClass()

        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 1
        this.masterGain.connect(this.ctx.destination)

        this.soundboardMasterGain = this.ctx.createGain()
        this.soundboardMasterGain.gain.value = Math.pow(0.85, 3) // cubic mapping
        this.soundboardMasterGain.connect(this.masterGain)

        this.soundscapesMasterGain = this.ctx.createGain()
        this.soundscapesMasterGain.gain.value = 1
        this.soundscapesMasterGain.connect(this.masterGain)
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  }

  public setSoundboardMasterVolume(volume: number) {
    this.initContext()
    const cubic = Math.pow(Math.min(1, Math.max(0, volume)), 3)
    if (this.soundboardMasterGain && this.ctx) {
      this.soundboardMasterGain.gain.setTargetAtTime(cubic, this.ctx.currentTime, 0.05)
    }
    const currentVols = getAudioState().volumes || { master: 1, soundboardMaster: 0.85, soundscapesMaster: 0.85 }
    publishAudioState({
      volumes: {
        master: currentVols.master,
        soundscapesMaster: currentVols.soundscapesMaster,
        soundboardMaster: volume,
      },
    })

  }

  public getSoundboardMasterVolume(): number {
    return getAudioState().volumes?.soundboardMaster ?? 0.85
  }

  public async playFx(
    trackId: string,
    trackName: string,
    url: string,
    options: {
      source?: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
      durationSeconds?: number
      defaultVolume?: number
    } = {}

  ): Promise<string> {
    this.initContext()

    const instanceId = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const duration = options.durationSeconds || 4
    const defaultVolume = options.defaultVolume ?? 1
    const sourceCategory = options.source || 'soundboard'

    // Concurrency enforcement: max 5 global instances
    if (this.activeInstances.length >= this.MAX_GLOBAL_INSTANCES) {
      const oldest = this.activeInstances.shift()
      if (oldest) {
        this.stopInstance(oldest)
      }
    }

    // Max 5 instances per effect
    const sameEffectInstances = this.activeInstances.filter((inst) => inst.trackId === trackId)
    if (sameEffectInstances.length >= this.MAX_PER_EFFECT_INSTANCES) {
      const oldestSame = sameEffectInstances[0]
      this.activeInstances = this.activeInstances.filter((inst) => inst.id !== oldestSame.id)
      this.stopInstance(oldestSame)
    }

    let gainNode: GainNode
    let sourceNode: AudioBufferSourceNode | null = null

    if (this.ctx) {
      gainNode = this.ctx.createGain()
      gainNode.gain.value = defaultVolume
      gainNode.connect(this.soundboardMasterGain || this.ctx.destination)

      try {
        let buffer = this.bufferCache.get(url)
        if (!buffer) {
          const res = await fetch(url)
          const arrayBuffer = await res.arrayBuffer()
          buffer = await this.ctx.decodeAudioData(arrayBuffer)
          this.bufferCache.set(url, buffer)
        }

        sourceNode = this.ctx.createBufferSource()
        sourceNode.buffer = buffer
        sourceNode.connect(gainNode)
        sourceNode.start()
      } catch {
        // Fallback for mocked / synthetic environments without audio decoding
      }
    } else {
      // Mock gain for non-browser/test environment
      gainNode = { gain: { value: defaultVolume } } as unknown as GainNode
    }

    const instance: ActiveInstance = {
      id: instanceId,
      trackId,
      name: trackName,
      sourceNode,
      gainNode,
      sourceCategory,
      startTime: Date.now(),
      duration,
      defaultVolume,
    }

    // Auto-duck soundscapes if soundboard effect starts
    if (sourceCategory === 'soundboard') {
      this.applyDucking(true)
    }

    const timerId = setTimeout(() => {
      this.handleInstanceEnded(instanceId)
    }, duration * 1000)
    instance.timerId = timerId

    this.activeInstances.push(instance)
    this.emitStateUpdate()

    return instanceId
  }

  private applyDucking(duck: boolean) {
    this.isDucked = duck
    if (this.soundscapesMasterGain && this.ctx) {
      const target = duck ? 0.4 : 1.0
      this.soundscapesMasterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05)
    }
  }

  private handleInstanceEnded(instanceId: string) {
    const inst = this.activeInstances.find((i) => i.id === instanceId)
    if (inst) {
      this.stopInstance(inst)
      this.activeInstances = this.activeInstances.filter((i) => i.id !== instanceId)

      // Restore ducking if no soundboard instances active
      const hasSoundboard = this.activeInstances.some((i) => i.sourceCategory === 'soundboard')
      if (!hasSoundboard) {
        this.applyDucking(false)
      }

      this.emitStateUpdate()
    }
  }

  private stopInstance(inst: ActiveInstance) {
    if (inst.timerId) {
      clearTimeout(inst.timerId)
    }
    if (inst.sourceNode) {
      try {
        inst.sourceNode.stop()
        inst.sourceNode.disconnect()
      } catch {
        // ignore if already stopped
      }
    }
  }

  public stopTrackByName(trackName: string) {
    const toStop = this.activeInstances.filter((inst) => inst.name === trackName)
    for (const inst of toStop) {
      this.stopInstance(inst)
    }
    this.activeInstances = this.activeInstances.filter((inst) => inst.name !== trackName)

    const hasSoundboard = this.activeInstances.some((i) => i.sourceCategory === 'soundboard')
    if (!hasSoundboard) {
      this.applyDucking(false)
    }

    this.emitStateUpdate()
  }

  public stopBySource(sourceCategory: string) {
    const toStop = this.activeInstances.filter((inst) => inst.sourceCategory === sourceCategory)
    for (const inst of toStop) {
      this.stopInstance(inst)
    }
    this.activeInstances = this.activeInstances.filter((inst) => inst.sourceCategory !== sourceCategory)
    this.emitStateUpdate()
  }

  public stopAll() {
    for (const inst of this.activeInstances) {
      this.stopInstance(inst)
    }
    this.activeInstances = []
    this.applyDucking(false)
    this.emitStateUpdate()
  }

  public isTrackPlaying(trackName: string): boolean {
    return this.activeInstances.some((inst) => inst.name === trackName)
  }

  private emitStateUpdate() {
    const isPlaying = this.activeInstances.length > 0
    const latest = this.activeInstances[this.activeInstances.length - 1]

    const playingTracks: PlayingTrackSnapshot[] = this.activeInstances.map((inst) => ({
      trackId: inst.id,
      instanceId: inst.id,
      trackName: inst.name,
      source: inst.sourceCategory,
      startTime: inst.startTime,
      durationSeconds: inst.duration,
      duration: inst.duration,
      elapsed: (Date.now() - inst.startTime) / 1000,
      isLooping: inst.sourceCategory === 'soundscape',
      volume: 1,
    }))

    publishAudioState({
      isPlaying,
      trackName: latest?.name,
      source: latest?.sourceCategory,
      playingTracks,
    })

  }
}

export const sceneAudioManager = new SceneAudioManager()
