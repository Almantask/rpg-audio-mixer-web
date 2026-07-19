import { resolveAudioUrl } from '@/lib/resolveAudioUrl'
import {
  extractYoutubeIdFromAudioUrl,
  isYoutubeAudioUrl,
  startYoutubePlayback,
  type YoutubePlaybackSession,
} from '@/lib/audio/youtubePlayer'

type PreviewListener = (trackId: string | null, trackName: string | null, playing: boolean) => void

class AudioPreviewManager {
  private audio: HTMLAudioElement | null = null
  private youtube: YoutubePlaybackSession | null = null
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
    if (this.youtube) {
      return Boolean(this.currentTrackId)
    }
    return Boolean(this.audio && !this.audio.paused && !this.audio.ended)
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId
  }

  getCurrentTrackName(): string | null {
    return this.currentTrackName
  }

  play(trackId: string, audioUrl: string, trackName: string) {
    if (this.currentTrackId === trackId && (this.audio || this.youtube)) {
      if (this.audio?.paused) {
        void this.audio.play()
        this.notify()
      }
      return
    }

    this.stop()
    this.currentTrackId = trackId
    this.currentTrackName = trackName

    if (isYoutubeAudioUrl(audioUrl)) {
      const videoId = extractYoutubeIdFromAudioUrl(audioUrl)
      if (!videoId) {
        console.error(`Preview failed for "${trackName}": missing YouTube id`)
        this.currentTrackId = null
        this.currentTrackName = null
        this.notify()
        return
      }
      void startYoutubePlayback({
        videoId,
        volume: 80,
        onEnded: () => {
          this.youtube = null
          this.currentTrackId = null
          this.currentTrackName = null
          this.notify()
        },
        onError: (message) => {
          console.error(`Preview failed for "${trackName}"`, message)
          this.stop()
        },
      })
        .then((session) => {
          if (this.currentTrackId !== trackId) {
            session.stop()
            return
          }
          this.youtube = session
          this.notify()
        })
        .catch((error) => {
          console.error(`Preview failed for "${trackName}"`, error)
          if (this.currentTrackId === trackId) {
            this.currentTrackId = null
            this.currentTrackName = null
            this.notify()
          }
        })
      this.notify()
      return
    }

    this.audio = new Audio(resolveAudioUrl(audioUrl))
    this.audio.addEventListener('ended', () => {
      this.currentTrackId = null
      this.currentTrackName = null
      this.notify()
    })
    void this.audio.play()
    this.notify()
  }

  pause() {
    if (this.youtube) {
      this.youtube.stop()
      this.youtube = null
      this.notify()
      return
    }
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
    if (this.youtube) {
      this.youtube.stop()
      this.youtube = null
    }
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
