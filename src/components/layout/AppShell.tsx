import { useState, type ReactNode, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'
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
    <div className="flex min-h-screen w-full bg-charcoal">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/50 max-lg:block lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <Sidebar
        open={sidebarOpen}
        onNavigate={handleNavigate}
        onClose={() => setSidebarOpen(false)}
      />

      {!sidebarOpen ? (
        <div
          data-mobile-top-bar
          className="fixed inset-x-0 top-0 z-[60] flex h-14 items-center bg-charcoal/90 px-3 backdrop-blur-sm lg:hidden"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="bg-charcoal/80"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main
          key={location.pathname}
          className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto aa-screen-enter px-4 pb-4 pt-14 sm:px-6 sm:pb-6 lg:p-6"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-3xl tracking-wide text-gold md:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-2 text-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
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
      className={cn('w-full max-w-none', className)}
      {...props}
    >
      {children}
    </section>
  )
}
