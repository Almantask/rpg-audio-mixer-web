type ErrorListener = (message: string | null) => void

let currentError: string | null = null
const listeners = new Set<ErrorListener>()

export function getErrorMessage(): string | null {
  return currentError
}

export function showError(message: string): void {
  currentError = message
  for (const listener of listeners) {
    listener(currentError)
  }
}

export function dismissError(): void {
  currentError = null
  for (const listener of listeners) {
    listener(null)
  }
}

export function subscribeError(listener: ErrorListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

declare global {
  interface Window {
    __arcanumSimulateAudioInterruption?: (durationMs: number) => void
    __arcanumRegainAudioFocus?: () => void
    __arcanumSwitchToBackgroundTab?: () => void
    __arcanumShowError?: (message: string) => void
    __arcanumDismissError?: () => void
  }
}

if (typeof window !== 'undefined') {
  window.__arcanumShowError = showError
  window.__arcanumDismissError = dismissError
}
