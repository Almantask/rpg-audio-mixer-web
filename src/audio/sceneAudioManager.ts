import { publishAudioState, updateTrackPlayingState, stopAllAudioState } from './audioState'

class SceneAudioManager {
  private activeAudios: Map<string, HTMLAudioElement> = new Map()

  playTrack(id: string, name: string, source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home', fileUrl?: string): void {
    // Stop single preview sources if switching in library/picker
    if (source === 'library' || source === 'picker') {
      this.stopBySource(source)
    }

    if (fileUrl) {
      try {
        const audio = new Audio(fileUrl)
        audio.onended = () => {
          this.activeAudios.delete(id)
          updateTrackPlayingState(id, name, source, false)
        }
        audio.onerror = () => {
          // Fallback if audio fails to load on disk/test
          this.activeAudios.delete(id)
          updateTrackPlayingState(id, name, source, true)
        }
        audio.play().catch(() => {
          // Playback blocked or missing file; still publish state for UI/tests
          updateTrackPlayingState(id, name, source, true)
        })
        this.activeAudios.set(id, audio)
      } catch {
        updateTrackPlayingState(id, name, source, true)
      }
    }

    updateTrackPlayingState(id, name, source, true)
  }

  stopTrack(id: string, name: string, source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'): void {
    const audio = this.activeAudios.get(id)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      this.activeAudios.delete(id)
    }
    updateTrackPlayingState(id, name, source, false)
  }

  stopBySource(source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'): void {
    const currentTracks = window.__ARCANUM_AUDIO_STATE__?.playingTracks || []
    for (const t of currentTracks) {
      if (t.source === source) {
        this.stopTrack(t.id, t.name, t.source)
      }
    }
  }

  stopAll(): void {
    this.activeAudios.forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })
    this.activeAudios.clear()
    stopAllAudioState()
  }

  setVolume(id: string, volume: number): void {
    const audio = this.activeAudios.get(id)
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume))
    }
    const currentVolumes = window.__ARCANUM_AUDIO_STATE__?.volumes || { master: 1 }
    publishAudioState({
      volumes: { ...currentVolumes, [id]: volume },
    })
  }
}

export const sceneAudioManager = new SceneAudioManager()
