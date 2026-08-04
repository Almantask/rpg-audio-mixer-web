import React from 'react'

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}) => {
  if (!isOpen) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h2 id="alert-title" className="font-serif text-lg font-bold text-neutral-100">
          {title}
        </h2>
        <p id="alert-description" className="text-sm text-neutral-300">
          {description}
        </p>
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
              isDestructive
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
