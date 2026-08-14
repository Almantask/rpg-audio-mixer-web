import '@testing-library/jest-dom'

// Web Audio API basic mock for Vitest environment if needed
if (typeof window !== 'undefined' && !window.AudioContext) {
  class MockAudioContext {
    createGain() {
      return {
        gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
        connect: () => {},
        disconnect: () => {},
      }
    }
    createBufferSource() {
      return {
        buffer: null,
        loop: false,
        connect: () => {},
        start: () => {},
        stop: () => {},
        disconnect: () => {},
      }
    }
    destination = {}
    currentTime = 0
    close() {
      return Promise.resolve()
    }
  }
  // @ts-expect-error mock context
  window.AudioContext = MockAudioContext
  // @ts-expect-error mock context
  window.webkitAudioContext = MockAudioContext
}
