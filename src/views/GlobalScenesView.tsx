import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit2, Copy, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge } from '../components/common/Badge'
import { Dialog } from '../components/common/Dialog'
import { AlertDialog } from '../components/common/AlertDialog'
import type { Scene } from '../types'

export const GlobalScenesView: React.FC = () => {
  const navigate = useNavigate()
  const {
    scenes,
    sceneSoundscapes,
    soundboardItems,
    sessionScenes,
    createScene,
    duplicateScene,
    updateScene,
    softDeleteScene,
    setActiveSceneId,
  } = useApp()

  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [bgImage, setBgImage] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const filteredScenes = scenes.filter((s) =>
    s.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createScene({
      name: name.trim(),
      description: description.trim() || undefined,
      backgroundImage: bgImage.trim() || undefined,
    })
    setName('')
    setDescription('')
    setBgImage('')
    setIsCreateOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScene || !name.trim()) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)

    updateScene(editingScene.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      backgroundImage: bgImage.trim() || undefined,
      tags,
    })
    setEditingScene(null)
  }

  const handleOpenScene = (sceneId: string) => {
    setActiveSceneId(sceneId)
    updateScene(sceneId, { lastPlayedAt: Date.now() })
    navigate(`/scenes/${sceneId}`)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">Scenes</h1>
        <p className="text-sm text-neutral-400">Curate and manage your immersive environments.</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search scenes..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
        />
      </div>

      {/* Scene Rows */}
      <div className="space-y-4">
        {filteredScenes.map((scene) => {
          const scCount = sceneSoundscapes.filter((ss) => ss.sceneId === scene.id).length
          const fxCount = soundboardItems.filter((sb) => sb.sceneId === scene.id).length

          return (
            <div
              key={scene.id}
              onClick={() => handleOpenScene(scene.id)}
              className="group relative rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden p-5 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition shadow-lg"
            >
              <div className="space-y-1.5 min-w-0 pr-4">
                <div className="flex flex-wrap gap-1.5">
                  {scene.tags.map((tag) => (
                    <Badge key={tag} variant="gold">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-serif text-xl font-bold text-neutral-100 group-hover:text-amber-300 transition truncate">
                  {scene.name}
                </h3>
                <div className="text-xs font-semibold text-neutral-400">
                  {scCount} SC · {fxCount} FX
                </div>
              </div>

              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setEditingScene(scene)
                    setName(scene.name)
                    setDescription(scene.description || '')
                    setBgImage(scene.backgroundImage || '')
                    setTagsInput(scene.tags.join(', '))
                  }}
                  className="p-2 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition"
                  aria-label={`Edit ${scene.name}`}
                >
                  <Edit2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => duplicateScene(scene.id)}
                  className="p-2 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition"
                  aria-label={`Duplicate ${scene.name}`}
                >
                  <Copy className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setDeletingScene(scene)}
                  className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                  aria-label={`Delete ${scene.name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        })}

        {/* New Scene Card */}
        <button
          onClick={() => {
            setName('')
            setDescription('')
            setBgImage('')
            setIsCreateOpen(true)
          }}
          className="w-full rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-neutral-900/40 hover:bg-neutral-900/80 p-5 flex items-center justify-center space-x-2 text-amber-400 font-bold transition group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>New Scene</span>
        </button>
      </div>

      {/* Create Dialog */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Scene">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Location / Scene Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dragon's Lair"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the place..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
            >
              Create
            </button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        isOpen={Boolean(editingScene)}
        onClose={() => setEditingScene(null)}
        title="Edit Scene"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Scene Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="COMBAT, TAVERN, FOREST"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingScene(null)}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        isOpen={Boolean(deletingScene)}
        onClose={() => setDeletingScene(null)}
        onConfirm={() => {
          if (deletingScene) {
            softDeleteScene(deletingScene.id)
            setDeletingScene(null)
          }
        }}
        title="Delete Scene"
        description={
          deletingScene &&
          sessionScenes.some((ss) => ss.sceneId === deletingScene.id)
            ? `This scene is linked to sessions. It will be unlinked and moved to Trash.`
            : `Are you sure you want to delete this scene? It will be moved to Trash for 7 days.`
        }
        confirmText="Delete to Trash"
      />
    </div>
  )
}
