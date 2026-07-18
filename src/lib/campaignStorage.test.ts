import { describe, expect, it } from 'vitest'
import {
  formatSessionCount,
  getActiveCampaigns,
  getActiveSessions,
  getNextSessionNumber,
} from './campaignStorage'
import type { Campaign, Session } from '@/types/campaign'

const campaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Old Campaign',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastPlayedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c2',
    name: 'New Campaign',
    createdAt: '2026-02-01T00:00:00.000Z',
    lastPlayedAt: '2026-03-01T00:00:00.000Z',
  },
]

const sessions: Session[] = [
  {
    id: 's1',
    campaignId: 'c1',
    name: 'First Night',
    number: 1,
    date: '2026-01-15',
    sceneCount: 0,
  },
  {
    id: 's2',
    campaignId: 'c1',
    name: 'Second Night',
    number: 2,
    date: '2026-02-20',
    sceneCount: 3,
  },
]

describe('campaignStorage', () => {
  it('sorts active campaigns by most recently played', () => {
    const sorted = getActiveCampaigns(campaigns)
    expect(sorted[0]?.name).toBe('New Campaign')
    expect(sorted[1]?.name).toBe('Old Campaign')
  })

  it('formats session count with singular and plural labels', () => {
    expect(formatSessionCount(0)).toBe('0 sessions')
    expect(formatSessionCount(1)).toBe('1 session')
    expect(formatSessionCount(14)).toBe('14 sessions')
  })

  it('sorts sessions by date descending', () => {
    const active = getActiveSessions('c1', sessions, campaigns)
    expect(active[0]?.name).toBe('Second Night')
    expect(active[1]?.name).toBe('First Night')
  })

  it('returns next session number for a campaign', () => {
    expect(getNextSessionNumber('c1', sessions)).toBe(3)
    expect(getNextSessionNumber('c2', sessions)).toBe(1)
  })
})
