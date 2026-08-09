import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  activeSidebarOverride?: string
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activeSidebarOverride }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-neutral-200 flex flex-col">
      {/* Top Bar */}
      <header className="h-14 bg-[#121212] border-b border-neutral-800 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="p-2 text-neutral-400 hover:text-white rounded-md md:hidden focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 font-serif text-lg italic text-amber-400 tracking-wide font-semibold">
          Arcanum Audio
        </div>

        <div className="w-8">{/* Spacer for alignment */}</div>
      </header>

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeOverride={activeSidebarOverride}
        />

        <main className="flex-1 md:ml-64 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
