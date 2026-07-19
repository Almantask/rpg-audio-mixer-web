import type { ReactNode } from 'react'
import {
  BookOpen,
  Castle,
  Frame,
  Music,
  ScrollText,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SIDEBAR_ITEMS, SIDEBAR_ROUTES, type SidebarItem } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useSidebarHighlight } from '@/hooks/useSidebarHighlight'

const ICONS: Record<SidebarItem, ReactNode> = {
  Home: <Castle className="h-5 w-5" aria-hidden="true" />,
  Campaigns: <BookOpen className="h-5 w-5" aria-hidden="true" />,
  Scenes: <Frame className="h-5 w-5" aria-hidden="true" />,
  Library: <Music className="h-5 w-5" aria-hidden="true" />,
  Credits: <ScrollText className="h-5 w-5" aria-hidden="true" />,
  Trash: <Trash2 className="h-5 w-5" aria-hidden="true" />,
}

interface SidebarProps {
  open: boolean
  onNavigate?: () => void
  onClose?: () => void
}

export function Sidebar({ open, onNavigate, onClose }: SidebarProps) {
  const activeItem = useSidebarHighlight()

  return (
    <aside
      aria-label="Primary"
      data-testid="sidebar"
      data-sidebar-open={open ? 'true' : 'false'}
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-parchment/10 bg-charcoal-elevated transition-transform duration-200',
        'fixed inset-y-0 left-0 z-50 max-lg:transition-transform',
        open ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        'lg:static lg:translate-x-0',
      )}
    >
      <div className="flex items-start gap-3 px-4 pb-2 pt-5">
        <img
          src={`${import.meta.env.BASE_URL}logo3.png`}
          alt=""
          width={40}
          height={40}
          className="mt-0.5 h-10 w-10 shrink-0 rounded-lg object-cover"
          data-brand-logo
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-lg font-semibold leading-tight tracking-wide text-gold">
            Arcanum Audio
          </h1>
          <p className="mt-1 text-xs text-muted">Session desk</p>
        </div>
        {open ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            className="shrink-0 lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-4" aria-label="Main navigation">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeItem === item

          return (
            <Link
              key={item}
              to={SIDEBAR_ROUTES[item]}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              data-sidebar-item={item}
              data-active={isActive ? 'true' : 'false'}
              className={cn(
                'relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gold/12 text-gold shadow-[inset_3px_0_0_0_var(--color-gold)]'
                  : 'text-muted hover:bg-white/5 hover:text-parchment',
              )}
            >
              {ICONS[item]}
              <span>{item}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
