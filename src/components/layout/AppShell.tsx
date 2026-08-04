import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  BookOpen,
  Image as ImageIcon,
  Music,
  Scroll,
  Trash2,
  Menu,
  X,
  Square,
  Volume2,
  User,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface AppShellProps {
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation()
  const path = location.pathname
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {
    masterVolume,
    setMasterVolume,
    playingCategoryIds,
    activeFxIds,
    stopAllAudio,
    toastMessage,
    clearToast,
  } = useApp()

  const isAudioPlaying = playingCategoryIds.length > 0 || activeFxIds.length > 0

  // Sidebar item highlighting logic per platform-design.md PW-06
  const isHomeActive = path === '/' || path.startsWith('/campaigns/') && path.includes('/sessions')
  const isCampaignActive = path === '/campaigns'
  const isScenesActive = path === '/scenes' || (path.startsWith('/scenes/') && !path.startsWith('/scenes/new'))
  const isLibraryActive = path.startsWith('/library')
  const isCreditsActive = path === '/credits'
  const isTrashActive = path === '/trash'

  const navItems = [
    { label: 'Home', href: '/', icon: Home, active: isHomeActive },
    { label: 'Campaign', href: '/campaigns', icon: BookOpen, active: isCampaignActive },
    { label: 'Scenes', href: '/scenes', icon: ImageIcon, active: isScenesActive },
    { label: 'Library', href: '/library', icon: Music, active: isLibraryActive },
    { label: 'Credits', href: '/credits', icon: Scroll, active: isCreditsActive },
    { label: 'Trash', href: '/trash', icon: Trash2, active: isTrashActive },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#171717] border-b border-yellow-900/30 sticky top-0 z-40">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 text-gray-300 hover:text-amber-400 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-serif italic text-xl text-amber-400 font-bold tracking-wider">
          Arcanum Audio
        </span>
        {isAudioPlaying ? (
          <button
            onClick={stopAllAudio}
            className="p-2 text-red-400 hover:text-red-300"
            title="Stop All Audio"
            aria-label="Stop all audio"
          >
            <Square size={20} className="fill-current" />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </header>

      {/* Sidebar Nav */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#141414] border-r border-yellow-900/20 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header branding */}
        <div className="hidden md:flex flex-col items-center justify-center p-6 border-b border-yellow-900/20">
          <h1 className="font-serif italic text-2xl text-amber-400 font-bold tracking-wider text-center">
            Arcanum Audio
          </h1>
          <p className="text-xs text-amber-600/70 uppercase tracking-widest mt-1">RPG Soundscape Engine</p>
        </div>

        {/* Master Control Bar */}
        <div className="px-4 py-3 bg-[#1c1c1c] border-b border-yellow-900/20 flex items-center space-x-3">
          <Volume2 size={18} className="text-amber-500 shrink-0" />
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            aria-label="Master Volume"
          />
          <span className="text-xs font-mono text-gray-400 w-8 text-right">{masterVolume}%</span>
        </div>

        {/* Global Stop All Button */}
        {isAudioPlaying && (
          <div className="p-3 border-b border-yellow-900/20">
            <button
              onClick={stopAllAudio}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 rounded text-sm font-semibold transition"
            >
              <Square size={14} className="fill-current" />
              <span>STOP ALL AUDIO</span>
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                  item.active
                    ? 'bg-amber-950/40 text-amber-400 border-l-4 border-amber-500 font-semibold'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <Icon size={20} className={item.active ? 'text-amber-400' : 'text-gray-500'} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Profile Footer - Static avatar placeholder per PW-05 */}
        <div className="p-4 border-t border-yellow-900/20 flex items-center space-x-3 bg-[#111111]">
          <div className="w-9 h-9 rounded-full bg-amber-900/30 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <User size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-300">Game Master</div>
            <div className="text-[10px] text-gray-500">Offline Session Mode</div>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-900/90 text-amber-100 border border-amber-500/60 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 backdrop-blur animate-fade-in">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={clearToast} className="text-amber-300 hover:text-white text-xs underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
