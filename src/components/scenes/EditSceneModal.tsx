import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Scene } from '../../types'

interface EditSceneModalProps {
  isOpen: boolean
  scene: Scene | null
  onClose: () => void
  onConfirm: (id: string, updates: Partial<Scene>) => void
}

const PREDEFINED_TAGS = ['Tavern', 'Combat', 'City', 'Night', 'Exploration', 'Social', 'Boss']

export const EditSceneModal: React.FC<EditSceneModalProps> = ({
  isOpen,
  scene,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  useEffect(() => {
    if (scene) {
      setName(scene.name)
      setDescription(scene.description || '')
      setTags(scene.tags || [])
    }
  }, [scene])

  if (!isOpen || !scene) return null

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setCustomTag('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(scene.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      tags,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h2 className="text-xl font-bold text-neutral-100">Edit Scene Details</h2>
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
              Scene Name
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
              Tags
            </label>
            {/* Tag chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-semibold"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove ${tag} tag`}
                    className="hover:text-red-400 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Quick tag suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PREDEFINED_TAGS.filter((t) => !tags.includes(t)).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAddTag(t)}
                  className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded"
                >
                  + {t}
                </button>
              ))}
            </div>

            {/* Custom tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleAddTag(customTag)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold rounded-lg"
              >
                Add
              </button>
            </div>
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
