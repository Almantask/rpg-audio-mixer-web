function hashName(name: string): number {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

/** Creates a short synthetic buffer for loops or one-shot FX in tests and demo playback. */
export function createSyntheticBuffer(
  context: AudioContext,
  name: string,
  durationSeconds: number,
): AudioBuffer {
  const sampleRate = context.sampleRate
  const length = Math.max(1, Math.floor(sampleRate * durationSeconds))
  const buffer = context.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  const frequency = 110 + (hashName(name) % 880)

  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate
    const envelope = Math.min(1, index / (sampleRate * 0.01)) * Math.min(1, (length - index) / (sampleRate * 0.02))
    data[index] = Math.sin(2 * Math.PI * frequency * t) * 0.25 * envelope
  }

  return buffer
}

export function loopDurationSeconds(): number {
  return 0.25
}

export function fxDurationSeconds(): number {
  return 0.15
}
