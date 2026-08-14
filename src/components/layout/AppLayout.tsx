import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Image as ImageIcon, Music, Scroll, Trash2, Menu, X, User } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pathname = location.pathname

  // Active highlight logic per PW-06
  const getActiveItem = () => {
    if (pathname === '/') return 'Home'
    if (pathname.startsWith('/campaigns')) return 'Campaign'
    if (pathname === '/scenes' || pathname.startsWith('/scenes/')) return 'Scenes'
    if (pathname.startsWith('/library')) return 'Library'
    if (pathname === '/credits') return 'Credits'
    if (pathname === '/trash') return 'Trash'
    return 'Home'
  }

  const activeItem = getActiveItem()

  const navItems = [
    { name: 'Home', label: 'Home', icon: Home, path: '/' },
    { name: 'Campaign', label: 'Campaigns', icon: BookOpen, path: '/campaigns' },
    { name: 'Scenes', label: 'Scenes', icon: ImageIcon, path: '/scenes' },
    { name: 'Library', label: 'Library', icon: Music, path: '/library' },
    { name: 'Credits', label: 'Credits', icon: Scroll, path: '/credits' },
    { name: 'Trash', label: 'Trash', icon: Trash2, path: '/trash' },
  ]

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-stone-200 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-14 border-b border-amber-900/30 bg-[#121212] px-4 flex items-center justify-between sticky top-0 z-40">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-stone-800 text-stone-300 md:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center font-serif italic text-amber-400 text-xl font-bold tracking-wide">
          Arcanum Audio
        </div>

        {/* Placeholder to balance layout; explicitly no gear icon */}
        <div className="w-9" />
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          aria-label="Primary sidebar"
          className={`
            fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#121212] border-r border-amber-900/30
            flex flex-col transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Sidebar Mobile Close Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-amber-900/20 md:hidden">
            <span className="font-serif text-amber-400 font-semibold">Navigation</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-stone-800 text-stone-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Navigation List */}
          <nav aria-label="Primary sidebar" className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.name
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  data-active={isActive ? 'true' : 'false'}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative
                    ${
                      isActive
                        ? 'bg-amber-950/40 text-amber-300 font-semibold border-l-4 border-amber-400 pl-2.5'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Static Profile Footer (PW-05 defer) */}
          <div className="p-4 border-t border-amber-900/20 flex items-center gap-3 text-stone-400 text-sm">
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-amber-400/70 border border-amber-900/30">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-stone-300 font-medium text-xs">Dungeon Master</span>
              <span className="text-[10px] text-stone-500">Offline Mode</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0D0D0D]">
          {children}
        </main>
      </div>
    </div>
  )
}
