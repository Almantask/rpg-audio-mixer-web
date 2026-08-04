import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit2, Copy, Trash2, Image as ImageIcon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Dialog, AlertDialog } from '../components/common/Dialog'
import type { Scene } from '../types'

export const ScenesCatalogPage: React.FC = () => {
  const navigate = useNavigate()
  const { scenes, sessions, createScene, updateScene, duplicateScene, softDeleteScene } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const filteredScenes = scenes.filter((sc) => {
    if (!searchTerm.trim()) return true
    return sc.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createScene(name.trim(), description.trim() || undefined)
    setName('')
    setDescription('')
    setIsCreateOpen(false)
    // GM remains on Scenes list per PW-31
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScene || !name.trim()) return
    updateScene(editingScene.id, {
      name: name.trim(),
      description: description.trim() || undefined,
    })
    setEditingScene(null)
  }

  const handleDeleteClick = (sc: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingScene(sc)
  }

  const confirmDelete = () => {
    if (deletingScene) {
      softDeleteScene(deletingScene.id)
      setDeletingScene(null)
    }
  }

  // Count sessions linking this scene
  const linkedSessionCount = deletingScene
    ? sessions.filter((s) => s.sceneIds.includes(deletingScene.id)).length
    : 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-yellow-500">Scenes</h1>
        <p className="text-sm text-gray-400 mt-1">Curate and manage your immersive environments.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search scenes…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#161616] border border-yellow-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
        />
      </div>

      {/* Scene Rows */}
      <div className="space-y-4">
        {filteredScenes.length === 0 ? (
          <div className="text-center py-12 bg-[#141414] rounded-xl border border-yellow-900/20 p-8 space-y-3">
            <ImageIcon size={48} className="mx-auto text-yellow-500/40" />
            <h3 className="font-serif text-xl font-bold text-gray-300">
              {searchTerm ? 'No scenes match your search' : 'No scenes available'}
            </h3>
          </div>
        ) : (
          filteredScenes.map((sc) => (
            <div
              key={sc.id}
              onClick={() => navigate(`/scenes/${sc.id}`)}
              className="relative rounded-xl border border-yellow-900/30 bg-gradient-to-r from-[#1C160C] via-[#161616] to-[#121212] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-yellow-500/60 transition-all group overflow-hidden"
            >
              <div className="space-y-2 z-10">
                <div className="flex flex-wrap gap-1.5">
                  {sc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="font-serif text-xl font-bold text-gray-100 group-hover:text-yellow-500 transition-colors">
                  {sc.name}
                </h3>
              </div>

              <div className="flex items-center gap-4 z-10 self-end sm:self-center">
                <span className="text-xs font-semibold text-gray-400 bg-black/40 px-3 py-1.5 rounded-lg border border-yellow-900/20">
                  {sc.soundscapeCategories.length} SC · {sc.soundboardTiles.length} FX
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingScene(sc)
                      setName(sc.name)
                      setDescription(sc.description || '')
                    }}
                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-white/5 rounded-lg transition-colors"
                    title="Edit Scene"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateScene(sc.id)
                    }}
                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-white/5 rounded-lg transition-colors"
                    title="Duplicate Scene (One Tap)"
                  >
                    <Copy size={18} />
                  </button>

                  <button
                    onClick={(e) => handleDeleteClick(sc, e)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Delete Scene"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* New Scene CTA Card */}
        <button
          onClick={() => {
            setName('')
            setDescription('')
            setIsCreateOpen(true)
          }}
          className="w-full p-6 border-2 border-dashed border-yellow-900/40 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/60 transition-all flex items-center justify-center gap-3 text-yellow-500 font-serif font-bold text-lg"
        >
          <Plus size={24} />
          <span>New Scene</span>
        </button>
      </div>

      {/* Create Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Scene"
        subtitle="Create a new global audio environment."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Scene Name (Location) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dragon's Lair"
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Atmospheric cues and notes..."
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-yellow-900/20">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
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
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Scene Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-yellow-900/20">
            <button
              type="button"
              onClick={() => setEditingScene(null)}
              className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={Boolean(deletingScene)}
        onClose={() => setDeletingScene(null)}
        onConfirm={confirmDelete}
        title="Delete Scene"
        description={
          linkedSessionCount > 0
            ? `This scene is linked to ${linkedSessionCount} session(s). It will be unlinked from those sessions and moved to Trash.`
            : `Are you sure you want to delete "${deletingScene?.name}"? It will be moved to Trash for 7 days.`
        }
      />
    </div>
  )
}
