import type { SoundscapeIntensity } from '@/types/scene'
import { resolveAudioUrl } from '@/lib/resolveAudioUrl'
import { getAudioContext, resumeAudioContext } from './audioContextManager'
import { publishAudioState, type PlayingTrackSnapshot } from './audioState'
import { mapVolumeCubic } from './volume'
import {
  extractYoutubeIdFromAudioUrl,
  isYoutubeAudioUrl,
  startYoutubePlayback,
  type YoutubePlaybackSession,
} from './youtubePlayer'

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

/** Keep a loaded track across React reconfigure when persisted currentTrackId is omitted. */
export function resolveConfiguredTrackId(input: {
  incomingTrackId?: string
  existingTrackId?: string
  trackIds: string[]
}): string | undefined {
  const candidate = input.incomingTrackId ?? input.existingTrackId
  return candidate && input.trackIds.includes(candidate) ? candidate : undefined
}

export interface SoundscapeTrackRef {
  id: string
  name: string
  audioUrl: string
  durationSeconds: number
  type?: 'local' | 'youtube' | 'youtube-playlist'
  youtubeId?: string
  playlistVideos?: { youtubeId: string; name: string; durationSeconds: number }[]
  isOfflineReady?: boolean
}

/** One pickable item in an intensity pool — playlist videos share the pool with local tracks (YT-02). */
export type SoundscapePoolPick =
  | { kind: 'track'; trackId: string }
  | { kind: 'playlist-video'; playlistTrackId: string; videoIndex: number }

export function buildExpandedSoundscapePool(
  trackIds: string[],
  tracksById: Record<string, SoundscapeTrackRef>,
): SoundscapePoolPick[] {
  const picks: SoundscapePoolPick[] = []
  for (const trackId of trackIds) {
    const track = tracksById[trackId]
    if (!track) {
      continue
    }
    if (track.type === 'youtube-playlist' && (track.playlistVideos?.length ?? 0) > 0) {
      for (let videoIndex = 0; videoIndex < track.playlistVideos!.length; videoIndex += 1) {
        picks.push({ kind: 'playlist-video', playlistTrackId: trackId, videoIndex })
      }
      continue
    }
    picks.push({ kind: 'track', trackId })
  }
  return picks
}

export function pickExpandedSoundscapeEntry(
  picks: SoundscapePoolPick[],
  exclude?: SoundscapePoolPick,
): SoundscapePoolPick | undefined {
  if (picks.length === 0) {
    return undefined
  }
  const candidates = exclude
    ? picks.filter((pick) => {
        if (pick.kind !== exclude.kind) {
          return true
        }
        if (pick.kind === 'track' && exclude.kind === 'track') {
          return pick.trackId !== exclude.trackId
        }
        if (pick.kind === 'playlist-video' && exclude.kind === 'playlist-video') {
          return !(
            pick.playlistTrackId === exclude.playlistTrackId &&
            pick.videoIndex === exclude.videoIndex
          )
        }
        return true
      })
    : picks
  const pool = candidates.length > 0 ? candidates : picks
  return pool[Math.floor(Math.random() * pool.length)]
}

export function defaultIntensityForCategoryLevels(
  levels: Record<SoundscapeIntensity, string[]> | undefined,
): SoundscapeIntensity {
  if ((levels?.I.length ?? 0) > 0) {
    return 'I'
  }
  if ((levels?.II.length ?? 0) > 0) {
    return 'II'
  }
  if ((levels?.III.length ?? 0) > 0) {
    return 'III'
  }
  return 'II'
}

/**
 * Composer adds tracks to Level I by default while scene slots historically defaulted to II.
 * When II has no YouTube content but I does, prefer I so d20/Play Scene can reach imported YT.
 */
export function resolveSceneIntensityForYoutube(
  intensity: SoundscapeIntensity,
  levels: Record<SoundscapeIntensity, string[]> | undefined,
  tracksById: Record<string, SoundscapeTrackRef>,
): SoundscapeIntensity {
  const levelHasYoutube = (level: SoundscapeIntensity) =>
    (levels?.[level] ?? []).some((trackId) => {
      const track = tracksById[trackId]
      return track?.type === 'youtube' || track?.type === 'youtube-playlist'
    })

  if (intensity !== 'II' || levelHasYoutube('II') || !levelHasYoutube('I')) {
    return intensity
  }
  return 'I'
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
  kind: 'local' | 'youtube'
  source?: AudioBufferSourceNode
  youtube?: YoutubePlaybackSession
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
  playlistState?: {
    playlistTrackId: string
    videos: { youtubeId: string; name: string; durationSeconds: number }[]
    currentVideoIndex: number
  }
}

export class SceneAudioManager {
  private readonly ctx: AudioContext
  private readonly soundboardMasterBus: GainNode
  private readonly soundscapeMasterBus: GainNode

  private readonly bufferCache = new Map<string, AudioBuffer>()
  private readonly soundboardInstances: SoundboardInstance[] = []
  private readonly soundscapeSlots = new Map<string, SoundscapeSlotRuntime>()
  private readonly listeners = new Set<StateListener>()
  private interruptionStartedAt: number | null = null
  /** Exact simulated elapsed ms for tests; avoids Date.now() skew at the 3-minute boundary. */
  private interruptionElapsedOverrideMs: number | null = null
  private readonly wasPlayingSlotsBeforeInterruption = new Set<string>()

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

    this.ctx.addEventListener('statechange', () => {
      if (this.ctx.state === 'suspended') {
        const hasPlaying = [...this.soundscapeSlots.values()].some(s => s.playing && !s.paused) || this.soundboardInstances.length > 0
        if (hasPlaying) {
          this.handleInterruptionStart(0)
        }
      } else if (this.ctx.state === 'running') {
        void this.handleInterruptionEnd()
      }
    })

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__ARCANUM_SIMULATE_INTERRUPTION_START__ = (simulatedDurationMs?: number) => {
        this.handleInterruptionStart(simulatedDurationMs ?? 0)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__ARCANUM_SIMULATE_INTERRUPTION_END__ = () => {
        void this.handleInterruptionEnd()
      }
    }
  }

  handleInterruptionStart(simulatedDurationMs = 0): void {
    if (this.interruptionStartedAt !== null) {
      return
    }
    this.interruptionStartedAt = Date.now() - simulatedDurationMs
    this.interruptionElapsedOverrideMs =
      simulatedDurationMs > 0 ? simulatedDurationMs : null

    this.wasPlayingSlotsBeforeInterruption.clear()
    for (const [slotId, slot] of this.soundscapeSlots) {
      if (slot.playing && !slot.paused) {
        this.wasPlayingSlotsBeforeInterruption.add(slotId)
        this.pauseSoundscape(slotId)
      }
    }

    for (const inst of [...this.soundboardInstances]) {
      try {
        inst.source.stop()
      } catch {
        // ignore
      }
      this.removeSoundboardInstance(inst.instanceId, false)
    }
    this.notify()
  }

  async handleInterruptionEnd(): Promise<void> {
    if (this.interruptionStartedAt === null) {
      return
    }
    const elapsed =
      this.interruptionElapsedOverrideMs ?? Date.now() - this.interruptionStartedAt
    this.interruptionStartedAt = null
    this.interruptionElapsedOverrideMs = null

    if (elapsed <= 180_000) {
      for (const slotId of this.wasPlayingSlotsBeforeInterruption) {
        await this.playSoundscape(slotId)
      }
    }
    this.wasPlayingSlotsBeforeInterruption.clear()
    this.notify()
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
    const existing = this.soundscapeSlots.get(normalizedConfig.slotId)

    // Prefer an explicit persisted track id; otherwise keep a still-valid runtime load.
    // Reconfigure from React often omits currentTrackId and must not wipe a loaded/paused track.
    normalizedConfig.currentTrackId = resolveConfiguredTrackId({
      incomingTrackId: normalizedConfig.currentTrackId,
      existingTrackId: existing?.config.currentTrackId,
      trackIds: normalizedConfig.trackIds,
    })

    if (existing) {
      existing.config = normalizedConfig
      if (
        existing.playlistState &&
        !normalizedConfig.trackIds.includes(existing.playlistState.playlistTrackId)
      ) {
        existing.playlistState = undefined
      }
      // Stale paused chrome without a loaded track would leave ▶ disabled forever.
      if (!normalizedConfig.currentTrackId && existing.paused && !existing.playing) {
        existing.paused = false
        existing.playlistState = undefined
      }
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
    slot.playlistState = undefined
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
    const isOffline = typeof window !== 'undefined' && !window.navigator.onLine
    if (isOffline) {
      const hasOnlineOnly = slot.config.trackIds.some((trackId) => {
        const track = slot.config.tracksById[trackId]
        return (
          track &&
          ((track as any).type === 'youtube' || (track as any).type === 'youtube-playlist') &&
          !(track as any).isOfflineReady
        )
      })
      if (hasOnlineOnly) {
        return false
      }
    }
    return slot.config.trackIds.length > 0
  }

  hasLoadedSoundscapeTrack(slotId: string): boolean {
    const slot = this.soundscapeSlots.get(slotId)
    const loadedTrackId =
      slot?.config.currentTrackId ??
      (slot?.playlistState && slot.config.trackIds.includes(slot.playlistState.playlistTrackId)
        ? slot.playlistState.playlistTrackId
        : undefined)
    if (!slot || !loadedTrackId) {
      return false
    }
    if (!slot.config.currentTrackId) {
      slot.config.currentTrackId = loadedTrackId
    }
    const isOffline = typeof window !== 'undefined' && !window.navigator.onLine
    if (isOffline) {
      const track = slot.config.tracksById[loadedTrackId]
      const isOnlineOnly =
        track &&
        ((track as any).type === 'youtube' || (track as any).type === 'youtube-playlist') &&
        !(track as any).isOfflineReady
      if (isOnlineOnly) {
        return false
      }
    }
    return true
  }

  async playSoundscape(slotId: string): Promise<void> {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot || slot.config.trackIds.length === 0) {
      return
    }
    if (!this.canPlaySoundscape(slotId)) {
      return
    }

    await resumeAudioContext()

    if (slot.paused) {
      const resumeTrackId =
        (slot.config.currentTrackId &&
        slot.config.trackIds.includes(slot.config.currentTrackId)
          ? slot.config.currentTrackId
          : undefined) ??
        (slot.playlistState &&
        slot.config.trackIds.includes(slot.playlistState.playlistTrackId)
          ? slot.playlistState.playlistTrackId
          : undefined) ??
        pickRandomTrackId(slot.config.trackIds)
      if (!resumeTrackId) {
        return
      }
      slot.config.currentTrackId = resumeTrackId
      slot.paused = false
      this.enforceSoundscapeConcurrency(slotId)
      await this.startSoundscapeTrack(slot, resumeTrackId, false)
      return
    }

    if (slot.playing) {
      return
    }

    if (!slot.config.currentTrackId) {
      const applied = this.applyPoolPick(slot, this.pickFromExpandedPool(slot))
      if (!applied) {
        return
      }
    }

    this.enforceSoundscapeConcurrency(slotId)
    await this.startSoundscapeTrack(slot, slot.config.currentTrackId!, false)
  }

  pauseSoundscape(slotId: string): void {
    const slot = this.soundscapeSlots.get(slotId)
    if (!slot?.currentSource) {
      return
    }
    slot.frozenProgress = this.getSlotProgress(slot)
    this.stopActiveSource(slot.currentSource)
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

    // YT-09: once inside a playlist, d20 re-picks inside that playlist.
    if (slot.playlistState && slot.playlistState.videos.length > 0) {
      const videos = slot.playlistState.videos
      let nextIndex = slot.playlistState.currentVideoIndex
      if (videos.length > 1) {
        const candidates = Array.from({ length: videos.length }, (_, i) => i).filter(
          (i) => i !== slot.playlistState!.currentVideoIndex,
        )
        nextIndex = candidates[Math.floor(Math.random() * candidates.length)]
      }
      slot.playlistState.currentVideoIndex = nextIndex

      this.notify()
      try {
        if (slot.playing && !slot.paused) {
          await this.startSoundscapeTrack(slot, slot.playlistState.playlistTrackId, true)
        } else {
          this.enforceSoundscapeConcurrency(slotId)
          await this.startSoundscapeTrack(slot, slot.playlistState.playlistTrackId, false)
        }
      } finally {
        this.notify()
      }
      return
    }

    // YT-02: playlist videos share the intensity pool with local / single YouTube tracks.
    const exclude = this.currentPoolPick(slot)
    const pick = this.pickFromExpandedPool(slot, exclude)
    if (!pick || !this.applyPoolPick(slot, pick)) {
      return
    }
    const nextTrackId = slot.config.currentTrackId
    if (!nextTrackId) {
      return
    }
    // Surface the loaded track in UI before async buffer decode/start.
    this.notify()
    try {
      if (slot.playing && !slot.paused) {
        await this.crossfadeSoundscapeToTrack(slot, nextTrackId)
      } else {
        this.enforceSoundscapeConcurrency(slotId)
        await this.startSoundscapeTrack(slot, nextTrackId, false)
      }
    } finally {
      this.notify()
    }
  }

  async playScene(): Promise<void> {
    for (const [slotId, slot] of this.soundscapeSlots) {
      slot.playlistState = undefined
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
        if (!this.applyPoolPick(slot, this.pickFromExpandedPool(slot))) {
          continue
        }
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
          this.stopActiveSource(slot.currentSource)
          slot.currentSource = undefined
        }
        slot.playing = false
        slot.paused = false
        slot.playlistState = undefined
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
      let trackName = track?.name
      if (slot.currentSource) {
        trackName = slot.currentSource.trackName
      } else if (slot.playlistState) {
        const video = slot.playlistState.videos[slot.playlistState.currentVideoIndex]
        if (video) {
          trackName = video.name
        }
      }
      soundscapes[slot.config.slotId] = {
        slotId: slot.config.slotId,
        categoryName: slot.config.categoryName,
        playing: slot.playing && !slot.paused,
        paused: slot.paused,
        progress: this.getSlotProgress(slot),
        trackName,
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
    if (isYoutubeAudioUrl(audioUrl)) {
      throw new Error(`YouTube URLs cannot be decoded as AudioBuffers: ${audioUrl}`)
    }
    const resolvedUrl = resolveAudioUrl(audioUrl)
    const cached = this.bufferCache.get(resolvedUrl)
    if (cached) {
      return cached
    }
    const response = await fetch(resolvedUrl)
    if (!response.ok) {
      throw new Error(`Failed to load audio (${response.status}): ${audioUrl}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    try {
      const buffer = await this.ctx.decodeAudioData(arrayBuffer)
      this.bufferCache.set(resolvedUrl, buffer)
      return buffer
    } catch (error) {
      throw new Error(`Unable to decode audio: ${audioUrl}`, { cause: error })
    }
  }

  private getYoutubeOutputVolume(slot: SoundscapeSlotRuntime): number {
    if (this.soundscapeMuted) {
      return 0
    }
    return Math.round(
      mapVolumeCubic(this.soundscapeMasterVolume) * mapVolumeCubic(slot.config.volume) * 100,
    )
  }

  private stopActiveSource(active: ActiveSoundscapeSource | undefined): void {
    if (!active) {
      return
    }
    if (active.kind === 'youtube') {
      active.youtube?.stop()
      return
    }
    try {
      active.source?.stop()
    } catch {
      // already stopped
    }
    if (active.source) {
      active.source.onended = null
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
    if (slot.currentSource?.kind === 'youtube') {
      slot.currentSource.youtube?.setVolume(this.getYoutubeOutputVolume(slot))
    }
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

    let activeTrack = track
    if (track.type === 'youtube-playlist') {
      if (!slot.playlistState || slot.playlistState.playlistTrackId !== trackId) {
        const videos = track.playlistVideos ?? []
        const startIndex = videos.length > 0 ? Math.floor(Math.random() * videos.length) : 0
        slot.playlistState = {
          playlistTrackId: trackId,
          videos,
          currentVideoIndex: startIndex,
        }
      }
      const video = slot.playlistState.videos[slot.playlistState.currentVideoIndex]
      if (video) {
        activeTrack = {
          id: `${trackId}__video__${video.youtubeId}`,
          name: video.name,
          audioUrl: `youtube:${video.youtubeId}`,
          durationSeconds: video.durationSeconds,
          type: 'youtube',
        }
      }
    }

    const previous = slot.currentSource
    const startedAt = Date.now()

    if (isYoutubeAudioUrl(activeTrack.audioUrl)) {
      const videoId =
        extractYoutubeIdFromAudioUrl(activeTrack.audioUrl) ||
        track.youtubeId ||
        extractYoutubeIdFromAudioUrl(track.audioUrl)
      if (!videoId) {
        console.error(`Soundscape playback failed for "${activeTrack.name}": missing YouTube id`)
        return
      }

      const onEnded = () => {
        if (slot.currentSource?.trackId !== activeTrack.id || slot.currentSource.kind !== 'youtube') {
          return
        }
        void this.handleSoundscapeTrackEnded(slot)
      }

      let youtube: YoutubePlaybackSession
      try {
        youtube = await startYoutubePlayback({
          videoId,
          volume: this.getYoutubeOutputVolume(slot),
          onEnded,
          onError: (message) => {
            console.error(`Soundscape playback failed for "${activeTrack.name}"`, message)
          },
        })
      } catch (error) {
        console.error(`Soundscape playback failed for "${activeTrack.name}"`, error)
        return
      }

      this.stopActiveSource(previous)
      if (previous?.source) {
        previous.source.onended = null
      }

      slot.currentSource = {
        kind: 'youtube',
        youtube,
        trackId: activeTrack.id,
        trackName: activeTrack.name,
        startedAt,
        duration: activeTrack.durationSeconds,
        onEnded,
      }
      slot.config.currentTrackId = trackId
      slot.playing = true
      slot.paused = false
      slot.frozenProgress = undefined
      slot.startedAtMs = startedAt
      this.startProgressLoop(slot)
      this.notify()
      return
    }

    let buffer: AudioBuffer
    try {
      buffer = await this.loadBuffer(activeTrack.audioUrl)
    } catch (error) {
      console.error(`Soundscape playback failed for "${activeTrack.name}"`, error)
      return
    }
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = false

    const targetCrossfade = slot.activeCrossfade === 'A' ? slot.crossfadeB : slot.crossfadeA
    const currentCrossfade = slot.activeCrossfade === 'A' ? slot.crossfadeA : slot.crossfadeB
    source.connect(targetCrossfade)

    const onEnded = () => {
      if (slot.currentSource?.source !== source) {
        return
      }
      void this.handleSoundscapeTrackEnded(slot)
    }

    const activeSource: ActiveSoundscapeSource = {
      kind: 'local',
      source,
      trackId: activeTrack.id,
      trackName: activeTrack.name,
      startedAt,
      duration: activeTrack.durationSeconds,
      onEnded,
    }

    if (crossfade && previous?.kind === 'local' && previous.source) {
      await this.runCrossfade(slot, currentCrossfade, targetCrossfade)
      this.stopActiveSource(previous)
    } else {
      this.stopActiveSource(previous)
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

  private pickFromExpandedPool(
    slot: SoundscapeSlotRuntime,
    exclude?: SoundscapePoolPick,
  ): SoundscapePoolPick | undefined {
    return pickExpandedSoundscapeEntry(
      buildExpandedSoundscapePool(slot.config.trackIds, slot.config.tracksById),
      exclude,
    )
  }

  private currentPoolPick(slot: SoundscapeSlotRuntime): SoundscapePoolPick | undefined {
    if (slot.playlistState) {
      return {
        kind: 'playlist-video',
        playlistTrackId: slot.playlistState.playlistTrackId,
        videoIndex: slot.playlistState.currentVideoIndex,
      }
    }
    if (slot.config.currentTrackId) {
      return { kind: 'track', trackId: slot.config.currentTrackId }
    }
    return undefined
  }

  private applyPoolPick(slot: SoundscapeSlotRuntime, pick: SoundscapePoolPick | undefined): boolean {
    if (!pick) {
      return false
    }
    if (pick.kind === 'playlist-video') {
      const track = slot.config.tracksById[pick.playlistTrackId]
      const videos = track?.playlistVideos ?? []
      if (!track || videos.length === 0) {
        return false
      }
      slot.playlistState = {
        playlistTrackId: pick.playlistTrackId,
        videos,
        currentVideoIndex: pick.videoIndex,
      }
      slot.config.currentTrackId = pick.playlistTrackId
      return true
    }
    slot.playlistState = undefined
    slot.config.currentTrackId = pick.trackId
    return true
  }

  private async crossfadeSoundscapeToRandomTrack(slot: SoundscapeSlotRuntime): Promise<void> {
    const pick = this.pickFromExpandedPool(slot, this.currentPoolPick(slot))
    if (!pick || !this.applyPoolPick(slot, pick) || !slot.config.currentTrackId) {
      return
    }
    await this.crossfadeSoundscapeToTrack(slot, slot.config.currentTrackId)
  }

  private async crossfadeSoundscapeToTrack(slot: SoundscapeSlotRuntime, trackId: string): Promise<void> {
    this.enforceSoundscapeConcurrency(slot.config.slotId)
    await this.startSoundscapeTrack(slot, trackId, true)
  }

  private async handleSoundscapeTrackEnded(slot: SoundscapeSlotRuntime): Promise<void> {
    if (!slot.playing || slot.paused) {
      return
    }
    if (slot.playlistState && slot.playlistState.videos.length > 0) {
      const videos = slot.playlistState.videos
      const nextIndex = Math.floor(Math.random() * videos.length)
      slot.playlistState.currentVideoIndex = nextIndex
      await this.startSoundscapeTrack(slot, slot.playlistState.playlistTrackId, true)
      return
    }

    const pick = this.pickFromExpandedPool(slot, this.currentPoolPick(slot))
    if (!pick || !this.applyPoolPick(slot, pick) || !slot.config.currentTrackId) {
      slot.playing = false
      slot.currentSource = undefined
      this.notify()
      return
    }
    await this.startSoundscapeTrack(slot, slot.config.currentTrackId, true)
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
      this.stopActiveSource(slot.currentSource)
      slot.currentSource = undefined
    }
    slot.playing = false
    slot.paused = false
    slot.playlistState = undefined
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
    if (slot.currentSource.kind === 'youtube' && slot.currentSource.youtube) {
      const duration = Math.max(
        slot.currentSource.youtube.getDuration() || slot.currentSource.duration,
        0.001,
      )
      return Math.min(1, slot.currentSource.youtube.getCurrentTime() / duration)
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
