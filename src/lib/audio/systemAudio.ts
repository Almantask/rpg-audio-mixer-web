import { audioEngine } from './engine'

const AUTO_RESUME_MS = 3 * 60 * 1000
const MEDIA_SESSION_TITLE = 'Arcanum Audio'

let installed = false
let interruptionStartedAt: number | null = null
let wasPlayingBeforeInterruption = false

function updateMediaSessionMetadata(sceneName?: string, trackName?: string): void {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new MediaMetadata({
    title: trackName ?? sceneName ?? MEDIA_SESSION_TITLE,
    artist: sceneName ?? 'Active Scene',
    album: MEDIA_SESSION_TITLE,
  })
}

function clearMediaSessionMetadata(): void {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = null
}

function pauseAllForInterruption(): void {
  const snapshot = audioEngine.getSnapshot()
  wasPlayingBeforeInterruption =
    snapshot.activeLoopCount > 0 || snapshot.activeFxCount > 0
  if (wasPlayingBeforeInterruption) {
    interruptionStartedAt = Date.now()
    audioEngine.pauseAllForSystemEvent()
  }
}

function handleInterruptionEnd(): void {
  if (!wasPlayingBeforeInterruption || interruptionStartedAt === null) return
  const elapsed = Date.now() - interruptionStartedAt
  interruptionStartedAt = null
  wasPlayingBeforeInterruption = false
  if (elapsed <= AUTO_RESUME_MS) {
    audioEngine.resumeAfterSystemEvent()
  }
}

export function installSystemAudioHandlers(): void {
  if (installed || typeof window === 'undefined') return
  installed = true

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') return
    handleInterruptionEnd()
  })

  window.addEventListener('pagehide', pauseAllForInterruption)
  window.addEventListener('pageshow', () => handleInterruptionEnd())

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('pause', () => {
      audioEngine.pauseAllForSystemEvent()
    })
    navigator.mediaSession.setActionHandler('play', () => {
      void audioEngine.ensureContext().then(() => audioEngine.resumeAfterSystemEvent())
    })
  }

  audioEngine.subscribe(() => {
    const snapshot = audioEngine.getSnapshot()
    const playingLoop = snapshot.loops.find((loop) => loop.status === 'playing')
    if (playingLoop) {
      updateMediaSessionMetadata(playingLoop.categoryName, playingLoop.trackName)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
      return
    }
    if (snapshot.activeFxCount > 0) {
      updateMediaSessionMetadata(undefined, snapshot.effects[0]?.effectName)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
      return
    }
    clearMediaSessionMetadata()
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused'
    }
  })
}

declare global {
  interface Window {
    __arcanumSimulateAudioInterruption?: (durationMs: number) => void
    __arcanumRegainAudioFocus?: () => void
    __arcanumSwitchToBackgroundTab?: () => void
  }
}

if (typeof window !== 'undefined') {
  window.__arcanumSimulateAudioInterruption = (durationMs: number) => {
    pauseAllForInterruption()
    interruptionStartedAt = Date.now() - durationMs
  }

  window.__arcanumRegainAudioFocus = () => {
    handleInterruptionEnd()
  }

  window.__arcanumSwitchToBackgroundTab = () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    })
  }
}

export { pauseAllForInterruption, handleInterruptionEnd, updateMediaSessionMetadata }
