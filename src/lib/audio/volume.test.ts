import { describe, expect, it } from 'vitest'
import { DUCK_RATIO, mappedVolume, percentToGain } from './volume'

describe('percentToGain', () => {
  it('maps 0% to 0 gain', () => {
    expect(percentToGain(0)).toBe(0)
  })

  it('maps 100% to 1 gain', () => {
    expect(percentToGain(100)).toBe(1)
  })

  it('applies cubic curve at 50%', () => {
    expect(percentToGain(50)).toBeCloseTo(0.125)
  })

  it('clamps values outside 0–100', () => {
    expect(percentToGain(-10)).toBe(0)
    expect(percentToGain(150)).toBe(1)
  })
})

describe('mappedVolume', () => {
  it('multiplies master and category cubic gains', () => {
    expect(mappedVolume(80, 100)).toBeCloseTo(percentToGain(80))
    expect(mappedVolume(100, 50)).toBeCloseTo(percentToGain(50))
    expect(mappedVolume(80, 50)).toBeCloseTo(percentToGain(80) * percentToGain(50))
  })
})

describe('constants', () => {
  it('defines duck ratio at 40%', () => {
    expect(DUCK_RATIO).toBe(0.4)
  })
})
