import { describe, expect, it } from 'vitest'
import {
  formatSceneCount,
  formatSessionCount,
  formatSessionDate,
  formatSessionLabel,
  formatSessionMetadata,
} from '@/lib/format'

describe('format helpers', () => {
  it('formats session count with singular and plural labels', () => {
    expect(formatSessionCount(0)).toBe('0 sessions')
    expect(formatSessionCount(1)).toBe('1 session')
    expect(formatSessionCount(14)).toBe('14 sessions')
  })

  it('formats scene count with singular and plural labels', () => {
    expect(formatSceneCount(1)).toBe('1 Scene')
    expect(formatSceneCount(4)).toBe('4 Scenes')
  })

  it('formats session labels and metadata', () => {
    expect(formatSessionLabel(14)).toBe('Session 14')
    expect(formatSessionDate('2026-03-12')).toMatch(/Mar 12/)
    expect(formatSessionMetadata('2026-03-12', 4)).toMatch(/Mar 12 · 4 Scenes/)
  })
})
