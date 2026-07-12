import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  action?: ToastAction
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (message: string, action?: ToastAction) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, action?: ToastAction) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, action }])
    if (!action) {
      window.setTimeout(() => dismissToast(id), 4000)
    }
  }, [dismissToast])

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="flex items-center gap-3 rounded-md border border-white/10 bg-charcoal-elevated px-4 py-3 text-sm shadow-lg"
          >
            <span>{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                className="font-medium text-gold hover:underline"
                onClick={() => {
                  toast.action?.onClick()
                  dismissToast(toast.id)
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}
