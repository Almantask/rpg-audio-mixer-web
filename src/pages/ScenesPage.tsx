import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getActiveScenes,
  createScene,
  duplicateScene,
  updateScene,
  softDeleteScene,
} from '../services/sceneService'
import type { Scene } from '../types/scene'
import { Search, Plus, Edit2, Copy, Trash2, X } from 'lucide-react'

export const ScenesPage: React.FC = () => {
  const navigate = useNavigate()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null)

  // Form states
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')
  const [bgInput, setBgInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const refreshList = () => {
    setScenes(getActiveScenes())
  }

  useEffect(() => {
    refreshList()
  }, [])

  const filteredScenes = scenes.filter((sc) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    if (sc.name.toLowerCase().includes(q)) return true
    if (sc.tags && sc.tags.some((t) => t.toLowerCase().includes(q))) return true
    return false
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim()) {
      setErrorMsg('Scene name is required')
      return
    }
    createScene({
      name: nameInput,
      description: descInput,
      backgroundUrl: bgInput,
    })
    resetForm()
    setIsCreateOpen(false)
    refreshList()
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScene || !nameInput.trim()) {
      setErrorMsg('Scene name is required')
      return
    }
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0)

    updateScene(editingScene.id, {
      name: nameInput,
      description: descInput,
      backgroundUrl: bgInput,
      tags: tagsArray,
    })
    resetForm()
    setIsEditOpen(false)
    setEditingScene(null)
    refreshList()
  }

  const handleDuplicate = (sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateScene(sceneId)
    refreshList()
  }

  const confirmDelete = () => {
    if (deletingScene) {
      softDeleteScene(deletingScene.id)
      setDeletingScene(null)
      refreshList()
    }
  }

  const openEditModal = (sc: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingScene(sc)
    setNameInput(sc.name)
    setDescInput(sc.description || '')
    setBgInput(sc.backgroundUrl || '')
    setTagsInput(sc.tags ? sc.tags.join(', ') : '')
    setIsEditOpen(true)
  }

  const openDeleteModal = (sc: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingScene(sc)
  }

  const resetForm = () => {
    setNameInput('')
    setDescInput('')
    setBgInput('')
    setTagsInput('')
    setErrorMsg('')
  }

  const handleRowClick = (scene: Scene) => {
    navigate(`/scenes/${scene.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">Scenes</h1>
        <p className="text-stone-400 text-sm mt-1">Curate and manage your immersive environments.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-stone-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search scenes…"
          className="w-full bg-[#121212] border border-amber-900/30 rounded-xl pl-10 pr-4 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-stone-500"
        />
      </div>

      {/* Scene Rows */}
      <div className="space-y-3">
        {filteredScenes.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-sm bg-stone-900/30 rounded-xl border border-dashed border-stone-800">
            {searchQuery ? 'No scenes match your search.' : 'No scenes created yet.'}
          </div>
        ) : (
          filteredScenes.map((sc) => {
            const soundscapeCount = sc.soundscapeCategories?.length || 0
            const fxCount = sc.soundboardEffects?.length || 0

            return (
              <div
                key={sc.id}
                onClick={() => handleRowClick(sc)}
                className="relative rounded-xl border border-amber-900/30 overflow-hidden bg-stone-900 p-4 cursor-pointer hover:border-amber-600/50 transition-all flex items-center justify-between gap-4 group"
              >
                {/* Background Image / Overlay */}
                {sc.backgroundUrl && (
                  <img
                    src={sc.backgroundUrl}
                    alt={sc.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/90 to-transparent z-0" />

                {/* Content */}
                <div className="relative z-10 space-y-1">
                  {sc.tags && sc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {sc.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="font-serif text-xl font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                    {sc.name}
                  </h2>

                  <div className="text-xs text-stone-400 font-sans font-medium flex items-center gap-2">
                    <span>{soundscapeCount} SC</span>
                    <span>·</span>
                    <span>{fxCount} FX</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative z-10 flex items-center gap-1 bg-[#121212]/80 backdrop-blur border border-stone-800 rounded-lg p-1">
                  <button
                    type="button"
                    aria-label={`Edit scene ${sc.name}`}
                    onClick={(e) => openEditModal(sc, e)}
                    className="p-2 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Duplicate scene ${sc.name}`}
                    onClick={(e) => handleDuplicate(sc.id, e)}
                    className="p-2 rounded hover:bg-stone-800 text-stone-400 hover:text-amber-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete scene ${sc.name}`}
                    onClick={(e) => openDeleteModal(sc, e)}
                    className="p-2 rounded hover:bg-stone-800 text-stone-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* New Scene CTA Button */}
        <button
          type="button"
          onClick={() => {
            resetForm()
            setIsCreateOpen(true)
          }}
          className="w-full py-4 border-2 border-dashed border-amber-900/40 hover:border-amber-600/60 rounded-xl bg-stone-900/20 hover:bg-stone-900/40 text-amber-400 flex items-center justify-center gap-2 font-medium text-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Scene</span>
        </button>
      </div>

      {/* Create Scene Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="create-scene-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 id="create-scene-title" className="font-serif text-xl font-bold text-amber-400">New Scene</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {errorMsg && <div className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-2 rounded">{errorMsg}</div>}

              <div>
                <label htmlFor="scene-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Scene Name (Location) *
                </label>
                <input
                  id="scene-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Dragon's Lair"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="scene-desc" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  id="scene-desc"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Optional scene notes..."
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="scene-bg" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Background Image URL
                </label>
                <input
                  id="scene-bg"
                  type="text"
                  value={bgInput}
                  onChange={(e) => setBgInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm">
                  Create Scene
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Scene Dialog */}
      {isEditOpen && editingScene && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="edit-scene-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 id="edit-scene-title" className="font-serif text-xl font-bold text-amber-400">Edit Scene</h2>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {errorMsg && <div className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-2 rounded">{errorMsg}</div>}

              <div>
                <label htmlFor="edit-scene-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Scene Name *
                </label>
                <input
                  id="edit-scene-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="edit-scene-tags" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  id="edit-scene-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. COMBAT, TAVERN, DUNGEON"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="edit-scene-desc" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-scene-desc"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="edit-scene-bg" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Background Image URL
                </label>
                <input
                  id="edit-scene-bg"
                  type="text"
                  value={bgInput}
                  onChange={(e) => setBgInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete AlertDialog */}
      {deletingScene && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="alertdialog" aria-labelledby="delete-scene-title" aria-describedby="delete-scene-desc" className="bg-[#141414] border border-amber-900/50 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 id="delete-scene-title" className="font-serif text-xl font-bold text-amber-400">
              Delete Scene?
            </h2>
            <p id="delete-scene-desc" className="text-stone-300 text-sm">
              {deletingScene.sessionIds && deletingScene.sessionIds.length > 0 ? (
                <>This scene is linked to {deletingScene.sessionIds.length} session(s). It will be unlinked from those sessions and moved to Trash.</>
              ) : (
                <>Are you sure you want to move <strong>{deletingScene.name}</strong> to Trash?</>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingScene(null)}
                className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm"
              >
                Delete Scene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
