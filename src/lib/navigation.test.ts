import { describe, expect, it } from 'vitest'
import { getSidebarHighlightItem } from '@/lib/navigation'

describe('getSidebarHighlightItem', () => {
  it('highlights Home for campaign sessions drill-down', () => {
    expect(getSidebarHighlightItem('/campaigns/abc/sessions')).toBe('Home')
  })

  it('highlights Campaign on the campaigns list', () => {
    expect(getSidebarHighlightItem('/campaigns')).toBe('Campaign')
  })
})
