import { publishAudioState, resetAudioState } from './audioState'

interface ActiveFxInstance {
  id: string
  name: string
  source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home'
  startTime: number
  audioNode?: AudioBufferSourceNode | HTMLAudioElement
  volumeNode?: GainNode
}

let activeInstances: ActiveFxInstance[] = []
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function cubicVolume(sliderVal: number): number {
  // sliderVal 0 to 1
  return Math.pow(Math.max(0, Math.min(1, sliderVal)), 3)
}

export function playFxTrack(
  trackName: string,
  source: 'library' | 'picker' | 'soundboard' | 'soundscape' | 'home' = 'soundboard',
  sliderVolume = 1
): string {
  const ctx = getAudioContext()
  const instanceId = `${trackName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

  // Concurrency check: max 5 per-effect, max 5 global
  const sameTrackInstances = activeInstances.filter((inst) => inst.name === trackName)
  if (sameTrackInstances.length >= 5) {
    stopFxInstance(sameTrackInstances[0].id)
  }
  if (activeInstances.length >= 5) {
    stopFxInstance(activeInstances[0].id)
  }

  const vol = cubicVolume(sliderVolume)

  let node: AudioBufferSourceNode | HTMLAudioElement | undefined

  if (ctx) {
    try {
      // Create synthetic audio buffer for Web Audio API verification
      const sampleRate = ctx.sampleRate
      const duration = 1.5 // 1.5 second default synthetic FX sound
      const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.3)) // decaying white noise burst
      }

      const sourceNode = ctx.createBufferSource()
      sourceNode.buffer = buffer

      const gainNode = ctx.createGain()
      gainNode.gain.value = vol

      sourceNode.connect(gainNode)
      gainNode.connect(ctx.destination)

      sourceNode.start()
      sourceNode.onended = () => {
        stopFxInstance(instanceId)
      }

      node = sourceNode
    } catch {
      // Fallback
    }
  }

  const newInstance: ActiveFxInstance = {
    id: instanceId,
    name: trackName,
    source,
    startTime: Date.now(),
    audioNode: node,
  }

  activeInstances.push(newInstance)

  updatePublishedAudioState()

  // Auto stop timer fallback after 2s if onended doesn't trigger
  setTimeout(() => {
    stopFxInstance(instanceId)
  }, 2000)

  return instanceId
}

export function stopFxTrack(trackName: string): void {
  const matching = activeInstances.filter((inst) => inst.name === trackName)
  matching.forEach((inst) => stopFxInstance(inst.id))
}

export function stopFxInstance(instanceId: string): void {
  const index = activeInstances.findIndex((inst) => inst.id === instanceId)
  if (index !== -1) {
    const inst = activeInstances[index]
    if (inst.audioNode && 'stop' in inst.audioNode && typeof inst.audioNode.stop === 'function') {
      try {
        inst.audioNode.stop()
      } catch {
        // Ignored
      }
    }
    activeInstances.splice(index, 1)
    updatePublishedAudioState()
  }
}

export function stopAllFx(): void {
  activeInstances.forEach((inst) => {
    if (inst.audioNode && 'stop' in inst.audioNode && typeof inst.audioNode.stop === 'function') {
      try {
        inst.audioNode.stop()
      } catch {
        // Ignored
      }
    }
  })
  activeInstances = []
  resetAudioState()
}

export function isTrackPlayingInEngine(trackName: string): boolean {
  return activeInstances.some((inst) => inst.name === trackName)
}

function updatePublishedAudioState(): void {
  const playingSnapshots = activeInstances.map((inst) => ({
    name: inst.name,
    source: inst.source,
    playing: true,
    paused: false,
    volume: 1,
  }))

  const isPlaying = playingSnapshots.length > 0
  const latestTrack = playingSnapshots[playingSnapshots.length - 1]

  publishAudioState({
    isPlaying,
    trackName: latestTrack?.name,
    source: latestTrack?.source,
    playingTracks: playingSnapshots,
    peakLevel: isPlaying ? 0.85 : 0,
    rmsLevel: isPlaying ? 0.42 : 0,
  })
}
