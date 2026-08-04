import React, { useState } from 'react'
import { Home, BookOpen, Image, Music, Scroll, Trash2, Menu, X } from 'lucide-react'

interface AppShellProps {
  currentPath: string
  onNavigate: (path: string) => void
  activeHighlight?: string
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({
  currentPath,
  onNavigate,
  activeHighlight,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Campaigns', icon: BookOpen, path: '/campaigns' },
    { label: 'Scenes', icon: Image, path: '/scenes' },
    { label: 'Library', icon: Music, path: '/library' },
    { label: 'Credits', icon: Scroll, path: '/credits' },
    { label: 'Trash', icon: Trash2, path: '/trash' },
  ]

  const getActiveItem = () => {
    if (activeHighlight) return activeHighlight
    if (currentPath === '/') return 'Home'
    if (currentPath.startsWith('/campaigns')) return 'Campaigns'
    if (currentPath.startsWith('/scenes')) return 'Scenes'
    if (currentPath.startsWith('/library')) return 'Library'
    if (currentPath.startsWith('/credits')) return 'Credits'
    if (currentPath.startsWith('/trash')) return 'Trash'
    return 'Home'
  }

  const activeItem = getActiveItem()

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-14 border-b border-amber-900/30 bg-[#121212] px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            aria-label="Open menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 rounded text-amber-400 hover:bg-amber-900/20"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 text-center font-serif italic text-xl tracking-wider text-amber-400 font-semibold">
          Arcanum Audio
        </div>

        <div className="w-8"></div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#121212] border-r border-amber-900/30
            flex flex-col justify-between transform transition-transform duration-200 ease-in-out h-full overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div>
            {/* Mobile Close Button */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-amber-900/20">
              <span className="font-serif text-amber-400 font-bold">Navigation</span>
              <button
                aria-label="Close menu"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSidebarOpen(false)
                }}
                className="p-1 rounded text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Primary Navigation */}
            <nav className="py-4 px-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeItem === item.label

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      onNavigate(item.path)
                      setSidebarOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 relative
                      ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 font-medium'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 bg-amber-400 rounded-r" />
                    )}
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Profile Footer */}
          <div className="p-4 border-t border-amber-900/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-900/40 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-sm">
              GM
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Game Master</span>
              <span className="text-xs text-amber-400/80">Local Profile</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0D0D0D] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
