import { useEffect } from 'react'

import { resolveSoundboardHotkeyIndex } from '@/lib/sceneStorage'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable) {
    return true
  }
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function isInsideDialog(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest('[role="dialog"]'))
}

/**
 * Plays soundboard FX for Num/Digit 1–9 while the Active Scene soundboard is mounted.
 */
export function useSoundboardHotkeys<T>(
  entries: readonly T[],
  onTrigger: (entry: T) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) {
        return
      }
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return
      }
      if (isEditableTarget(event.target) || isInsideDialog(event.target)) {
        return
      }

      const index = resolveSoundboardHotkeyIndex(event.code)
      if (index === undefined) {
        return
      }

      const entry = entries[index]
      if (!entry) {
        return
      }

      event.preventDefault()
      onTrigger(entry)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, entries, onTrigger])
}
