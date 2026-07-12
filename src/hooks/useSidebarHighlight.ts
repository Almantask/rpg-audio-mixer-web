import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getActiveSidebarItem } from '@/lib/navigation'
import type { SidebarItem } from '@/lib/constants'

export function useSidebarHighlight(): SidebarItem {
  const { pathname } = useLocation()

  return useMemo(() => getActiveSidebarItem(pathname), [pathname])
}
