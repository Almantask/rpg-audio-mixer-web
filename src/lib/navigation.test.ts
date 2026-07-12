import { describe, it, expect } from 'vitest'
import { getActiveSidebarItem } from './navigation'

describe('getActiveSidebarItem', () => {
  it('highlights Home on the dashboard', () => {
    expect(getActiveSidebarItem('/')).toBe('Home')
  })

  it('highlights Campaign on the campaigns list', () => {
    expect(getActiveSidebarItem('/campaigns')).toBe('Campaign')
  })

  it('highlights Home on campaign session drill-down routes', () => {
    expect(getActiveSidebarItem('/campaigns/abc/sessions/1/scenes')).toBe('Home')
  })

  it('highlights Scenes on the global scenes list', () => {
    expect(getActiveSidebarItem('/scenes')).toBe('Scenes')
  })

  it('highlights Scenes when Active Scene is opened from the global list', () => {
    expect(getActiveSidebarItem('/scenes/tavern/active')).toBe('Scenes')
  })

  it('highlights Library on library routes', () => {
    expect(getActiveSidebarItem('/library')).toBe('Library')
  })

  it('highlights Credits on credits routes', () => {
    expect(getActiveSidebarItem('/credits')).toBe('Credits')
  })

  it('highlights Trash on trash routes', () => {
    expect(getActiveSidebarItem('/trash')).toBe('Trash')
  })
})
