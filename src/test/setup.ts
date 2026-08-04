import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// Mock HTMLMediaElement play & pause for JSDOM
window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(function (this: HTMLMediaElement) {
  Object.defineProperty(this, 'paused', { value: false, writable: true })
  Object.defineProperty(this, 'ended', { value: false, writable: true })
  return Promise.resolve()
})

window.HTMLMediaElement.prototype.pause = vi.fn().mockImplementation(function (this: HTMLMediaElement) {
  Object.defineProperty(this, 'paused', { value: true, writable: true })
})

// Mock Web Audio API
class MockAudioContext {
  createGain() {
    return {
      gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    }
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    }
  }
  decodeAudioData(
    _buffer: ArrayBuffer,
    success?: (buffer: AudioBuffer) => void,
  ): Promise<AudioBuffer> {
    const dummyBuffer = {
      duration: 10,
      length: 441000,
      sampleRate: 44100,
      numberOfChannels: 2,
      getChannelData: () => new Float32Array(10),
    } as unknown as AudioBuffer
    if (success) success(dummyBuffer)
    return Promise.resolve(dummyBuffer)
  }
}

// Global mocks
vi.stubGlobal('AudioContext', MockAudioContext)
vi.stubGlobal('webkitAudioContext', MockAudioContext)

if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  window.URL.revokeObjectURL = vi.fn()

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}
