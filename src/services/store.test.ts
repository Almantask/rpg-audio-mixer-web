import { describe, it, expect, beforeEach } from 'vitest'
import { getData, setData, resetData } from './store'

describe('store service', () => {
  beforeEach(() => {
    resetData()
  })

  it('manages app data correctly', () => {
    let data = getData()
    expect(data.campaigns).toHaveLength(0)

    setData({
      campaigns: [
        {
          id: 'c1',
          name: 'The Shattered Throne',
          createdAt: '2026-01-01',
          lastPlayedAt: '2026-01-01',
        },
      ],
    })

    data = getData()
    expect(data.campaigns).toHaveLength(1)
    expect(data.campaigns[0].name).toBe('The Shattered Throne')
  })
})
