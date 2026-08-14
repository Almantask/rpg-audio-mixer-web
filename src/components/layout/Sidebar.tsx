import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Home, BookOpen, Film, Music, Scroll, Trash2, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const pathname = location.pathname
  const fromContext = searchParams.get('from')

  // Determine active item according to Platform Design & Navigation rules:
  // - Campaign drill-downs (Sessions, Session Scenes, Active Scene from session) keep Campaigns highlighted
  // - Active Scene from global Scenes keeps Scenes highlighted
  // - Global Scenes list keeps Scenes highlighted
  // - Home, Campaigns, Scenes, Library, Credits, Trash
  let activeKey = 'Home'
  if (pathname === '/') {
    activeKey = 'Home'
  } else if (pathname.startsWith('/campaigns')) {
    activeKey = 'Campaigns'
  } else if (pathname.startsWith('/scenes')) {
    if (fromContext === 'campaign' || fromContext === 'session') {
      activeKey = 'Campaigns'
    } else {
      activeKey = 'Scenes'
    }
  } else if (pathname.startsWith('/library')) {
    activeKey = 'Library'
  } else if (pathname.startsWith('/credits') || pathname.startsWith('/legal')) {
    activeKey = 'Credits'
  } else if (pathname.startsWith('/trash')) {
    activeKey = 'Trash'
  }

  const navItems = [
    { label: 'Home', icon: Home, route: '/' },
    { label: 'Campaigns', icon: BookOpen, route: '/campaigns' },
    { label: 'Scenes', icon: Film, route: '/scenes' },
    { label: 'Library', icon: Music, route: '/library' },
    { label: 'Credits', icon: Scroll, route: '/credits' },
    { label: 'Trash', icon: Trash2, route: '/trash' },
  ]

  const handleNav = (route: string) => {
    navigate(route)
    onClose()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800/80 bg-zinc-950/95 transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-800/60 md:hidden">
          <span className="font-serif font-bold text-amber-400">Navigation</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-100 p-1.5 rounded-md hover:bg-zinc-900"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
            <span className="text-xs">Close menu</span>
          </button>
        </div>

        {/* Primary Navigation Items */}
        <nav className="flex-1 space-y-1 p-3 pt-4">
          {navItems.map((item) => {
            const isActive = activeKey === item.label
            const Icon = item.icon

            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.route)}
                className={cn(
                  'relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all text-left cursor-pointer',
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-amber-400 shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                )}
                <Icon className={cn('h-5 w-5', isActive ? 'text-amber-400' : 'text-zinc-400')} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Profile Footer - Static placeholder */}
        <div className="p-4 border-t border-zinc-900 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-serif text-amber-400">
            GM
          </div>
          <div className="text-xs text-zinc-500">Game Master</div>
        </div>
      </aside>
    </>
  )
}
