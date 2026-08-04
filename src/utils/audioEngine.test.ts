import { describe, expect, it, beforeEach, vi } from 'vitest'
import { audioEngine, cubicVolume } from './audioEngine'

describe('audioEngine', () => {
  beforeEach(() => {
    audioEngine.stopAll()
  })

  it('calculates cubic volume curve correctly', () => {
    expect(cubicVolume(0)).toBe(0)
    expect(cubicVolume(0.5)).toBe(0.125)
    expect(cubicVolume(1.0)).toBe(1.0)
    expect(cubicVolume(-0.5)).toBe(0)
    expect(cubicVolume(1.5)).toBe(1.0)
  })

  it('plays FX instance and respects limits', () => {
    expect(audioEngine.getActiveFXCount()).toBe(0)
    audioEngine.playFX('fx-1', '/test.mp3')
    expect(audioEngine.getActiveFXCount()).toBe(1)
    expect(audioEngine.isFXPlaying('fx-1')).toBe(true)

    // Play 5 instances of same FX
    audioEngine.playFX('fx-1', '/test.mp3')
    audioEngine.playFX('fx-1', '/test.mp3')
    audioEngine.playFX('fx-1', '/test.mp3')
    audioEngine.playFX('fx-1', '/test.mp3')

    expect(audioEngine.getActiveFXCount('fx-1')).toBe(5)

    // Playing 6th instance should stop oldest and keep count at 5
    audioEngine.playFX('fx-1', '/test.mp3')
    expect(audioEngine.getActiveFXCount('fx-1')).toBe(5)
  })

  it('stops specific FX track instances', () => {
    audioEngine.playFX('fx-1', '/test.mp3')
    audioEngine.playFX('fx-2', '/test2.mp3')
    expect(audioEngine.getActiveFXCount()).toBe(2)

    audioEngine.stopFXTrack('fx-1')
    expect(audioEngine.isFXPlaying('fx-1')).toBe(false)
    expect(audioEngine.isFXPlaying('fx-2')).toBe(true)
    expect(audioEngine.getActiveFXCount()).toBe(1)
  })

  it('manages soundscape playback and cap', () => {
    expect(audioEngine.isSoundscapePlaying('cat-1')).toBe(false)
    audioEngine.playSoundscape('cat-1', '/rain.ogg', 0.8, 1.0, 'I')
    expect(audioEngine.isSoundscapePlaying('cat-1')).toBe(true)

    audioEngine.stopSoundscape('cat-1')
    expect(audioEngine.isSoundscapePlaying('cat-1')).toBe(false)
  })

  it('notifies ducking state when FX are playing', () => {
    const callback = vi.fn()
    const unsubscribe = audioEngine.subscribeDuckingChange(callback)

    audioEngine.playFX('fx-1', '/test.mp3')
    expect(callback).toHaveBeenLastCalledWith(true)

    audioEngine.stopAll()
    expect(callback).toHaveBeenLastCalledWith(false)

    unsubscribe()
  })
})
