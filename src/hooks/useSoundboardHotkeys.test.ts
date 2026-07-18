import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSoundboardHotkeys } from '@/hooks/useSoundboardHotkeys'

function dispatchKey(code: string, target: EventTarget = document.body, init?: KeyboardEventInit) {
  target.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true, ...init }))
}

describe('useSoundboardHotkeys', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('triggers the matching soundboard entry for Digit and Numpad keys', () => {
    const onTrigger = vi.fn()
    const entries = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

    renderHook(() => useSoundboardHotkeys(entries, onTrigger))

    dispatchKey('Digit2')
    dispatchKey('Numpad3')

    expect(onTrigger).toHaveBeenCalledTimes(2)
    expect(onTrigger).toHaveBeenNthCalledWith(1, entries[1])
    expect(onTrigger).toHaveBeenNthCalledWith(2, entries[2])
  })

  it('ignores keys while typing in form fields or when modifiers/repeat are active', () => {
    const onTrigger = vi.fn()
    const entries = [{ id: 'a' }]
    renderHook(() => useSoundboardHotkeys(entries, onTrigger))

    const input = document.createElement('input')
    document.body.appendChild(input)
    dispatchKey('Digit1', input)
    dispatchKey('Digit1', document.body, { ctrlKey: true })
    dispatchKey('Digit1', document.body, { repeat: true })

    expect(onTrigger).not.toHaveBeenCalled()
    input.remove()
  })

  it('does nothing when the hotkey index has no tile', () => {
    const onTrigger = vi.fn()
    renderHook(() => useSoundboardHotkeys([{ id: 'a' }], onTrigger))

    dispatchKey('Digit9')

    expect(onTrigger).not.toHaveBeenCalled()
  })
})
