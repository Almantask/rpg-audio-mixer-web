import {
  BookOpen,
  Home,
  Image,
  Music,
  ScrollText,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

export type SidebarItemId =
  | 'Home'
  | 'Campaign'
  | 'Scenes'
  | 'Library'
  | 'Credits'
  | 'Trash'

export interface SidebarNavItem {
  id: SidebarItemId
  label: SidebarItemId
  path: string
  icon: LucideIcon
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { id: 'Home', label: 'Home', path: '/', icon: Home },
  { id: 'Campaign', label: 'Campaign', path: '/campaigns', icon: BookOpen },
  { id: 'Scenes', label: 'Scenes', path: '/scenes', icon: Image },
  { id: 'Library', label: 'Library', path: '/library', icon: Music },
  { id: 'Credits', label: 'Credits', path: '/credits', icon: ScrollText },
  { id: 'Trash', label: 'Trash', path: '/trash', icon: Trash2 },
]

export function getSidebarHighlightItem(pathname: string): SidebarItemId {
  if (pathname === '/') return 'Home'
  if (pathname === '/campaigns') return 'Campaign'
  if (pathname.startsWith('/campaigns/')) return 'Home'
  if (pathname === '/scenes' || pathname.startsWith('/scenes/')) return 'Scenes'
  if (pathname.startsWith('/library')) return 'Library'
  if (pathname === '/credits' || pathname.startsWith('/credits/')) return 'Credits'
  if (pathname === '/trash') return 'Trash'
  return 'Home'
}

export const SCREEN_PATHS: Record<string, string> = {
  'Home screen': '/',
  'Library screen': '/library',
  'Scenes screen': '/scenes',
  'Credits screen': '/credits',
  'Trash screen': '/trash',
  'Active Campaigns screen': '/campaigns',
  'Campaign Sessions screen': '/campaigns',
}
