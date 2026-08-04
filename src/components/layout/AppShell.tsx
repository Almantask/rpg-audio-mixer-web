import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Image, Music, Scroll, Trash2, Menu } from 'lucide-react'

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const path = location.pathname

  const isHomeActive = path === '/'
  const isCampaignActive = path.startsWith('/campaigns') && !isHomeActive
  const isScenesActive = path.startsWith('/scenes')
  const isLibraryActive = path.startsWith('/library')
  const isCreditsActive = path.startsWith('/credits')
  const isTrashActive = path.startsWith('/trash')

  const navItems = [
    { label: 'Home', href: '/', icon: Home, active: isHomeActive },
    { label: 'Campaign', href: '/campaigns', icon: BookOpen, active: isCampaignActive },
    { label: 'Scenes', href: '/scenes', icon: Image, active: isScenesActive },
    { label: 'Library', href: '/library', icon: Music, active: isLibraryActive },
    { label: 'Credits', href: '/credits', icon: Scroll, active: isCreditsActive },
    { label: 'Trash', href: '/trash', icon: Trash2, active: isTrashActive },
  ]

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-neutral-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-14 border-b border-neutral-800 bg-[#121212] px-4 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 text-neutral-400 hover:text-amber-400 rounded-lg lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center font-serif text-xl italic font-bold text-amber-400 tracking-wider">
          Arcanum Audio
        </div>

        <div className="w-9" /> {/* Balance spacer */}
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar overlay backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`fixed lg:static top-14 bottom-0 left-0 z-30 w-64 bg-[#121212] border-r border-neutral-800 flex flex-col transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="flex-1 py-4 px-3 space-y-1.5" aria-label="Primary sidebar">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    item.active
                      ? 'bg-amber-950/40 text-amber-400 border-l-4 border-amber-400 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Profile footer placeholder (PW-05 static) */}
          <div className="p-4 border-t border-neutral-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-amber-500/40 flex items-center justify-center font-serif text-amber-400 text-xs font-bold">
              GM
            </div>
            <div className="text-xs text-neutral-400 truncate">Dungeon Master</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
