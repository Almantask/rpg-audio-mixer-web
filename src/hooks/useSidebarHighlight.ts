import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getActiveSidebarItem, type SidebarLocationState } from '@/lib/navigation'
import type { SidebarItem } from '@/lib/constants'

export function useSidebarHighlight(): SidebarItem {
  const { pathname, state } = useLocation()

  return useMemo(
    () => getActiveSidebarItem(pathname, state as SidebarLocationState | null),
    [pathname, state],
  )
}
