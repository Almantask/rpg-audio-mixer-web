import type { ReactNode } from 'react'
import {
  BookOpen,
  Castle,
  Frame,
  Home,
  Menu,
  Music,
  ScrollText,
  Trash2,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SIDEBAR_ITEMS, SIDEBAR_ROUTES, type SidebarItem } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useSidebarHighlight } from '@/hooks/useSidebarHighlight'

const ICONS: Record<SidebarItem, ReactNode> = {
  Home: <Home className="h-5 w-5" aria-hidden="true" />,
  Campaign: <BookOpen className="h-5 w-5" aria-hidden="true" />,
  Scenes: <Frame className="h-5 w-5" aria-hidden="true" />,
  Library: <Music className="h-5 w-5" aria-hidden="true" />,
  Credits: <ScrollText className="h-5 w-5" aria-hidden="true" />,
  Trash: <Trash2 className="h-5 w-5" aria-hidden="true" />,
}

interface SidebarProps {
  open: boolean
  onNavigate?: () => void
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const activeItem = useSidebarHighlight()

  return (
    <aside
      aria-label="Primary"
      data-testid="sidebar"
      data-sidebar-open={open ? 'true' : 'false'}
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-charcoal-elevated transition-transform duration-200',
        'fixed inset-y-0 left-0 z-40 max-lg:transition-transform',
        open ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        'lg:static lg:translate-x-0',
      )}
    >
      <nav className="flex flex-1 flex-col pt-4" aria-label="Main navigation">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeItem === item

          return (
            <NavLink
              key={item}
              to={SIDEBAR_ROUTES[item]}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              data-sidebar-item={item}
              data-active={isActive ? 'true' : 'false'}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                isActive
                  ? 'bg-gold/10 text-gold before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r before:bg-gold'
                  : 'text-muted hover:bg-white/5 hover:text-white',
              )}
            >
              {ICONS[item]}
              <span>{item === 'Campaign' ? 'Campaign' : item}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div
          aria-label="Profile avatar placeholder"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-muted"
          data-testid="avatar-placeholder"
        >
          <Castle className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </aside>
  )
}

interface TopBarProps {
  onMenuToggle: () => void
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="relative z-50 flex h-14 items-center border-b border-white/10 px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        onClick={onMenuToggle}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 justify-center">
        <h1
          className="font-serif text-lg italic text-gold md:text-xl"
          aria-label="Arcanum Audio"
        >
          Arcanum Audio
        </h1>
      </div>
      <div className="w-10 lg:hidden" aria-hidden="true" />
    </header>
  )
}
