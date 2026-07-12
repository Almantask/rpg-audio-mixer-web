type PreviewListener = (trackId: string | null, trackName: string | null, playing: boolean) => void

class AudioPreviewManager {
  private audio: HTMLAudioElement | null = null
  private currentTrackId: string | null = null
  private currentTrackName: string | null = null
  private listeners = new Set<PreviewListener>()

  subscribe(listener: PreviewListener): () => void {
    this.listeners.add(listener)
    listener(this.currentTrackId, this.currentTrackName, this.isPlaying())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    const playing = this.isPlaying()
    if (typeof window !== 'undefined') {
      window.__ARCANUM_AUDIO_STATE__ = {
        isPlaying: playing,
        trackName: this.currentTrackName ?? undefined,
        source: 'library',
        previewVolume: 80,
      }
    }
    for (const listener of this.listeners) {
      listener(this.currentTrackId, this.currentTrackName, playing)
    }
  }

  isPlaying(): boolean {
    return Boolean(this.audio && !this.audio.paused && !this.audio.ended)
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId
  }

  getCurrentTrackName(): string | null {
    return this.currentTrackName
  }

  play(trackId: string, audioUrl: string, trackName: string) {
    if (this.currentTrackId === trackId && this.audio) {
      if (this.audio.paused) {
        void this.audio.play()
        this.notify()
      }
      return
    }

    this.stop()
    this.audio = new Audio(audioUrl)
    this.currentTrackId = trackId
    this.currentTrackName = trackName
    this.audio.addEventListener('ended', () => {
      this.currentTrackId = null
      this.currentTrackName = null
      this.notify()
    })
    void this.audio.play()
    this.notify()
  }

  pause() {
    this.audio?.pause()
    this.notify()
  }

  toggle(trackId: string, audioUrl: string, trackName: string) {
    if (this.currentTrackId === trackId && this.isPlaying()) {
      this.pause()
      return
    }
    if (this.currentTrackId === trackId && this.audio) {
      void this.audio.play()
      this.notify()
      return
    }
    this.play(trackId, audioUrl, trackName)
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
    this.currentTrackId = null
    this.currentTrackName = null
    this.notify()
  }
}

export const audioPreview = new AudioPreviewManager()
