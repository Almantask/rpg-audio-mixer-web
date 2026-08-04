import React, { useEffect } from 'react'

interface ToastProps {
  message: string | null
  onClose: () => void
  duration?: number
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-amber-500/50 text-amber-300 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 text-sm font-medium animate-in slide-in-from-bottom duration-200"
    >
      <span>{message}</span>
      <button onClick={onClose} className="text-neutral-400 hover:text-white text-xs">
        ✕
      </button>
    </div>
  )
}
