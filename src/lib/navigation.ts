import type { SidebarItem } from './constants'

export interface SidebarLocationState {
  campaignId?: string
  sessionId?: string
}

/**
 * Determines which sidebar item should appear highlighted for a given pathname.
 * Active Scene opened from a campaign session keeps Campaigns highlighted.
 */
export function getActiveSidebarItem(
  pathname: string,
  state?: SidebarLocationState | null,
): SidebarItem {
  if (pathname.match(/^\/scenes\/[^/]+\/active$/)) {
    if (state?.campaignId) {
      return 'Campaigns'
    }
    return 'Scenes'
  }

  if (pathname === '/campaigns' || pathname.startsWith('/campaigns/')) {
    return 'Campaigns'
  }

  if (pathname === '/scenes' || pathname.startsWith('/scenes/')) {
    return 'Scenes'
  }

  if (pathname.startsWith('/library')) {
    return 'Library'
  }

  if (pathname.startsWith('/credits')) {
    return 'Credits'
  }

  if (pathname.startsWith('/trash')) {
    return 'Trash'
  }

  return 'Home'
}
