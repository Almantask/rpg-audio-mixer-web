import { describe, expect, it } from 'vitest'
import {
  formatSessionContextLabel,
  formatSessionPageTitle,
  stripRedundantSessionPrefix,
} from '@/lib/sessionTitle'

describe('sessionTitle', () => {
  it('strips a redundant Session N prefix from the name', () => {
    expect(stripRedundantSessionPrefix('Session 1 — The Ancient Gate', 1)).toBe('The Ancient Gate')
    expect(stripRedundantSessionPrefix('Session 14 – The Howling Crags', 14)).toBe('The Howling Crags')
    expect(stripRedundantSessionPrefix('The Ancient Gate', 1)).toBe('The Ancient Gate')
  })

  it('formats page titles without duplicating Session N', () => {
    expect(formatSessionPageTitle({ number: 1, name: 'Session 1 — The Ancient Gate' })).toBe(
      'Session 1 – The Ancient Gate',
    )
    expect(formatSessionPageTitle({ number: 14, name: 'The Howling Crags' })).toBe(
      'Session 14 – The Howling Crags',
    )
  })

  it('formats context labels without duplicating Session N', () => {
    expect(formatSessionContextLabel({ number: 1, name: 'Session 1 — The Ancient Gate' })).toBe(
      'Session 1: The Ancient Gate',
    )
  })
})
