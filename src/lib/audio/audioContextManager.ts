let audioContext: AudioContext | null = null
let masterAnalyserNode: AnalyserNode | null = null
let gestureBound = false

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
    masterAnalyserNode = audioContext.createAnalyser()
    masterAnalyserNode.fftSize = 512
    masterAnalyserNode.connect(audioContext.destination)
    bindGestureResume()
  }
  return audioContext
}

export function getMasterAnalyser(): AnalyserNode | null {
  if (!audioContext) {
    getAudioContext()
  }
  return masterAnalyserNode
}

export function getRealtimeSignalLevels(): { peak: number; rms: number } {
  const analyser = getMasterAnalyser()
  if (!analyser || !audioContext || audioContext.state !== 'running') {
    return { peak: 0, rms: 0 }
  }
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Float32Array(bufferLength)
  analyser.getFloatTimeDomainData(dataArray)

  let maxAbs = 0
  let sumSquares = 0
  for (let i = 0; i < bufferLength; i += 1) {
    const val = dataArray[i]
    const absVal = Math.abs(val)
    if (absVal > maxAbs) {
      maxAbs = absVal
    }
    sumSquares += val * val
  }
  const rms = Math.sqrt(sumSquares / bufferLength)
  return {
    peak: Math.round(maxAbs * 10000) / 10000,
    rms: Math.round(rms * 10000) / 10000,
  }
}

export async function resumeAudioContext(): Promise<AudioContext> {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
  return ctx
}

function bindGestureResume(): void {
  if (gestureBound || typeof window === 'undefined') {
    return
  }
  gestureBound = true

  const resume = () => {
    void resumeAudioContext()
  }

  window.addEventListener('pointerdown', resume, { once: false })
  window.addEventListener('keydown', resume, { once: false })
}

export function resetAudioContextForTests(): void {
  audioContext = null
  masterAnalyserNode = null
  gestureBound = false
}
