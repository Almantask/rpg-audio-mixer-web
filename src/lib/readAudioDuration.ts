/** Read duration in whole seconds from an audio File or URL (minimum 1). */
export function readAudioDurationSeconds(source: File | string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    const objectUrl = typeof source === 'string' ? null : URL.createObjectURL(source)
    const src = typeof source === 'string' ? source : objectUrl!

    const cleanup = () => {
      audio.removeAttribute('src')
      audio.load()
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }

    const finish = (seconds: number) => {
      cleanup()
      resolve(Math.max(1, Math.round(seconds)))
    }

    audio.preload = 'metadata'
    audio.addEventListener(
      'loadedmetadata',
      () => {
        const duration = audio.duration
        if (!Number.isFinite(duration) || duration <= 0) {
          finish(1)
          return
        }
        finish(duration)
      },
      { once: true },
    )
    audio.addEventListener(
      'error',
      () => {
        finish(1)
      },
      { once: true },
    )
    audio.src = src
  })
}
