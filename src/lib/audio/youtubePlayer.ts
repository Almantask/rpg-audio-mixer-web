import { extractYoutubeVideoId } from '@/lib/youtubeResolve'

/** Minimal YouTube IFrame API surface used by Arcanum. */
interface YtPlayer {
  playVideo: () => void
  stopVideo: () => void
  destroy: () => void
  setVolume: (volume: number) => void
  mute: () => void
  unMute: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
}

interface YtPlayerConstructor {
  new (
    element: HTMLElement | string,
    options: {
      height?: string | number
      width?: string | number
      videoId?: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: { target: YtPlayer }) => void
        onStateChange?: (event: { data: number; target: YtPlayer }) => void
        onError?: (event: { data: number }) => void
      }
    },
  ): YtPlayer
}

declare global {
  interface Window {
    YT?: {
      Player: YtPlayerConstructor
      PlayerState: {
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

const YT_API_SRC = 'https://www.youtube.com/iframe_api'
const HOST_ID_PREFIX = 'arcanum-yt-player-'

let apiPromise: Promise<void> | null = null
let hostSerial = 0

export function isYoutubeAudioUrl(audioUrl: string): boolean {
  return (
    audioUrl.includes('youtube.com') ||
    audioUrl.includes('youtu.be') ||
    audioUrl.startsWith('youtube:')
  )
}

export function extractYoutubeIdFromAudioUrl(audioUrl: string): string | null {
  if (audioUrl.startsWith('youtube:')) {
    const id = audioUrl.slice('youtube:'.length).trim()
    return id || null
  }
  return extractYoutubeVideoId(audioUrl)
}

function ensureYoutubeApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API requires a browser environment'))
  }
  if (window.YT?.Player) {
    return Promise.resolve()
  }
  if (apiPromise) {
    return apiPromise
  }

  apiPromise = new Promise<void>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${YT_API_SRC}"]`)
    if (existing) {
      if (window.YT?.Player) {
        resolve()
      }
      return
    }

    const script = document.createElement('script')
    script.src = YT_API_SRC
    script.async = true
    script.onerror = () => {
      apiPromise = null
      reject(new Error('Failed to load YouTube IFrame API'))
    }
    document.head.appendChild(script)
  })

  return apiPromise
}

function createHostElement(): HTMLDivElement {
  const host = document.createElement('div')
  host.id = `${HOST_ID_PREFIX}${++hostSerial}`
  // Keep a tiny on-screen box — display:none / 0×0 can block autoplay in some browsers.
  host.style.cssText =
    'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0;overflow:hidden;z-index:-1;'
  document.body.appendChild(host)
  return host
}

export interface YoutubePlaybackSession {
  videoId: string
  stop: () => void
  setVolume: (volume0to100: number) => void
  getCurrentTime: () => number
  getDuration: () => number
}

function startVirtualYoutubePlayback(options: {
  videoId: string
  volume?: number
  onEnded?: () => void
}): YoutubePlaybackSession {
  const startedAt = Date.now()
  const durationSeconds = 180
  let stopped = false
  const endedTimer = window.setTimeout(() => {
    if (!stopped) {
      options.onEnded?.()
    }
  }, durationSeconds * 1000)

  return {
    videoId: options.videoId,
    stop: () => {
      if (stopped) {
        return
      }
      stopped = true
      window.clearTimeout(endedTimer)
    },
    setVolume: () => {
      // Virtual sessions have no audible output.
    },
    getCurrentTime: () => {
      if (stopped) {
        return 0
      }
      return Math.min(durationSeconds, (Date.now() - startedAt) / 1000)
    },
    getDuration: () => durationSeconds,
  }
}

function shouldUseVirtualYoutubePlayback(): boolean {
  if (typeof navigator !== 'undefined' && navigator.webdriver) {
    return true
  }
  if (typeof window !== 'undefined' && (window as Window & { __ARCANUM_YT_VIRTUAL__?: boolean }).__ARCANUM_YT_VIRTUAL__) {
    return true
  }
  return false
}

export async function startYoutubePlayback(options: {
  videoId: string
  volume?: number
  onEnded?: () => void
  onError?: (message: string) => void
}): Promise<YoutubePlaybackSession> {
  const videoId = options.videoId.trim()
  if (!videoId) {
    throw new Error('Missing YouTube video id')
  }

  // Playwright / explicit test hooks: avoid real embeds for fixture video ids.
  if (shouldUseVirtualYoutubePlayback()) {
    return startVirtualYoutubePlayback(options)
  }

  await ensureYoutubeApi()
  if (!window.YT?.Player) {
    throw new Error('YouTube IFrame API unavailable')
  }

  const host = createHostElement()
  let player: YtPlayer | null = null
  let stopped = false
  let endedNotified = false

  const notifyEnded = () => {
    if (stopped || endedNotified) {
      return
    }
    endedNotified = true
    options.onEnded?.()
  }

  player = await new Promise<YtPlayer>((resolve, reject) => {
    let settled = false
    let timeoutId = 0

    const fail = (message: string) => {
      if (settled) {
        return
      }
      settled = true
      window.clearTimeout(timeoutId)
      host.remove()
      reject(new Error(message))
    }

    timeoutId = window.setTimeout(() => {
      fail(`YouTube player timed out for ${videoId}`)
    }, 15_000)

    new window.YT!.Player(host, {
      height: 1,
      width: 1,
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          if (settled) {
            return
          }
          settled = true
          window.clearTimeout(timeoutId)
          const volume = Math.max(0, Math.min(100, options.volume ?? 100))
          event.target.setVolume(volume)
          if (volume <= 0) {
            event.target.mute()
          } else {
            event.target.unMute()
          }
          event.target.playVideo()
          resolve(event.target)
        },
        onStateChange: (event) => {
          if (event.data === window.YT?.PlayerState.ENDED) {
            notifyEnded()
          }
        },
        onError: (event) => {
          const message = `YouTube playback error ${event.data} for ${videoId}`
          options.onError?.(message)
          if (!settled) {
            fail(message)
            return
          }
          notifyEnded()
        },
      },
    })
  })

  return {
    videoId,
    stop: () => {
      if (stopped) {
        return
      }
      stopped = true
      try {
        player?.stopVideo()
      } catch {
        // ignore
      }
      try {
        player?.destroy()
      } catch {
        // ignore
      }
      player = null
      host.remove()
    },
    setVolume: (volume0to100: number) => {
      if (!player || stopped) {
        return
      }
      const volume = Math.max(0, Math.min(100, volume0to100))
      try {
        player.setVolume(volume)
        if (volume <= 0) {
          player.mute()
        } else {
          player.unMute()
        }
      } catch {
        // ignore
      }
    },
    getCurrentTime: () => {
      try {
        return player?.getCurrentTime() ?? 0
      } catch {
        return 0
      }
    },
    getDuration: () => {
      try {
        return player?.getDuration() ?? 0
      } catch {
        return 0
      }
    },
  }
}
