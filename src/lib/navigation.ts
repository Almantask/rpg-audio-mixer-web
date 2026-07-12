import type { SidebarItem } from './constants'

/**
 * Determines which sidebar item should appear highlighted for a given pathname.
 * See docs/designs/platform-design.md — Active highlight (PW-06).
 */
export function getActiveSidebarItem(pathname: string): SidebarItem {
  if (pathname.startsWith('/campaigns/')) {
    return 'Home'
  }

  if (pathname.match(/^\/scenes\/[^/]+\/active$/)) {
    return 'Scenes'
  }

  if (pathname === '/campaigns') {
    return 'Campaign'
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
