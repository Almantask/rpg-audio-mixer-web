import React, { useState, useEffect } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import type { Session } from '../../types'

interface EditSessionModalProps {
  isOpen: boolean
  session: Session | null
  onClose: () => void
  onConfirm: (id: string, updates: Partial<Session>) => Promise<void> | void
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  session,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      setName(session.name)
      setDate(session.date)
      setDescription(session.description || '')
      setCoverUrl(session.coverUrl)
    }
  }, [session])

  if (!isOpen || !session) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Session name is required')
      return
    }
    setError('')
    try {
      await onConfirm(session.id, {
        name: name.trim(),
        date,
        description: description.trim() || undefined,
        coverUrl,
      })
      onClose()
    } catch {
      setError('Failed to save session edits')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverUrl(URL.createObjectURL(file))
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h2 className="text-xl font-bold text-neutral-100">Edit Session ({session.number})</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Session Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Session Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Cover Art
            </label>
            <label
              htmlFor="edit-session-cover-upload"
              className="cursor-pointer border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-lg p-4 flex flex-col items-center justify-center bg-neutral-950/50 transition-colors"
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Session Cover Art"
                  className="h-24 object-cover rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-400 space-y-1">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-sm">Click to upload new cover image</span>
                </div>
              )}
              <input
                id="edit-session-cover-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
