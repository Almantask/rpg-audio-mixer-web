import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// Mock Web Audio API
class MockAudioContext {
  createGain() {
    return {
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    }
  }

  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
  }

  decodeAudioData() {
    return Promise.resolve({})
  }
}

// @ts-expect-error - mock global AudioContext
window.AudioContext = window.AudioContext || MockAudioContext
// @ts-expect-error - mock global webkitAudioContext
window.webkitAudioContext = window.webkitAudioContext || MockAudioContext

// Mock HTMLMediaElement play and pause methods
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { value: false, configurable: true })
    Object.defineProperty(this, 'ended', { value: false, configurable: true })
    return Promise.resolve()
  }),
})

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn().mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { value: true, configurable: true })
    return Promise.resolve()
  }),
})
