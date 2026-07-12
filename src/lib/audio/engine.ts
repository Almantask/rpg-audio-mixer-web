import { createSyntheticBuffer, fxDurationSeconds, loopDurationSeconds } from './bufferFactory'
import type { CategoryPlaybackState, EffectPlaybackState, EngineSnapshot, PlaybackStatus } from './types'
import {
  CROSSFADE_SECONDS,
  DUCK_RATIO,
  MAX_FX_INSTANCES,
  MAX_FX_INSTANCES_PER_EFFECT,
  MAX_LOOPING_CATEGORIES,
  mappedVolume,
  percentToGain,
  STOP_FADE_SECONDS,
} from './volume'
import type { IntensityLevelNumber } from '@/lib/storage/types'
import { getE2EState } from '@/lib/storage/e2eState'

interface InternalLoop {
  sceneSoundscapeId: string
  categoryId: string
  categoryName: string
  trackId: string
  trackName: string
  intensityLevel: IntensityLevelNumber
  status: PlaybackStatus
  startedAt: number
  orderIndex: number
  gainNode: GainNode
  source: AudioBufferSourceNode | null
  crossfadeSource: AudioBufferSourceNode | null
  crossfadeGain: GainNode | null
  buffer: AudioBuffer
  progressRaf: number | null
  progress: number
  baseGain: number
  categoryVolumePercent: number
}

interface InternalFx {
  id: string
  effectName: string
  startedAt: number
  orderIndex: number
  source: AudioBufferSourceNode
  gainNode: GainNode
  playbackRate: number
}

type EngineListener = () => void

function pickRandomTrack<T extends { id: string; name: string }>(
  tracks: T[],
  excludeId?: string,
): T | undefined {
  const pool = excludeId ? tracks.filter((track) => track.id !== excludeId) : tracks
  if (pool.length === 0) return tracks[0]
  return pool[Math.floor(Math.random() * pool.length)]
}

export class AudioEngine {
  private context: AudioContext | null = null
  private soundscapeBus: GainNode | null = null
  private soundboardBus: GainNode | null = null
  private duckGain: GainNode | null = null
  private masterMuted = false
  private masterVolume = 100
  private soundboardMaster = 100
  private loops = new Map<string, InternalLoop>()
  private fxInstances: InternalFx[] = []
  private orderCounter = 0
  private activeDuckCount = 0
  private listeners = new Set<EngineListener>()
  private bufferCache = new Map<string, AudioBuffer>()
  private compressor: DynamicsCompressorNode | null = null
  private pausedLoopIds = new Set<string>()
  private systemPaused = false
  private fxTriggerCount = new Map<string, number>()

  subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }

  async ensureContext(): Promise<AudioContext> {
    if (!this.context) {
      this.context = new AudioContext()
      this.compressor = this.context.createDynamicsCompressor()
      this.compressor.threshold.value = -12
      this.compressor.knee.value = 24
      this.compressor.ratio.value = 8
      this.compressor.attack.value = 0.003
      this.compressor.release.value = 0.15
      this.soundscapeBus = this.context.createGain()
      this.duckGain = this.context.createGain()
      this.duckGain.gain.value = 1
      this.soundboardBus = this.context.createGain()
      this.soundscapeBus.connect(this.duckGain)
      this.duckGain.connect(this.compressor)
      this.soundboardBus.connect(this.compressor)
      this.compressor.connect(this.context.destination)
      this.applyMasterGain()
      this.applySoundboardGain()
    }
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
    return this.context
  }

  getContextState(): AudioContextState | 'uninitialized' {
    return this.context?.state ?? 'uninitialized'
  }

  setMasterVolume(percent: number): void {
    this.masterVolume = percent
    this.applyMasterGain()
    for (const loop of this.loops.values()) {
      loop.baseGain = mappedVolume(this.masterVolume, loop.categoryVolumePercent)
    }
    this.refreshLoopOutputGains()
    this.emit()
  }

  setMasterMuted(muted: boolean): void {
    this.masterMuted = muted
    this.applyMasterGain()
    this.emit()
  }

  setSoundboardMaster(percent: number): void {
    this.soundboardMaster = percent
    this.applySoundboardGain()
    this.emit()
  }

  getMasterVolume(): number {
    return this.masterVolume
  }

  isMasterMuted(): boolean {
    return this.masterMuted
  }

  getSoundboardMaster(): number {
    return this.soundboardMaster
  }

  private applyMasterGain(): void {
    if (!this.soundscapeBus) return
    const gain = this.masterMuted ? 0 : percentToGain(this.masterVolume)
    this.soundscapeBus.gain.value = gain
  }

  private applySoundboardGain(): void {
    if (!this.soundboardBus) return
    this.soundboardBus.gain.value = percentToGain(this.soundboardMaster)
  }

  private nextOrder(): number {
    this.orderCounter += 1
    return this.orderCounter
  }

  private async getBuffer(name: string, isLoop: boolean): Promise<AudioBuffer> {
    const key = `${isLoop ? 'loop' : 'fx'}:${name}`
    const cached = this.bufferCache.get(key)
    if (cached) return cached
    const context = await this.ensureContext()
    const buffer = createSyntheticBuffer(
      context,
      name,
      isLoop ? loopDurationSeconds() : fxDurationSeconds(),
    )
    this.bufferCache.set(key, buffer)
    return buffer
  }

  updateCategoryVolumeByName(categoryName: string, categoryVolumePercent: number): void {
    const loop = this.findLoopByCategoryName(categoryName)
    if (!loop) return
    loop.categoryVolumePercent = categoryVolumePercent
    loop.baseGain = mappedVolume(this.masterVolume, categoryVolumePercent)
    this.refreshLoopOutputGains()
    this.emit()
  }

  private refreshLoopOutputGains(): void {
    const duckMultiplier = this.activeDuckCount > 0 ? DUCK_RATIO : 1
    for (const loop of this.loops.values()) {
      const target = loop.status === 'playing' ? loop.baseGain * duckMultiplier : loop.baseGain
      loop.gainNode.gain.value = target
    }
  }

  private findLoopByCategoryName(name: string): InternalLoop | undefined {
    for (const loop of this.loops.values()) {
      if (loop.categoryName === name) return loop
    }
    return undefined
  }

  private countPlayingLoops(): number {
    let count = 0
    for (const loop of this.loops.values()) {
      if (loop.status === 'playing') count += 1
    }
    return count
  }

  private enforceLoopCap(exemptId?: string): void {
    while (this.countPlayingLoops() >= MAX_LOOPING_CATEGORIES) {
      const playing = [...this.loops.values()]
        .filter((loop) => loop.status === 'playing' && loop.sceneSoundscapeId !== exemptId)
        .sort((left, right) => left.orderIndex - right.orderIndex)
      const oldest = playing[0]
      if (!oldest) break
      this.pauseLoopInternal(oldest, true)
    }
  }

  async loadCategoryTrack(input: {
    sceneSoundscapeId: string
    categoryId: string
    categoryName: string
    trackId: string
    trackName: string
    intensityLevel: IntensityLevelNumber
    categoryVolumePercent: number
  }): Promise<void> {
    await this.ensureContext()
    const existing = this.loops.get(input.sceneSoundscapeId)
    if (existing) {
      this.stopLoopSources(existing)
    }
    const buffer = await this.getBuffer(input.trackName, true)
    const context = this.context!
    const gainNode = context.createGain()
    gainNode.connect(this.soundscapeBus!)
    const loop: InternalLoop = {
      sceneSoundscapeId: input.sceneSoundscapeId,
      categoryId: input.categoryId,
      categoryName: input.categoryName,
      trackId: input.trackId,
      trackName: input.trackName,
      intensityLevel: input.intensityLevel,
      status: 'paused',
      startedAt: Date.now(),
      orderIndex: existing?.orderIndex ?? this.nextOrder(),
      gainNode,
      source: null,
      crossfadeSource: null,
      crossfadeGain: null,
      buffer,
      progressRaf: null,
      progress: 0,
      baseGain: mappedVolume(this.masterVolume, input.categoryVolumePercent),
      categoryVolumePercent: input.categoryVolumePercent,
    }
    this.loops.set(input.sceneSoundscapeId, loop)
    this.emit()
  }

  async playCategory(sceneSoundscapeId: string): Promise<void> {
    const loop = this.loops.get(sceneSoundscapeId)
    if (!loop || !loop.trackId) return
    if (loop.status === 'playing') return

    const { playbackFailCategories } = getE2EState()
    if (playbackFailCategories.includes(loop.categoryName)) {
      throw new Error(`Audio file not found for category "${loop.categoryName}"`)
    }

    this.enforceLoopCap(sceneSoundscapeId)
    loop.status = 'playing'
    loop.orderIndex = this.nextOrder()
    loop.startedAt = Date.now()
    this.startLoopSource(loop)
    this.refreshLoopOutputGains()
    this.emit()
  }

  pauseCategory(sceneSoundscapeId: string): void {
    const loop = this.loops.get(sceneSoundscapeId)
    if (!loop) return
    this.pauseLoopInternal(loop, false)
    this.emit()
  }

  pauseCategoryByName(categoryName: string): void {
    const loop = this.findLoopByCategoryName(categoryName)
    if (!loop) return
    this.pauseLoopInternal(loop, false)
    this.emit()
  }

  private pauseLoopInternal(loop: InternalLoop, evict: boolean): void {
    loop.status = evict ? 'idle' : 'paused'
    this.stopLoopSources(loop)
    loop.progress = 0
    if (evict) {
      loop.gainNode.gain.value = 0
    }
  }

  private stopLoopSources(loop: InternalLoop): void {
    if (loop.progressRaf !== null) {
      cancelAnimationFrame(loop.progressRaf)
      loop.progressRaf = null
    }
    if (loop.source) {
      try {
        loop.source.onended = null
        loop.source.stop()
      } catch {
        // already stopped
      }
      loop.source.disconnect()
      loop.source = null
    }
    if (loop.crossfadeSource) {
      try {
        loop.crossfadeSource.stop()
      } catch {
        // already stopped
      }
      loop.crossfadeSource.disconnect()
      loop.crossfadeSource = null
    }
    if (loop.crossfadeGain) {
      loop.crossfadeGain.disconnect()
      loop.crossfadeGain = null
    }
  }

  private startLoopSource(loop: InternalLoop, offset = 0): void {
    if (!this.context) return
    this.stopLoopSources(loop)
    const source = this.context.createBufferSource()
    source.buffer = loop.buffer
    source.loop = false
    source.connect(loop.gainNode)
    const startedAt = this.context.currentTime
    source.start(0, offset)
    loop.source = source
    loop.progress = offset / loop.buffer.duration

    source.onended = () => {
      if (loop.status !== 'playing') return
      void this.handleLoopEnded(loop.sceneSoundscapeId)
    }

    const tick = (): void => {
      if (!this.context || loop.status !== 'playing' || !loop.source) return
      const elapsed = this.context.currentTime - startedAt + offset
      loop.progress = Math.min(1, elapsed / loop.buffer.duration)
      if (loop.progress < 1) {
        loop.progressRaf = requestAnimationFrame(tick)
        this.emit()
      }
    }
    loop.progressRaf = requestAnimationFrame(tick)
  }

  private async handleLoopEnded(sceneSoundscapeId: string): Promise<void> {
    const loop = this.loops.get(sceneSoundscapeId)
    if (!loop || loop.status !== 'playing') return
    const nextTrack = this.pendingChainTrack
      ? await this.pendingChainTrack(loop.categoryId, loop.intensityLevel, loop.trackId)
      : undefined
    if (!nextTrack) return
    loop.trackId = nextTrack.id
    loop.trackName = nextTrack.name
    loop.buffer = await this.getBuffer(nextTrack.name, true)
    loop.progress = 0
    this.startLoopSource(loop)
    this.emit()
  }

  private pendingChainTrack?: (
    categoryId: string,
    level: IntensityLevelNumber,
    excludeTrackId: string,
  ) => Promise<{ id: string; name: string } | undefined>

  setTrackResolver(
    resolver: (
      categoryId: string,
      level: IntensityLevelNumber,
    ) => Promise<Array<{ id: string; name: string }>>,
  ): void {
    this.pendingChainTrack = async (categoryId, level, excludeTrackId) => {
      const tracks = await resolver(categoryId, level)
      return pickRandomTrack(tracks, excludeTrackId)
    }
  }

  async rollRandomTrack(input: {
    sceneSoundscapeId: string
    categoryId: string
    categoryName: string
    intensityLevel: IntensityLevelNumber
    categoryVolumePercent: number
    tracks: Array<{ id: string; name: string }>
  }): Promise<{ id: string; name: string } | undefined> {
    const track = pickRandomTrack(input.tracks)
    if (!track) return undefined
    await this.loadCategoryTrack({
      sceneSoundscapeId: input.sceneSoundscapeId,
      categoryId: input.categoryId,
      categoryName: input.categoryName,
      trackId: track.id,
      trackName: track.name,
      intensityLevel: input.intensityLevel,
      categoryVolumePercent: input.categoryVolumePercent,
    })
    return track
  }

  async crossfadeToTrack(
    sceneSoundscapeId: string,
    track: { id: string; name: string },
    intensityLevel: IntensityLevelNumber,
  ): Promise<void> {
    const loop = this.loops.get(sceneSoundscapeId)
    if (!loop || !this.context) return
    const newBuffer = await this.getBuffer(track.name, true)
    const context = this.context
    const crossfadeGain = context.createGain()
    crossfadeGain.gain.value = 0
    crossfadeGain.connect(loop.gainNode)
    const newSource = context.createBufferSource()
    newSource.buffer = newBuffer
    newSource.connect(crossfadeGain)
    const now = context.currentTime
    crossfadeGain.gain.setValueAtTime(0, now)
    crossfadeGain.gain.linearRampToValueAtTime(1, now + CROSSFADE_SECONDS)
    if (loop.source) {
      loop.gainNode.gain.setValueAtTime(loop.gainNode.gain.value, now)
      loop.gainNode.gain.linearRampToValueAtTime(0, now + CROSSFADE_SECONDS)
    }
    newSource.start(now)
    newSource.onended = () => {
      if (loop.status !== 'playing') return
      void this.handleLoopEnded(sceneSoundscapeId)
    }
    loop.crossfadeSource = newSource
    loop.crossfadeGain = crossfadeGain
    loop.trackId = track.id
    loop.trackName = track.name
    loop.intensityLevel = intensityLevel
    loop.buffer = newBuffer
    window.setTimeout(() => {
      if (loop.source) {
        try {
          loop.source.stop()
        } catch {
          // ignore
        }
        loop.source.disconnect()
      }
      loop.source = newSource
      loop.crossfadeSource = null
      loop.crossfadeGain = null
      loop.gainNode.gain.value = loop.baseGain * (this.activeDuckCount > 0 ? DUCK_RATIO : 1)
    }, CROSSFADE_SECONDS * 1000)
    this.emit()
  }

  async triggerEffect(effectName: string): Promise<void> {
    const { playbackFailEffects } = getE2EState()
    if (playbackFailEffects.includes(effectName)) {
      throw new Error(`Audio file not found for "${effectName}"`)
    }
    await this.ensureContext()
    const context = this.context!
    this.enforceFxCap(effectName)
    const buffer = await this.getBuffer(effectName, false)
    const gainNode = context.createGain()
    gainNode.connect(this.soundboardBus!)
    const variation = this.nextFxVariation(effectName)
    gainNode.gain.value = percentToGain(this.soundboardMaster) * variation.gainScale
    const source = context.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = variation.playbackRate
    source.connect(gainNode)
    const instance: InternalFx = {
      id: crypto.randomUUID(),
      effectName,
      startedAt: Date.now(),
      orderIndex: this.nextOrder(),
      source,
      gainNode,
      playbackRate: variation.playbackRate,
    }
    source.onended = () => {
      this.removeFxInstance(instance.id)
      this.decrementDuck()
      this.emit()
    }
    source.start()
    this.fxInstances.push(instance)
    this.incrementDuck()
    this.emit()
  }

  private enforceFxCap(effectName: string): void {
    const sameEffect = this.fxInstances.filter((fx) => fx.effectName === effectName)
    if (sameEffect.length >= MAX_FX_INSTANCES_PER_EFFECT) {
      const oldest = sameEffect.sort((left, right) => left.orderIndex - right.orderIndex)[0]
      if (oldest) this.stopFxInstance(oldest.id)
    }
    while (this.fxInstances.length >= MAX_FX_INSTANCES) {
      const oldest = [...this.fxInstances].sort((left, right) => left.orderIndex - right.orderIndex)[0]
      if (!oldest) break
      this.stopFxInstance(oldest.id)
    }
  }

  stopEffectInstances(effectName: string): void {
    const targets = this.fxInstances.filter((fx) => fx.effectName === effectName)
    for (const fx of targets) {
      this.stopFxInstance(fx.id)
    }
    this.emit()
  }

  stopAll(): void {
    for (const loop of this.loops.values()) {
      if (loop.status === 'playing') {
        this.fadeOutLoop(loop, () => this.pauseLoopInternal(loop, false))
      } else {
        this.pauseLoopInternal(loop, false)
      }
    }
    for (const fx of [...this.fxInstances]) {
      this.stopFxInstance(fx.id)
    }
    this.activeDuckCount = 0
    this.refreshLoopOutputGains()
    this.emit()
  }

  pauseAllForSystemEvent(): void {
    this.systemPaused = true
    this.pausedLoopIds.clear()
    for (const loop of this.loops.values()) {
      if (loop.status === 'playing') {
        this.pausedLoopIds.add(loop.sceneSoundscapeId)
        this.pauseLoopInternal(loop, false)
      }
    }
    for (const fx of [...this.fxInstances]) {
      this.stopFxInstance(fx.id)
    }
    this.activeDuckCount = 0
    this.refreshLoopOutputGains()
    this.emit()
  }

  resumeAfterSystemEvent(): void {
    if (!this.systemPaused) return
    this.systemPaused = false
    for (const id of this.pausedLoopIds) {
      const loop = this.loops.get(id)
      if (!loop) continue
      loop.status = 'playing'
      this.startLoopSource(loop)
    }
    this.pausedLoopIds.clear()
    this.refreshLoopOutputGains()
    this.emit()
  }

  private fadeOutLoop(loop: InternalLoop, onComplete: () => void): void {
    if (!this.context) {
      onComplete()
      return
    }
    const now = this.context.currentTime
    loop.gainNode.gain.cancelScheduledValues(now)
    loop.gainNode.gain.setValueAtTime(loop.gainNode.gain.value, now)
    loop.gainNode.gain.linearRampToValueAtTime(0, now + STOP_FADE_SECONDS)
    window.setTimeout(onComplete, STOP_FADE_SECONDS * 1000)
  }

  private nextFxVariation(effectName: string): { playbackRate: number; gainScale: number } {
    const count = (this.fxTriggerCount.get(effectName) ?? 0) + 1
    this.fxTriggerCount.set(effectName, count)
    const seed = hashString(`${effectName}:${count}`)
    const playbackRate = 0.88 + (seed % 25) / 100
    const gainScale = 0.85 + (seed % 16) / 100
    return { playbackRate, gainScale }
  }

  getLastFxPlaybackRate(effectName: string): number | undefined {
    const instances = this.fxInstances.filter((fx) => fx.effectName === effectName)
    return instances[instances.length - 1]?.playbackRate
  }

  private stopFxInstance(id: string): void {
    const instance = this.fxInstances.find((fx) => fx.id === id)
    if (!instance) return
    try {
      instance.source.onended = null
      instance.source.stop()
    } catch {
      // ignore
    }
    instance.source.disconnect()
    instance.gainNode.disconnect()
    this.removeFxInstance(id)
  }

  private removeFxInstance(id: string): void {
    this.fxInstances = this.fxInstances.filter((fx) => fx.id !== id)
  }

  private incrementDuck(): void {
    this.activeDuckCount += 1
    this.refreshLoopOutputGains()
  }

  private decrementDuck(): void {
    this.activeDuckCount = Math.max(0, this.activeDuckCount - 1)
    this.refreshLoopOutputGains()
  }

  getCategoryGain(categoryName: string): number {
    const loop = this.findLoopByCategoryName(categoryName)
    if (!loop) return 0
    return loop.gainNode.gain.value
  }

  getEffectGain(effectName: string): number {
    const instances = this.fxInstances.filter((fx) => fx.effectName === effectName)
    if (instances.length === 0) return 0
    return instances[instances.length - 1].gainNode.gain.value
  }

  isCategoryPlaying(categoryName: string): boolean {
    const loop = this.findLoopByCategoryName(categoryName)
    return loop?.status === 'playing'
  }

  isEffectPlaying(effectName: string): boolean {
    return this.fxInstances.some((fx) => fx.effectName === effectName)
  }

  getEffectInstanceCount(effectName: string): number {
    return this.fxInstances.filter((fx) => fx.effectName === effectName).length
  }

  getActiveFxCount(): number {
    return this.fxInstances.length
  }

  getActiveLoopCount(): number {
    return this.countPlayingLoops()
  }

  isDucked(): boolean {
    return this.activeDuckCount > 0
  }

  getCategoryState(categoryName: string): CategoryPlaybackState | undefined {
    const loop = this.findLoopByCategoryName(categoryName)
    if (!loop) return undefined
    return {
      categoryName: loop.categoryName,
      status: loop.status,
      trackId: loop.trackId,
      trackName: loop.trackName,
      intensityLevel: loop.intensityLevel,
      progress: loop.progress,
      gain: loop.gainNode.gain.value,
      ducked: this.activeDuckCount > 0 && loop.status === 'playing',
    }
  }

  getEffectState(effectName: string): EffectPlaybackState {
    const instances = this.fxInstances.filter((fx) => fx.effectName === effectName)
    return {
      effectName,
      instanceCount: instances.length,
      playing: instances.length > 0,
      gain: instances.length > 0 ? instances[instances.length - 1].gainNode.gain.value : 0,
    }
  }

  getSnapshot(): EngineSnapshot {
    return {
      loops: [...this.loops.values()].map((loop) => ({
        categoryName: loop.categoryName,
        status: loop.status,
        trackId: loop.trackId,
        trackName: loop.trackName,
        intensityLevel: loop.intensityLevel,
        progress: loop.progress,
        gain: loop.gainNode.gain.value,
        ducked: this.activeDuckCount > 0 && loop.status === 'playing',
      })),
      effects: [...new Set(this.fxInstances.map((fx) => fx.effectName))].map((name) =>
        this.getEffectState(name),
      ),
      masterVolume: this.masterVolume,
      masterMuted: this.masterMuted,
      soundboardMaster: this.soundboardMaster,
      duckActive: this.activeDuckCount > 0,
      activeFxCount: this.fxInstances.length,
      activeLoopCount: this.countPlayingLoops(),
    }
  }

  /** Test helper: force loop end to trigger auto-chain. */
  simulateTrackEnd(categoryName: string): void {
    const loop = this.findLoopByCategoryName(categoryName)
    if (!loop || loop.status !== 'playing') return
    void this.handleLoopEnded(loop.sceneSoundscapeId)
  }

  removeCategory(sceneSoundscapeId: string): void {
    const loop = this.loops.get(sceneSoundscapeId)
    if (!loop) return
    this.stopLoopSources(loop)
    loop.gainNode.disconnect()
    this.loops.delete(sceneSoundscapeId)
    this.emit()
  }

  hasLoadedTrack(sceneSoundscapeId: string): boolean {
    const loop = this.loops.get(sceneSoundscapeId)
    return Boolean(loop?.trackId)
  }

  getLoadedTrackName(sceneSoundscapeId: string): string | undefined {
    return this.loops.get(sceneSoundscapeId)?.trackName
  }

  getLoopStatus(sceneSoundscapeId: string): PlaybackStatus {
    return this.loops.get(sceneSoundscapeId)?.status ?? 'idle'
  }
}

export const audioEngine = new AudioEngine()

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

if (typeof window !== 'undefined') {
  window.__arcanumAudioEngine = audioEngine
}
