import { useState, type ReactNode, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, TopBar } from './Sidebar'
import { cn } from '@/lib/utils'
import { homePreview } from '@/lib/homePreview'
import { audioPreview } from '@/lib/audioPreview'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/') {
      homePreview.stop()
    }
    if (!location.pathname.startsWith('/library')) {
      audioPreview.stop()
    }
  }, [location.pathname])

  const handleNavigate = () => {
    homePreview.stop()
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-charcoal">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/50 max-lg:block lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <Sidebar open={sidebarOpen} onNavigate={handleNavigate} />

      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar onMenuToggle={() => setSidebarOpen((open) => !open)} />
        <main key={location.pathname} className="flex-1 overflow-y-auto p-6 aa-screen-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-8">
      <h2 className="font-serif text-3xl text-gold">{title}</h2>
      {subtitle ? <p className="mt-2 text-muted">{subtitle}</p> : null}
    </header>
  )
}

export function ScreenLandmark({
  screenName,
  children,
  className,
  ...props
}: {
  screenName: string
  children: ReactNode
  className?: string
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      aria-label={screenName}
      data-screen={screenName}
      className={cn('mx-auto max-w-4xl', className)}
      {...props}
    >
      {children}
    </section>
  )
}
