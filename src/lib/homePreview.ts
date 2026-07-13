import { publishAudioState } from '@/lib/audio/audioState'
import { getSharedSceneAudioManager } from '@/lib/audio/sceneAudioManager'
import { resolveAudioUrl } from '@/lib/resolveAudioUrl'

export type HomePreviewKind = 'soundscape' | 'fx'

export interface HomePreviewState {
  kind: HomePreviewKind | null
  id: string | null
  name: string | null
  playing: boolean
  progress: number
}

type HomePreviewListener = (state: HomePreviewState) => void

function isActiveScenePlaying(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const state = window.__ARCANUM_AUDIO_STATE__
  if (
    state?.isPlaying &&
    (state.source === 'soundscape' || state.source === 'soundboard')
  ) {
    return true
  }
  try {
    const playback = getSharedSceneAudioManager().getState()
    const soundscapePlaying = Object.values(playback.soundscapes).some(
      (tile) => tile.playing && !tile.paused,
    )
    const soundboardPlaying = Object.values(playback.soundboard).some((tile) => tile.playing)
    return soundscapePlaying || soundboardPlaying
  } catch {
    return false
  }
}

class HomePreviewManager {
  private audio: HTMLAudioElement | null = null
  private kind: HomePreviewKind | null = null
  private currentId: string | null = null
  private currentName: string | null = null
  private progressRaf: number | undefined
  private listeners = new Set<HomePreviewListener>()

  subscribe(listener: HomePreviewListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState(): HomePreviewState {
    return {
      kind: this.kind,
      id: this.currentId,
      name: this.currentName,
      playing: this.isPlaying(),
      progress: this.getProgress(),
    }
  }

  isBlocked(): boolean {
    return isActiveScenePlaying()
  }

  isPlaying(): boolean {
    return Boolean(this.audio && !this.audio.paused && !this.audio.ended)
  }

  private getProgress(): number {
    if (!this.audio || !this.audio.duration || Number.isNaN(this.audio.duration)) {
      return 0
    }
    return Math.min(1, this.audio.currentTime / this.audio.duration)
  }

  private notify() {
    const state = this.getState()
    publishAudioState({
      isPlaying: state.playing,
      trackName: state.name ?? undefined,
      source: 'home',
      playingTracks: state.playing && state.name && state.id
        ? [{ id: state.id, name: state.name, source: 'home' }]
        : [],
    })
    for (const listener of this.listeners) {
      listener(state)
    }
  }

  private startProgressLoop() {
    if (this.progressRaf !== undefined) {
      cancelAnimationFrame(this.progressRaf)
    }
    const tick = () => {
      if (!this.isPlaying()) {
        return
      }
      this.notify()
      this.progressRaf = requestAnimationFrame(tick)
    }
    this.progressRaf = requestAnimationFrame(tick)
  }

  private attachAudioListeners() {
    if (!this.audio) {
      return
    }
    this.audio.addEventListener('ended', () => {
      this.kind = null
      this.currentId = null
      this.currentName = null
      this.notify()
    })
    this.audio.addEventListener('timeupdate', () => {
      this.notify()
    })
  }

  playSoundscape(id: string, audioUrl: string, name: string) {
    if (this.isBlocked()) {
      return
    }
    if (this.currentId === id && this.audio) {
      if (this.audio.paused) {
        void this.audio.play()
        this.startProgressLoop()
        this.notify()
      }
      return
    }

    this.stop()
    this.kind = 'soundscape'
    this.currentId = id
    this.currentName = name
    this.audio = new Audio(resolveAudioUrl(audioUrl))
    this.audio.loop = true
    this.attachAudioListeners()
    void this.audio.play()
    this.startProgressLoop()
    this.notify()
  }

  playFx(id: string, audioUrl: string, name: string) {
    if (this.isBlocked()) {
      return
    }
    if (this.currentId === id && this.audio) {
      if (this.audio.paused) {
        void this.audio.play()
        this.startProgressLoop()
        this.notify()
      }
      return
    }

    this.stop()
    this.kind = 'fx'
    this.currentId = id
    this.currentName = name
    this.audio = new Audio(resolveAudioUrl(audioUrl))
    this.attachAudioListeners()
    void this.audio.play()
    this.startProgressLoop()
    this.notify()
  }

  toggleSoundscape(id: string, audioUrl: string, name: string) {
    if (this.isBlocked()) {
      return
    }
    if (this.currentId === id && this.isPlaying()) {
      this.pause()
      return
    }
    if (this.currentId === id && this.audio) {
      void this.audio.play()
      this.startProgressLoop()
      this.notify()
      return
    }
    this.playSoundscape(id, audioUrl, name)
  }

  toggleFx(id: string, audioUrl: string, name: string) {
    if (this.isBlocked()) {
      return
    }
    if (this.currentId === id && this.isPlaying()) {
      this.pause()
      return
    }
    if (this.currentId === id && this.audio) {
      void this.audio.play()
      this.startProgressLoop()
      this.notify()
      return
    }
    this.playFx(id, audioUrl, name)
  }

  pause() {
    this.audio?.pause()
    if (this.progressRaf !== undefined) {
      cancelAnimationFrame(this.progressRaf)
      this.progressRaf = undefined
    }
    this.notify()
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
    if (this.progressRaf !== undefined) {
      cancelAnimationFrame(this.progressRaf)
      this.progressRaf = undefined
    }
    this.kind = null
    this.currentId = null
    this.currentName = null
    this.notify()
  }
}

export const homePreview = new HomePreviewManager()
