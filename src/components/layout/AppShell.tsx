import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Home, Compass, Layers, Music, Award, Trash2 } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPath = location.pathname

  // Determine active item based on route and query/state
  const getActiveItem = () => {
    if (currentPath === '/') return 'Home'
    if (currentPath.startsWith('/campaigns')) return 'Campaigns'
    if (currentPath.startsWith('/scenes')) return 'Scenes'
    if (currentPath.startsWith('/library')) return 'Library'
    if (currentPath.startsWith('/credits')) return 'Credits'
    if (currentPath.startsWith('/trash')) return 'Trash'
    return 'Home'
  }

  const activeItem = getActiveItem()

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Campaigns', path: '/campaigns', icon: Compass },
    { name: 'Scenes', path: '/scenes', icon: Layers },
    { name: 'Library', path: '/library', icon: Music },
    { name: 'Credits', path: '/credits', icon: Award },
    { name: 'Trash', path: '/trash', icon: Trash2 },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top bar */}
      <header className="h-16 border-b border-neutral-800 bg-neutral-900 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="hamburger menu"
            className="p-2 text-neutral-400 hover:text-amber-400 lg:hidden focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-xl font-bold tracking-wide text-amber-400">Arcanum Audio</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Mobile close menu */}
          <div className="p-4 flex justify-between items-center lg:hidden border-b border-neutral-800">
            <span className="font-semibold text-amber-400">Navigation</span>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="p-1 text-neutral-400 hover:text-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isHighlighted = activeItem === item.name
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    isHighlighted
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                  data-active={isHighlighted ? 'true' : 'false'}
                >
                  <Icon className={`w-5 h-5 ${isHighlighted ? 'text-amber-400' : 'text-neutral-400'}`} />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-950 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
