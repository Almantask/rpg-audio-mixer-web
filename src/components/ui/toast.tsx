import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ToastMessage {
  id: string
  message: string
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

const listeners = new Set<(toasts: ToastMessage[]) => void>()
let toastQueue: ToastMessage[] = []

export const toast = {
  show(message: string, options: { actionLabel?: string; onAction?: () => void; duration?: number } = {}) {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newToast: ToastMessage = {
      id,
      message,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
      duration: options.duration ?? 4000,
    }
    toastQueue = [...toastQueue, newToast]
    listeners.forEach((l) => l(toastQueue))

    setTimeout(() => {
      toastQueue = toastQueue.filter((t) => t.id !== id)
      listeners.forEach((l) => l(toastQueue))
    }, newToast.duration)
  },
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  React.useEffect(() => {
    listeners.add(setToasts)
    return () => {
      listeners.delete(setToasts)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-center justify-between gap-3 p-4 bg-zinc-900 border border-amber-500/40 text-amber-200 rounded-lg shadow-xl text-sm font-medium animate-in slide-in-from-bottom-2'
          )}
        >
          <span>{t.message}</span>
          {t.actionLabel && t.onAction && (
            <button
              onClick={() => {
                t.onAction?.()
                toastQueue = toastQueue.filter((x) => x.id !== t.id)
                listeners.forEach((l) => l(toastQueue))
              }}
              className="text-amber-400 font-bold hover:underline ml-2"
            >
              {t.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
