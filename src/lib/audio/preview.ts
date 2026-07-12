let isPlaying = false

export function startPreview(): void {
  isPlaying = true
  if (typeof window !== 'undefined') {
    window.__arcanumIsPlaying = () => isPlaying
  }
}

export function stopPreview(): void {
  isPlaying = false
  if (typeof window !== 'undefined') {
    window.__arcanumIsPlaying = () => isPlaying
  }
}

export function getIsPlaying(): boolean {
  return isPlaying
}

if (typeof window !== 'undefined') {
  window.__arcanumIsPlaying = () => isPlaying
}

declare global {
  interface Window {
    __arcanumIsPlaying?: () => boolean
  }
}
