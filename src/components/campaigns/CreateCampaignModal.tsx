import React, { useState } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string, description?: string, coverUrl?: string) => void
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Campaign name is required')
      return
    }
    setError('')
    onConfirm(name.trim(), description.trim() || undefined, coverUrl)
    setName('')
    setDescription('')
    setCoverUrl(undefined)
    onClose()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCoverUrl(url)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h2 className="text-xl font-bold text-neutral-100">Create Campaign</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Campaign Name <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. The Shattered Throne"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-500"
            />
            {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Whispers from a shattered keep"
              rows={3}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Cover Art
            </label>
            <label
              htmlFor="campaign-cover-upload"
              className="cursor-pointer border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-lg p-4 flex flex-col items-center justify-center bg-neutral-950/50 transition-colors"
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Campaign Cover Art"
                  className="h-24 object-cover rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-400 space-y-1">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-sm">Click to upload cover image</span>
                </div>
              )}
              <input
                id="campaign-cover-upload"
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
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
