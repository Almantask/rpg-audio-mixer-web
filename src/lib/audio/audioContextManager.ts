let audioContext: AudioContext | null = null
let gestureBound = false

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
    bindGestureResume()
  }
  return audioContext
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
  gestureBound = false
}
