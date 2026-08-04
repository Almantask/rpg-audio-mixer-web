import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  BookOpen,
  Image as ImageIcon,
  Music,
  Scroll,
  Trash2,
  Menu,
  X,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface AppShellProps {
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { toastMessage } = useApp()

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Campaign', path: '/campaigns', icon: BookOpen },
    { label: 'Scenes', path: '/scenes', icon: ImageIcon },
    { label: 'Library', path: '/library', icon: Music },
    { label: 'Credits', path: '/credits', icon: Scroll },
    { label: 'Trash', path: '/trash', icon: Trash2 },
  ]

  // Highlight logic per PW-06
  const isNavActive = (path: string) => {
    const current = location.pathname
    if (path === '/') {
      return (
        current === '/' ||
        current.startsWith('/campaigns/') // Session drill-down keeps Home active
      )
    }
    if (path === '/campaigns') {
      return current === '/campaigns'
    }
    if (path === '/scenes') {
      return current === '/scenes'
    }
    if (path === '/library') {
      return current.startsWith('/library')
    }
    return current.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100 font-sans flex flex-col md:flex-row">
      {/* Top Mobile Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#121212] border-b border-yellow-900/30 sticky top-0 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-md"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="font-serif italic text-xl font-bold tracking-wider text-yellow-500">
          Arcanum Audio
        </h1>
        <div className="w-8" />
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121212] border-r border-yellow-900/20 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo / Header Desktop */}
          <div className="hidden md:flex items-center justify-center py-6 border-b border-yellow-900/20">
            <h1 className="font-serif italic text-2xl font-bold tracking-wider text-yellow-500">
              Arcanum Audio
            </h1>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isNavActive(item.path)

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors relative ${
                    active
                      ? 'bg-yellow-500/10 text-yellow-400 border-l-4 border-yellow-500 font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-yellow-500' : 'text-gray-400'} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Profile Footer (Static MVP - PW-05) */}
        <div className="p-4 border-t border-yellow-900/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-900/30 border border-yellow-500/30 flex items-center justify-center font-serif text-yellow-500 font-bold">
            GM
          </div>
          <div>
            <div className="text-sm font-medium text-gray-200">Dungeon Master</div>
            <div className="text-xs text-gray-500">Local Session</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#0D0D0D] p-4 md:p-8 overflow-y-auto">
        {children}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-black font-semibold px-5 py-3 rounded-lg shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
