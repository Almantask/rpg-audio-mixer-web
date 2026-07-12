import { NavLink, useLocation } from 'react-router-dom'
import { useSessionLock } from '@/contexts/SessionLockContext'
import { useSidebarHighlight } from '@/hooks/useSidebarHighlight'
import { SIDEBAR_NAV_ITEMS } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { SidebarFooter } from './SidebarFooter'

interface SidebarProps {
  isOpen: boolean
  onNavigate?: () => void
}

export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const activeItem = useSidebarHighlight()
  const { tryNavigate } = useSessionLock()
  const location = useLocation()

  const handleNavClick = (event: React.MouseEvent, path: string) => {
    if (path === location.pathname) return
    if (!tryNavigate(path)) {
      event.preventDefault()
      return
    }
    onNavigate?.()
  }

  return (    <>
      {isOpen ? (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onNavigate}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-zinc-800 bg-surface transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        data-sidebar-open={isOpen}
        id="primary-navigation"
      >
        <nav aria-label="Primary navigation" className="flex flex-1 flex-col gap-1 p-3">
          {SIDEBAR_NAV_ITEMS.map(({ id, label, path, icon: Icon }) => {
            const isActive = activeItem === id
            return (
              <NavLink
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100',
                )}
                data-sidebar-active={isActive ? 'true' : 'false'}
                data-sidebar-item={id}
                key={id}
                onClick={(event) => handleNavClick(event, path)}
                to={path}
              >
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-0 w-1 rounded-r bg-gold"
                  />
                ) : null}
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>
        <SidebarFooter />
      </aside>
    </>
  )
}
