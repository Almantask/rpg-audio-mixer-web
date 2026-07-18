import { describe, expect, it } from 'vitest'
import { mapVolumeCubic } from './volume'

describe('mapVolumeCubic', () => {
  it('maps 0% to 0 gain', () => {
    expect(mapVolumeCubic(0)).toBe(0)
  })

  it('maps 100% to 1 gain', () => {
    expect(mapVolumeCubic(100)).toBe(1)
  })

  it('uses cubic curve for mid-range values', () => {
    expect(mapVolumeCubic(50)).toBeCloseTo(0.125, 5)
  })

  it('clamps values below 0 and above 100', () => {
    expect(mapVolumeCubic(-10)).toBe(0)
    expect(mapVolumeCubic(150)).toBe(1)
  })
})
