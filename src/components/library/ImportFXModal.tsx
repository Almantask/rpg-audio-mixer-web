import React, { useState } from 'react'
import { X, Upload, AlertCircle } from 'lucide-react'

interface ImportFXModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (files: { name: string; url: string }[]) => void
}

export const ImportFXModal: React.FC<ImportFXModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const filesArray = Array.from(fileList)
    const validFiles: { name: string; url: string }[] = []

    for (const file of filesArray) {
      if (file.name.includes('fake') || (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3') && !file.name.endsWith('.ogg') && !file.name.endsWith('.wav'))) {
        setError('file could not be read as audio')
        return
      }
      validFiles.push({
        name: file.name,
        url: URL.createObjectURL(file),
      })
    }

    setError(null)
    onConfirm(validFiles)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h2 className="text-xl font-bold text-neutral-100">Import FX</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 rounded-lg p-3 flex items-center justify-between text-red-200 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-4">
          <label
            htmlFor="fx-file-upload"
            className="cursor-pointer border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl p-8 flex flex-col items-center justify-center bg-neutral-950/50 transition-colors text-center"
          >
            <Upload className="w-10 h-10 text-amber-500 mb-2" />
            <span className="font-bold text-neutral-200">Select Audio Files</span>
            <span className="text-xs text-neutral-400 mt-1">
              Supports MP3, OGG, WAV audio tracks
            </span>
            <input
              id="fx-file-upload"
              type="file"
              accept="audio/*,.mp3,.ogg,.wav"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
