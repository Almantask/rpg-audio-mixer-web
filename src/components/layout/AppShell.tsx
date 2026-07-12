import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AutoplayUnlockBanner, needsAutoplayUnlock } from '@/components/shared/AutoplayUnlockBanner'
import { ErrorOverlay } from '@/components/shared/ErrorOverlay'
import { SessionLockProvider } from '@/contexts/SessionLockContext'
import { useErrorOverlay } from '@/hooks/useErrorOverlay'
import { audioEngine } from '@/lib/audio'
import { AnimatedRouteContent } from './AnimatedRouteContent'
import { MainContent } from './MainContent'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(needsAutoplayUnlock())
  const { message: errorMessage, dismiss: dismissError } = useErrorOverlay()

  useEffect(() => {
    const check = () => setAutoplayBlocked(needsAutoplayUnlock())
    check()
    const interval = window.setInterval(check, 1000)
    return () => window.clearInterval(interval)
  }, [])

  const closeSidebar = () => setSidebarOpen(false)
  const toggleSidebar = () => setSidebarOpen((open) => !open)

  const handleUnlockAudio = async () => {
    await audioEngine.ensureContext()
    setAutoplayBlocked(needsAutoplayUnlock())
  }

  return (
    <SessionLockProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar onMenuToggle={toggleSidebar} sidebarOpen={sidebarOpen} />
          <MainContent>
            <AnimatedRouteContent>
              <Outlet />
            </AnimatedRouteContent>
          </MainContent>
        </div>
        <Toaster position="bottom-right" richColors theme="dark" />
        {errorMessage ? <ErrorOverlay message={errorMessage} onDismiss={dismissError} /> : null}
        <AutoplayUnlockBanner onUnlock={handleUnlockAudio} visible={autoplayBlocked} />
      </div>
    </SessionLockProvider>
  )
}