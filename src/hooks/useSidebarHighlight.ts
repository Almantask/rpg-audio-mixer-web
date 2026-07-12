import { useLocation } from 'react-router-dom'
import { getSidebarHighlightItem, type SidebarItemId } from '@/lib/navigation'

export function useSidebarHighlight(): SidebarItemId {
  const { pathname } = useLocation()
  return getSidebarHighlightItem(pathname)
}
