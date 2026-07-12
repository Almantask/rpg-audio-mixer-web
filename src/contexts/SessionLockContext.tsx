import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface SessionLockContextValue {
  isLocked: boolean
  setLocked: (locked: boolean) => void
  tryNavigate: (path: string) => boolean
  navigationBlocked: boolean
  clearNavigationBlocked: () => void
}

const SessionLockContext = createContext<SessionLockContextValue>({
  isLocked: false,
  setLocked: () => {},
  tryNavigate: () => true,
  navigationBlocked: false,
  clearNavigationBlocked: () => {},
})

export function SessionLockProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false)
  const [navigationBlocked, setNavigationBlocked] = useState(false)

  const setLocked = useCallback((locked: boolean) => {
    setIsLocked(locked)
    if (!locked) setNavigationBlocked(false)
  }, [])

  const tryNavigate = useCallback(
    (path: string) => {
      if (!isLocked) return true
      if (path.startsWith('/scenes/') && path !== window.location.pathname) {
        setNavigationBlocked(true)
        return false
      }
      if (!path.startsWith('/scenes/')) {
        setNavigationBlocked(true)
        return false
      }
      return true
    },
    [isLocked],
  )

  const clearNavigationBlocked = useCallback(() => setNavigationBlocked(false), [])

  const value = useMemo(
    () => ({ isLocked, setLocked, tryNavigate, navigationBlocked, clearNavigationBlocked }),
    [isLocked, setLocked, tryNavigate, navigationBlocked, clearNavigationBlocked],
  )

  return <SessionLockContext.Provider value={value}>{children}</SessionLockContext.Provider>
}

export function useSessionLock(): SessionLockContextValue {
  return useContext(SessionLockContext)
}
