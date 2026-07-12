import { createSyntheticBuffer, fxDurationSeconds, loopDurationSeconds } from './bufferFactory'

export type HomePreviewKind = 'soundscape' | 'fx' | null

export interface HomePreviewState {
  kind: HomePreviewKind
  name: string
  progress: number
  isPlaying: boolean
}

type PreviewListener = (state: HomePreviewState) => void

const emptyState: HomePreviewState = {
  kind: null,
  name: '',
  progress: 0,
  isPlaying: false,
}

class HomePreviewController {
  private context: AudioContext | null = null
  private source: AudioBufferSourceNode | null = null
  private gainNode: GainNode | null = null
  private state: HomePreviewState = { ...emptyState }
  private listeners = new Set<PreviewListener>()
  private progressRaf: number | null = null
  private startedAt = 0
  private durationSeconds = 0

  subscribe(listener: PreviewListener): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  getState(): HomePreviewState {
    return this.state
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }

  private setState(partial: Partial<HomePreviewState>): void {
    this.state = { ...this.state, ...partial }
    this.emit()
  }

  private async ensureContext(): Promise<AudioContext> {
    if (!this.context) {
      this.context = new AudioContext()
    }
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
    return this.context
  }

  private stopInternal(): void {
    if (this.progressRaf !== null) {
      cancelAnimationFrame(this.progressRaf)
      this.progressRaf = null
    }
    if (this.source) {
      try {
        this.source.onended = null
        this.source.stop()
      } catch {
        // already stopped
      }
      this.source.disconnect()
      this.source = null
    }
    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }
  }

  private tickProgress(): void {
    if (!this.context || !this.state.isPlaying) return
    const elapsed = this.context.currentTime - this.startedAt
    const progress = this.durationSeconds > 0 ? Math.min(elapsed / this.durationSeconds, 1) : 0
    this.setState({ progress })
    if (progress >= 1 && this.state.kind === 'fx') {
      this.setState({ isPlaying: false, progress: 1 })
      this.stopInternal()
      return
    }
    this.progressRaf = requestAnimationFrame(() => this.tickProgress())
  }

  private async startPreview(kind: HomePreviewKind, name: string, loop: boolean): Promise<void> {
    this.stopInternal()
    const context = await this.ensureContext()
    this.durationSeconds = kind === 'fx' ? fxDurationSeconds() : loopDurationSeconds()
    const buffer = createSyntheticBuffer(context, name, this.durationSeconds)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = loop
    const gain = context.createGain()
    gain.gain.value = 0.7
    source.connect(gain)
    gain.connect(context.destination)
    source.onended = () => {
      if (this.state.kind === 'fx') {
        this.setState({ isPlaying: false, progress: 1 })
      }
    }
    this.source = source
    this.gainNode = gain
    this.startedAt = context.currentTime
    source.start()
    this.setState({ kind, name, isPlaying: true, progress: 0 })
    this.tickProgress()
  }

  async toggleSoundscape(name: string): Promise<void> {
    if (this.state.kind === 'soundscape' && this.state.name === name && this.state.isPlaying) {
      this.pause()
      return
    }
    if (this.state.kind === 'soundscape' && this.state.name === name && !this.state.isPlaying) {
      await this.resume()
      return
    }
    await this.startPreview('soundscape', name, true)
  }

  async toggleFx(name: string): Promise<void> {
    if (this.state.kind === 'fx' && this.state.name === name && this.state.isPlaying) {
      this.pause()
      return
    }
    if (this.state.kind === 'fx' && this.state.name === name && !this.state.isPlaying) {
      await this.resume()
      return
    }
    await this.startPreview('fx', name, false)
  }

  pause(): void {
    if (!this.context || !this.state.isPlaying) return
    this.stopInternal()
    this.setState({ isPlaying: false })
  }

  async resume(): Promise<void> {
    if (!this.state.kind || !this.state.name) return
    await this.startPreview(this.state.kind, this.state.name, this.state.kind === 'soundscape')
  }

  stop(): void {
    this.stopInternal()
    this.state = { ...emptyState }
    this.emit()
  }
}

export const homePreview = new HomePreviewController()

export function isActiveScenePlaying(): boolean {
  if (typeof window === 'undefined') return false
  return window.__arcanumGetActiveLoopCount?.() ? window.__arcanumGetActiveLoopCount() > 0 : false
}
