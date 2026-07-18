import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  daysRemaining,
  daysSinceDeleted,
  resolveRestoredName,
  sortByDaysRemaining,
  TRASH_RETENTION_DAYS,
} from './trashStorage'

describe('trashStorage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('exposes a 7-day retention window', () => {
    expect(TRASH_RETENTION_DAYS).toBe(7)
  })

  it('returns the original name when no collision exists', () => {
    expect(resolveRestoredName('Dragon Roar', ['Wolf Howl'])).toBe('Dragon Roar')
  })

  it('appends (restored) when the name already exists', () => {
    expect(resolveRestoredName('Dragon Roar', ['Dragon Roar'])).toBe('Dragon Roar (restored)')
  })

  it('compares names case-insensitively for collisions', () => {
    expect(resolveRestoredName('Dragon Roar', ['dragon roar'])).toBe('Dragon Roar (restored)')
  })

  it('calculates days since deleted from deletedAt', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T12:00:00.000Z'))
    const deletedAt = '2026-07-07T12:00:00.000Z'
    expect(daysSinceDeleted(deletedAt)).toBe(5)
  })

  it('calculates days remaining until expiry', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T12:00:00.000Z'))
    const deletedAt = '2026-07-07T12:00:00.000Z'
    expect(daysRemaining(deletedAt)).toBe(2)
  })

  it('never returns negative days remaining', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-20T12:00:00.000Z'))
    const deletedAt = '2026-07-01T12:00:00.000Z'
    expect(daysRemaining(deletedAt)).toBe(0)
  })

  it('sorts items by days remaining ascending', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T12:00:00.000Z'))
    const items = [
      { id: 'a', deletedAt: '2026-07-01T12:00:00.000Z' },
      { id: 'b', deletedAt: '2026-07-10T12:00:00.000Z' },
      { id: 'c', deletedAt: '2026-07-05T12:00:00.000Z' },
    ]
    const sorted = sortByDaysRemaining(items)
    expect(sorted.map((item) => item.id)).toEqual(['a', 'c', 'b'])
  })
})
