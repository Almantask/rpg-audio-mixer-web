import { describe, expect, it } from 'vitest'
import {
  computeSoundboardGain,
  computeSoundscapeGain,
  pickRandomTrackId,
} from './sceneAudioManager'

describe('sceneAudioManager helpers', () => {
  it('computes soundboard gain from master volume using cubic mapping', () => {
    expect(computeSoundboardGain(100)).toBe(1)
    expect(computeSoundboardGain(50)).toBeCloseTo(0.125, 5)
    expect(computeSoundboardGain(0)).toBe(0)
  })

  it('computes soundscape gain from master, slot volume, mute, and optional multiplier', () => {
    expect(computeSoundscapeGain(100, 100, false, 1)).toBe(1)
    expect(computeSoundscapeGain(100, 100, true, 1)).toBe(0)
    expect(computeSoundscapeGain(100, 100, false, 0.4)).toBeCloseTo(0.4, 5)
    expect(computeSoundscapeGain(50, 50, false, 1)).toBeCloseTo(0.015625, 5)
  })

  it('picks a random track from the pool', () => {
    const pool = ['a', 'b', 'c']
    const picked = pickRandomTrackId(pool)
    expect(pool).toContain(picked)
  })

  it('returns undefined when pool is empty', () => {
    expect(pickRandomTrackId([])).toBeUndefined()
  })
})
