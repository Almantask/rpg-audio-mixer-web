import type { SoundscapeIntensity } from '@/types/scene'
import { getAudioContext, resumeAudioContext } from './audioContextManager'
import { publishAudioState, type PlayingTrackSnapshot } from './audioState'
import { mapVolumeCubic } from './volume'

const CROSSFADE_SECONDS = 2
const MAX_SOUNDBOARD_GLOBAL = 5
const MAX_SOUNDBOARD_PER_FX = 5
const MAX_SOUNDSCAPE_CONCURRENT = 10
const STOP_ALL_FADE_SECONDS = 0.5

export function computeSoundboardGain(masterVolume: number): number {
  return mapVolumeCubic(masterVolume)
}

export function computeSoundscapeGain(
  masterVolume: number,
  slotVolume: number,
  muted: boolean,
  duckMultiplier: number,
): number {
  if (muted) {
    return 0
  }
  return mapVolumeCubic(masterVolume) * mapVolumeCubic(slotVolume) * duckMultiplier
}

export function pickRandomTrackId(pool: string[], excludeId?: string): string | undefined {
  const candidates = excludeId ? pool.filter((id) => id !== excludeId) : pool
  if (candidates.length === 0) {
    return pool[0]
  }
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export type PlaySceneSlotAction = 'skip-playing' | 'skip-empty' | 'resume' | 'start'

export function resolvePlaySceneSlotAction(input: {
  playing: boolean
  paused: boolean
  trackIds: string[]
}): PlaySceneSlotAction {
  if (input.playing && !input.paused) {
    return 'skip-playing'
  }
  if (input.trackIds.length === 0) {
    return 'skip-empty'
  }
  if (input.paused) {
    return 'resume'
  }
  return 'start'
}

export interface SoundscapeTrackRef {
  id: string
  name: string
  audioUrl: string
  durationSeconds: number
}

export interface SoundscapeSlotConfig {
  slotId: string
  categoryId: string
  categoryName: string
  intensity: SoundscapeIntensity
  volume: number
  currentTrackId?: string
  trackIds: string[]
  tracksById: Record<string, SoundscapeTrackRef>
}

export interface SoundboardTileState {
  fxTrackId: string
  trackName: string
  playing: boolean
}

export interface SoundscapeTileState {
  slotId: string
  categoryName: string
  playing: boolean
  paused: boolean
  progress: number
  trackName?: string
  intensity: SoundscapeIntensity
  volume: number
  hasLoadedTrack: boolean
  currentTrackId?: string
}

export interface ScenePlaybackState {
  soundboard: Record<string, SoundboardTileState>
  soundscapes: Record<string, SoundscapeTileState>
  soundboardMasterVolume: number
  soundscapeMasterVolume: number
  soundscapeMuted: boolean
}

type StateListener = (state: ScenePlaybackState) => void

interface SoundboardInstance {
  instanceId: string
  fxTrackId: string
  trackName: string
  source: AudioBufferSourceNode
  startedAt: number
}

interface ActiveSoundscapeSource {
  source: AudioBufferSourceNode
  trackId: string
  trackName: string
  startedAt: number
  duration: number
  onEnded: () => void
}

interface SoundscapeSlotRuntime {
  config: SoundscapeSlotConfig
  slotGain: GainNode
  crossfadeA: GainNode
  crossfadeB: GainNode
  activeCrossfade: 'A' | 'B'
  currentSource?: ActiveSoundscapeSource
  playing: boolean
  paused: boolean
  startedAtMs: number
  progressRaf?: number
  frozenProgress?: number
}

export class SceneAudioManager {
  private readonly ctx: AudioContext
  private readonly soundboardMasterBus: GainNode
  private readonly soundscapeMasterBus: GainNode

  private readonly bufferCache = new Map<string, AudioBuffer>()
  private readonly soundboardInstances: SoundboardInstance[] = []
  private readonly soundscapeSlots = new Map<string, SoundscapeSlotRuntime>()
  private readonly listeners = new Set<StateListener>()

  private soundboardMasterVolume = 85
  private soundscapeMasterVolume = 100
  private soundscapeMuted = false
  private disposed = false
  private currentSceneId: string | null = null

  constructor() {
    this.ctx = getAudioContext()
    this.soundboardMasterBus = this.ctx.createGain()
    this.soundscapeMasterBus = this.ctx.createGain()

    this.soundboardMasterBus.connect(this.ctx.destination)
    this.soundscapeMasterBus.connect(this.ctx.destination)

    this.applySoundboardMasterVolume()
    this.applySoundscapeMasterVolume()
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  dispose(): void {
    this.disposed = true
    this.stopAll(0)
    for (const slot of this.soundscapeSlots.values()) {
      if (slot.progressRaf) {
        cancelAnimationFrame(slot.progressRaf)
      }
    }
    this.soundscapeSlots.clear()
    this.listeners.clear()
  }

  setSoundboardMasterVolume(volume: number): void {
    this.soundboardMasterVolume = volume
    this.applySoundboardMasterVolume()
    this.notify()
  }

  setSoundscapeMasterVolume(volume: number): void {
    this.soundscapeMasterVolume = volume
    this.applySoundscapeMasterVolume()
    this.notify()
  }

  setSoundscapeMuted(muted: boolean): void {
    this.soundscapeMuted = muted
    this.applySoundscapeMasterVolume()
    this.notify()
  }

  configureSoundscapeSlot(config: SoundscapeSlotConfig): void {
    const normalizedConfig = { ...config }
    if (
      !normalizedConfig.currentTrackId &&
      normalizedConfig.trackIds.length > 0
    ) {
      normalizedConfig.currentTrackId = normalizedConfig.trackIds[0]
    } else if (
      normalizedConfig.currentTrackId &&
      normalizedConfig.trackIds.length > 0 &&
      !normalizedConfig.trackIds.includes(normalizedConfig.currentTrackId)
    ) {
      normalizedConfig.currentTrackId = normalizedConfig.trackIds[0]
    }

    const existing = this.soundscapeSlots.get(normalizedConfig.slotId)
    if (existing) {
      existing.config = normalizedConfig
      this.updateSlotGain(existing)
      this.notify()
      return
    }

    const slotGain = this.ctx.createGain()
    const crossfadeA = this.ctx.createGain()
    const crossfadeB = this.ctx.createGain()
    crossfadeA.gain.value = 1
    crossfadeB.gain.value = 0
    slotGain.connect(this.soundscapeMasterBus)
    crossfadeA.connect(slotGain)
    crossfadeB.connect(slotGain)

    this.soundscapeSlots.set(normalizedConfig.slotId, {
      config: normalizedConfig,
      slotGain,
      crossfadeA,
      crossfadeB,
      activeCrossfade: 'A',
      playing: false,
      paused: false,
      startedAtMs: 0,
    })
    this.updateSlotGain(this.soundscapeSlots.get(normalizedConfig.slotId)!)
    this.notify()
  }

  removeSoundscapeSlot(slotId: string): void {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot) {
      return
    }
    this.stopSoundscapeSlot(slotId)
    slot.slotGain.disconnect()
    this.soundscapeSlots.delete(slotId)
    this.notify()
  }

  updateSoundscapeSlotVolume(slotId: string, volume: number): void {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot) {
      return
    }
    slot.config.volume = volume
    this.updateSlotGain(slot)
    this.notify()
  }

  updateSoundscapeSlotIntensity(
    slotId: string,
    intensity: SoundscapeIntensity,
    trackIds?: string[],
  ): void {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot) {
      return
    }
    slot.config.intensity = intensity
    if (trackIds) {
      slot.config.trackIds = trackIds
      if (slot.config.currentTrackId && !trackIds.includes(slot.config.currentTrackId)) {
        slot.config.currentTrackId = undefined
      }
    }
    if (slot.playing && !slot.paused) {
      void this.crossfadeSoundscapeToRandomTrack(slot)
    }
    this.notify()
  }

  async triggerSoundboard(fxTrackId: string, audioUrl: string, trackName: string): Promise<void> {
    if (this.disposed) {
      return
    }
    await resumeAudioContext()

    this.evictSoundboardInstancesIfNeeded(fxTrackId)

    let buffer: AudioBuffer
    try {
      buffer = await this.loadBuffer(audioUrl)
    } catch (error) {
      console.error(`Soundboard playback failed for "${trackName}"`, error)
      return
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.connect(this.soundboardMasterBus)

    const instanceId = `${fxTrackId}-${Date.now()}-${Math.random()}`
    const instance: SoundboardInstance = {
      instanceId,
      fxTrackId,
      trackName,
      source,
      startedAt: Date.now(),
    }

    source.onended = () => {
      this.removeSoundboardInstance(instanceId)
    }

    source.start(0)
    this.soundboardInstances.push(instance)
    this.notify()
  }

  stopSoundboardFx(fxTrackId: string): void {
    const toStop = this.soundboardInstances.filter((item) => item.fxTrackId === fxTrackId)
    for (const instance of toStop) {
      try {
        instance.source.stop()
      } catch {
        // already stopped
      }
      this.removeSoundboardInstance(instance.instanceId)
    }
  }

  canPlaySoundscape(slotId: string): boolean {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot) {
      return false
    }
    return slot.config.trackIds.length > 0
  }

  hasLoadedSoundscapeTrack(slotId: string): boolean {
    const slot = this.soundscapeSlots.get(slotId)
    return Boolean(slot?.config.currentTrackId)
  }

  async playSoundscape(slotId: string): Promise<void> {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot || slot.config.trackIds.length === 0) {
      return
    }

    await resumeAudioContext()

    if (slot.paused && slot.config.currentTrackId) {
      slot.paused = false
      this.enforceSoundscapeConcurrency(slotId)
      const trackStillValid = slot.config.trackIds.includes(slot.config.currentTrackId)
      const trackId = trackStillValid
        ? slot.config.currentTrackId
        : pickRandomTrackId(slot.config.trackIds) ?? slot.config.currentTrackId
      if (!trackStillValid && trackId) {
        slot.config.currentTrackId = trackId
      }
      await this.startSoundscapeTrack(slot, trackId, false)
      return
    }

    if (slot.playing) {
      return
    }

    if (!slot.config.currentTrackId) {
      const trackId = pickRandomTrackId(slot.config.trackIds)
      if (!trackId) {
        return
      }
      slot.config.currentTrackId = trackId
    }

    this.enforceSoundscapeConcurrency(slotId)
    await this.startSoundscapeTrack(slot, slot.config.currentTrackId, false)
  }

  pauseSoundscape(slotId: string): void {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot?.currentSource) {
      return
    }
    slot.frozenProgress = this.getSlotProgress(slot)
    try {
      slot.currentSource.source.stop()
    } catch {
      // ignore
    }
    slot.currentSource.source.onended = null
    slot.currentSource = undefined
    slot.playing = false
    slot.paused = true
    if (slot.progressRaf) {
      cancelAnimationFrame(slot.progressRaf)
      slot.progressRaf = undefined
    }
    this.notify()
  }

  async rollSoundscapeRandom(slotId: string): Promise<void> {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot || slot.config.trackIds.length === 0) {
      return
    }
    await resumeAudioContext()
    const nextTrackId = pickRandomTrackId(slot.config.trackIds, slot.config.currentTrackId)
    if (!nextTrackId) {
      return
    }
    slot.config.currentTrackId = nextTrackId
    if (slot.playing && !slot.paused) {
      await this.crossfadeSoundscapeToTrack(slot, nextTrackId)
    } else {
      this.enforceSoundscapeConcurrency(slotId)
      await this.startSoundscapeTrack(slot, nextTrackId, false)
    }
    this.notify()
  }

  async playScene(): Promise<void> {
    for (const [slotId, slot] of this.soundscapeSlots) {
      const action = resolvePlaySceneSlotAction({
        playing: slot.playing,
        paused: slot.paused,
        trackIds: slot.config.trackIds,
      })
      if (action === 'skip-playing' || action === 'skip-empty') {
        continue
      }
      if (action === 'resume') {
        await this.playSoundscape(slotId)
        continue
      }
      if (!slot.config.currentTrackId) {
        const trackId = pickRandomTrackId(slot.config.trackIds)
        if (!trackId) {
          continue
        }
        slot.config.currentTrackId = trackId
      }
      await this.playSoundscape(slotId)
    }
  }

  async switchScene(nextSceneId: string): Promise<void> {
    if (this.currentSceneId === nextSceneId) {
      return
    }
    const now = this.ctx.currentTime
    const fadeEnd = now + CROSSFADE_SECONDS

    this.soundboardMasterBus.gain.cancelScheduledValues(now)
    this.soundboardMasterBus.gain.setValueAtTime(this.soundboardMasterBus.gain.value, now)
    this.soundboardMasterBus.gain.linearRampToValueAtTime(0, fadeEnd)

    this.soundscapeMasterBus.gain.cancelScheduledValues(now)
    this.soundscapeMasterBus.gain.setValueAtTime(this.soundscapeMasterBus.gain.value, now)
    this.soundscapeMasterBus.gain.linearRampToValueAtTime(0, fadeEnd)

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, CROSSFADE_SECONDS * 1000)
    })

    for (const slotId of [...this.soundscapeSlots.keys()]) {
      this.removeSoundscapeSlot(slotId)
    }
    for (const instance of [...this.soundboardInstances]) {
      try {
        instance.source.stop()
      } catch {
        // ignore
      }
      this.removeSoundboardInstance(instance.instanceId, false)
    }

    this.soundboardMasterBus.gain.cancelScheduledValues(this.ctx.currentTime)
    this.soundscapeMasterBus.gain.cancelScheduledValues(this.ctx.currentTime)
    this.applySoundboardMasterVolume()
    this.applySoundscapeMasterVolume()
    this.currentSceneId = nextSceneId
    this.notify()
  }

  stopAll(fadeSeconds = STOP_ALL_FADE_SECONDS): void {
    const now = this.ctx.currentTime
    const fadeEnd = now + fadeSeconds

    this.soundboardMasterBus.gain.cancelScheduledValues(now)
    this.soundboardMasterBus.gain.setValueAtTime(this.soundboardMasterBus.gain.value, now)
    this.soundboardMasterBus.gain.linearRampToValueAtTime(0, fadeEnd)

    this.soundscapeMasterBus.gain.cancelScheduledValues(now)
    this.soundscapeMasterBus.gain.setValueAtTime(this.soundscapeMasterBus.gain.value, now)
    this.soundscapeMasterBus.gain.linearRampToValueAtTime(0, fadeEnd)

    window.setTimeout(() => {
      for (const instance of [...this.soundboardInstances]) {
        try {
          instance.source.stop()
        } catch {
          // ignore
        }
        this.removeSoundboardInstance(instance.instanceId, false)
      }

      for (const slot of this.soundscapeSlots.values()) {
        if (slot.currentSource) {
          try {
            slot.currentSource.source.stop()
          } catch {
            // ignore
          }
          slot.currentSource.source.onended = null
          slot.currentSource = undefined
        }
        slot.playing = false
        slot.paused = false
        if (slot.progressRaf) {
          cancelAnimationFrame(slot.progressRaf)
          slot.progressRaf = undefined
        }
      }

      this.soundboardMasterBus.gain.cancelScheduledValues(this.ctx.currentTime)
      this.soundscapeMasterBus.gain.cancelScheduledValues(this.ctx.currentTime)
      this.applySoundboardMasterVolume()
      this.applySoundscapeMasterVolume()
      this.notify()
    }, fadeSeconds * 1000)
  }

  getState(): ScenePlaybackState {
    const soundboard: Record<string, SoundboardTileState> = {}
    const playingFxIds = new Set(this.soundboardInstances.map((item) => item.fxTrackId))
    for (const instance of this.soundboardInstances) {
      soundboard[instance.fxTrackId] = {
        fxTrackId: instance.fxTrackId,
        trackName: instance.trackName,
        playing: playingFxIds.has(instance.fxTrackId),
      }
    }

    const soundscapes: Record<string, SoundscapeTileState> = {}
    for (const slot of this.soundscapeSlots.values()) {
      const track = slot.config.currentTrackId
        ? slot.config.tracksById[slot.config.currentTrackId]
        : undefined
      soundscapes[slot.config.slotId] = {
        slotId: slot.config.slotId,
        categoryName: slot.config.categoryName,
        playing: slot.playing && !slot.paused,
        paused: slot.paused,
        progress: this.getSlotProgress(slot),
        trackName: track?.name,
        intensity: slot.config.intensity,
        volume: slot.config.volume,
        hasLoadedTrack: Boolean(slot.config.currentTrackId),
        currentTrackId: slot.config.currentTrackId,
      }
    }

    return {
      soundboard,
      soundscapes,
      soundboardMasterVolume: this.soundboardMasterVolume,
      soundscapeMasterVolume: this.soundscapeMasterVolume,
      soundscapeMuted: this.soundscapeMuted,
    }
  }

  private async loadBuffer(audioUrl: string): Promise<AudioBuffer> {
    const cached = this.bufferCache.get(audioUrl)
    if (cached) {
      return cached
    }
    const response = await fetch(audioUrl)
    if (!response.ok) {
      throw new Error(`Failed to load audio (${response.status}): ${audioUrl}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    try {
      const buffer = await this.ctx.decodeAudioData(arrayBuffer)
      this.bufferCache.set(audioUrl, buffer)
      return buffer
    } catch (error) {
      throw new Error(`Unable to decode audio: ${audioUrl}`, { cause: error })
    }
  }

  private applySoundboardMasterVolume(): void {
    this.soundboardMasterBus.gain.value = computeSoundboardGain(this.soundboardMasterVolume)
  }

  private applySoundscapeMasterVolume(): void {
    const slotMaster = mapVolumeCubic(this.soundscapeMasterVolume)
    this.soundscapeMasterBus.gain.value = this.soundscapeMuted ? 0 : slotMaster
    for (const slot of this.soundscapeSlots.values()) {
      this.updateSlotGain(slot)
    }
  }

  private updateSlotGain(slot: SoundscapeSlotRuntime): void {
    slot.slotGain.gain.value = mapVolumeCubic(slot.config.volume)
  }

  private async startSoundscapeTrack(
    slot: SoundscapeSlotRuntime,
    trackId: string,
    crossfade: boolean,
  ): Promise<void> {
    const track = slot.config.tracksById[trackId]
    if (!track) {
      return
    }

    const buffer = await this.loadBuffer(track.audioUrl)
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = false

    const targetCrossfade = slot.activeCrossfade === 'A' ? slot.crossfadeB : slot.crossfadeA
    const currentCrossfade = slot.activeCrossfade === 'A' ? slot.crossfadeA : slot.crossfadeB
    source.connect(targetCrossfade)

    const startedAt = Date.now()
    const onEnded = () => {
      if (slot.currentSource?.source !== source) {
        return
      }
      void this.handleSoundscapeTrackEnded(slot)
    }

    const activeSource: ActiveSoundscapeSource = {
      source,
      trackId,
      trackName: track.name,
      startedAt,
      duration: track.durationSeconds,
      onEnded,
    }

    if (crossfade && slot.currentSource) {
      await this.runCrossfade(slot, currentCrossfade, targetCrossfade)
      try {
        slot.currentSource.source.stop()
      } catch {
        // ignore
      }
      slot.currentSource.source.onended = null
    } else {
      currentCrossfade.gain.value = 0
      targetCrossfade.gain.value = 1
    }

    source.onended = onEnded
    source.start(0)
    slot.currentSource = activeSource
    slot.config.currentTrackId = trackId
    slot.playing = true
    slot.paused = false
    slot.frozenProgress = undefined
    slot.startedAtMs = startedAt
    slot.activeCrossfade = slot.activeCrossfade === 'A' ? 'B' : 'A'
    this.startProgressLoop(slot)
    this.notify()
  }

  private async crossfadeSoundscapeToRandomTrack(slot: SoundscapeSlotRuntime): Promise<void> {
    const trackIds = slot.config.trackIds
    const nextTrackId = pickRandomTrackId(trackIds, slot.config.currentTrackId)
    if (!nextTrackId) {
      return
    }
    slot.config.currentTrackId = nextTrackId
    await this.crossfadeSoundscapeToTrack(slot, nextTrackId)
  }

  private async crossfadeSoundscapeToTrack(slot: SoundscapeSlotRuntime, trackId: string): Promise<void> {
    this.enforceSoundscapeConcurrency(slot.config.slotId)
    await this.startSoundscapeTrack(slot, trackId, true)
  }

  private async handleSoundscapeTrackEnded(slot: SoundscapeSlotRuntime): Promise<void> {
    if (!slot.playing || slot.paused) {
      return
    }
    const nextTrackId = pickRandomTrackId(slot.config.trackIds, slot.config.currentTrackId)
    if (!nextTrackId) {
      slot.playing = false
      slot.currentSource = undefined
      this.notify()
      return
    }
    slot.config.currentTrackId = nextTrackId
    await this.startSoundscapeTrack(slot, nextTrackId, true)
  }

  private async runCrossfade(
    _slot: SoundscapeSlotRuntime,
    fromGain: GainNode,
    toGain: GainNode,
  ): Promise<void> {
    const now = this.ctx.currentTime
    fromGain.gain.cancelScheduledValues(now)
    toGain.gain.cancelScheduledValues(now)
    fromGain.gain.setValueAtTime(fromGain.gain.value, now)
    toGain.gain.setValueAtTime(0, now)

    const steps = 20
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps
      const fadeTime = now + t * CROSSFADE_SECONDS
      const outLevel = Math.cos(t * Math.PI * 0.5)
      const inLevel = Math.sin(t * Math.PI * 0.5)
      fromGain.gain.linearRampToValueAtTime(outLevel, fadeTime)
      toGain.gain.linearRampToValueAtTime(inLevel, fadeTime)
    }

    await new Promise((resolve) => {
      window.setTimeout(resolve, CROSSFADE_SECONDS * 1000)
    })
  }

  private enforceSoundscapeConcurrency(incomingSlotId: string): void {
    const playingSlots = [...this.soundscapeSlots.entries()].filter(
      ([, slot]) => slot.playing && !slot.paused,
    )
    if (playingSlots.length < MAX_SOUNDSCAPE_CONCURRENT) {
      return
    }
    const alreadyPlaying = playingSlots.some(([slotId]) => slotId === incomingSlotId)
    if (alreadyPlaying) {
      return
    }
    const [oldestSlotId] = playingSlots.sort(
      (a, b) => a[1].startedAtMs - b[1].startedAtMs,
    )[0]
    this.stopSoundscapeSlot(oldestSlotId)
  }

  private stopSoundscapeSlot(slotId: string): void {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot) {
      return
    }
    if (slot.currentSource) {
      try {
        slot.currentSource.source.stop()
      } catch {
        // ignore
      }
      slot.currentSource.source.onended = null
      slot.currentSource = undefined
    }
    slot.playing = false
    slot.paused = false
    if (slot.progressRaf) {
      cancelAnimationFrame(slot.progressRaf)
      slot.progressRaf = undefined
    }
  }

  private evictSoundboardInstancesIfNeeded(fxTrackId: string): void {
    while (this.soundboardInstances.length >= MAX_SOUNDBOARD_GLOBAL) {
      const oldest = this.soundboardInstances.sort((a, b) => a.startedAt - b.startedAt)[0]
      if (!oldest) {
        break
      }
      try {
        oldest.source.stop()
      } catch {
        // ignore
      }
      this.removeSoundboardInstance(oldest.instanceId, false)
    }

    const perFx = this.soundboardInstances.filter((item) => item.fxTrackId === fxTrackId)
    while (perFx.length >= MAX_SOUNDBOARD_PER_FX) {
      const oldest = perFx.sort((a, b) => a.startedAt - b.startedAt)[0]
      if (!oldest) {
        break
      }
      try {
        oldest.source.stop()
      } catch {
        // ignore
      }
      this.removeSoundboardInstance(oldest.instanceId, false)
      perFx.splice(perFx.indexOf(oldest), 1)
    }
  }

  private removeSoundboardInstance(instanceId: string, notify = true): void {
    const index = this.soundboardInstances.findIndex((item) => item.instanceId === instanceId)
    if (index === -1) {
      return
    }
    this.soundboardInstances.splice(index, 1)
    if (notify) {
      this.notify()
    }
  }

  private getSlotProgress(slot: SoundscapeSlotRuntime): number {
    if (!slot.playing || slot.paused || !slot.currentSource) {
      return slot.paused ? slot.frozenProgress ?? 0 : 0
    }
    const elapsed = (Date.now() - slot.currentSource.startedAt) / 1000
    const duration = Math.max(slot.currentSource.duration, 0.001)
    return Math.min(1, elapsed / duration)
  }

  private startProgressLoop(slot: SoundscapeSlotRuntime): void {
    if (slot.progressRaf) {
      cancelAnimationFrame(slot.progressRaf)
    }
    const tick = () => {
      if (!slot.playing || slot.paused) {
        return
      }
      this.notify()
      slot.progressRaf = requestAnimationFrame(tick)
    }
    slot.progressRaf = requestAnimationFrame(tick)
  }

  private notify(): void {
    const state = this.getState()
    for (const listener of this.listeners) {
      listener(state)
    }
    this.publishE2EState(state)
  }

  private publishE2EState(state: ScenePlaybackState): void {
    const playingTracks: PlayingTrackSnapshot[] = []

    for (const instance of this.soundboardInstances) {
      playingTracks.push({
        id: instance.fxTrackId,
        name: instance.trackName,
        source: 'soundboard',
      })
    }

    for (const tile of Object.values(state.soundscapes)) {
      if (tile.playing && tile.trackName) {
        playingTracks.push({
          id: tile.slotId,
          name: tile.trackName,
          source: 'soundscape',
          slotId: tile.slotId,
          categoryName: tile.categoryName,
        })
      }
    }

    const soundscapeVolumes: Record<string, number> = {}
    for (const tile of Object.values(state.soundscapes)) {
      soundscapeVolumes[tile.categoryName] = tile.volume
    }

    publishAudioState({
      isPlaying: playingTracks.length > 0,
      trackName: playingTracks[0]?.name,
      source: playingTracks[0]?.source,
      playingTracks,
      volumes: {
        soundboardMaster: state.soundboardMasterVolume,
        soundscapeMaster: state.soundscapeMasterVolume,
        soundscapes: soundscapeVolumes,
      },
    })
  }
}

export function buildSoundscapeTrackPool(
  categoryLevels: Record<SoundscapeIntensity, string[]> | undefined,
  intensity: SoundscapeIntensity,
): string[] {
  return categoryLevels?.[intensity] ?? []
}

let sharedSceneAudioManager: SceneAudioManager | null = null

export function getSharedSceneAudioManager(): SceneAudioManager {
  if (!sharedSceneAudioManager) {
    sharedSceneAudioManager = new SceneAudioManager()
  }
  return sharedSceneAudioManager
}
