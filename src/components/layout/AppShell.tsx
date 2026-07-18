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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-3 top-3 z-[60] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main
          key={location.pathname}
          className="min-w-0 flex-1 overflow-y-auto p-6 aa-screen-enter max-lg:pt-14"
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
