import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Image, Music, Scroll, Trash2, X } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeOverride?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeOverride }) => {
  const location = useLocation()

  const currentPath = activeOverride || location.pathname

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Campaigns', path: '/campaigns', icon: BookOpen },
    { name: 'Scenes', path: '/scenes', icon: Image },
    { name: 'Library', path: '/library', icon: Music },
    { name: 'Credits', path: '/credits', icon: Scroll },
    { name: 'Trash', path: '/trash', icon: Trash2 },
  ]

  const isHighlighted = (itemPath: string) => {
    if (activeOverride) {
      return activeOverride === itemPath || activeOverride === itemPath.substring(1)
    }
    if (itemPath === '/') {
      return currentPath === '/'
    }
    return currentPath.startsWith(itemPath)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        data-testid="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#121212] border-r border-amber-900/20 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header in sidebar for mobile close */}
          <div className="flex items-center justify-between p-4 md:hidden border-b border-neutral-800">
            <span className="font-serif font-semibold text-amber-400">Arcanum Audio</span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="p-1 text-neutral-400 hover:text-white rounded-md focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const active = isHighlighted(item.path)
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose()}
                  data-sidebar-item={item.name}
                  aria-label={item.name}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                    active
                      ? 'bg-amber-500/10 text-amber-400 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-amber-400 rounded-r" />
                  )}
                  <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-neutral-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Profile Footer - Deferred MVP static avatar */}
        <div className="p-4 border-t border-neutral-800 flex items-center gap-3">
          <div
            data-testid="profile-footer-avatar"
            className="w-8 h-8 rounded-full bg-neutral-800 border border-amber-500/30 flex items-center justify-center text-xs font-semibold text-amber-400"
          >
            GM
          </div>
          <div className="text-xs">
            <p className="font-medium text-neutral-300">Game Master</p>
            <p className="text-neutral-500">Offline Session</p>
          </div>
        </div>
      </aside>
    </>
  )
}
