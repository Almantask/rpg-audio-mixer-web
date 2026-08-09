import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  BookOpen,
  Image as ImageIcon,
  Music,
  FileText,
  Trash2,
  Menu,
  X,
  User,
} from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  const isSessionDrilldown =
    pathname.includes('/sessions/') && pathname.includes('/scenes')

  const getActiveItem = () => {
    if (isSessionDrilldown) return 'Home'
    if (pathname === '/' || pathname === '') return 'Home'
    if (pathname.startsWith('/campaigns')) return 'Campaigns'
    if (pathname.startsWith('/scenes')) return 'Scenes'
    if (pathname.startsWith('/library')) return 'Library'
    if (pathname.startsWith('/credits')) return 'Credits'
    if (pathname.startsWith('/trash')) return 'Trash'
    return 'Home'
  }

  const activeItem = getActiveItem()

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Campaigns', path: '/campaigns', icon: BookOpen },
    { name: 'Scenes', path: '/scenes', icon: ImageIcon },
    { name: 'Library', path: '/library', icon: Music },
    { name: 'Credits', path: '/credits', icon: FileText },
    { name: 'Trash', path: '/trash', icon: Trash2 },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-100 flex flex-col md:flex-row">
      {/* Top bar */}
      <header className="h-14 bg-[#111111] border-b border-zinc-800 flex items-center justify-between px-4 md:hidden sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
          className="p-2 text-zinc-300 hover:text-amber-400 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-serif italic font-semibold text-lg text-amber-400">
          Arcanum Audio
        </span>
        <div className="w-6" />
      </header>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 w-64 bg-[#111111] border-r border-zinc-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } h-screen`}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50">
            <span className="font-serif italic font-bold text-xl text-amber-400">
              Arcanum Audio
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="md:hidden text-zinc-400 hover:text-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.name
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r" />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
            <User className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="font-medium text-zinc-300">Dungeon Master</div>
            <div className="text-zinc-500">Offline Mode</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-3.5rem)] md:min-h-screen">
        {children}
      </main>
    </div>
  )
}
