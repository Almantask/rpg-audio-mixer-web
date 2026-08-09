import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Copy, Trash2 } from 'lucide-react'
import { getData, setData } from '../services/store'
import type { Scene } from '../types'

export const GlobalScenesPage: React.FC = () => {
  const navigate = useNavigate()
  const [storeData, setStoreData] = useState(getData())

  useEffect(() => {
    const handleUpdate = () => setStoreData(getData())
    window.addEventListener('arcanum_store_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_store_updated', handleUpdate)
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [sceneToDelete, setSceneToDelete] = useState<Scene | null>(null)

  // Form state
  const [sceneName, setSceneName] = useState('')
  const [sceneDesc, setSceneDesc] = useState('')
  const [sceneTagsStr, setSceneTagsStr] = useState('')
  const [validationError, setValidationError] = useState('')

  const activeScenes = storeData.scenes.filter((s) => !s.deletedAt)

  const filteredScenes = activeScenes.filter((s) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const matchName = s.name.toLowerCase().includes(q)
    const matchTag = s.tags?.some((t) => t.toLowerCase().includes(q))
    return matchName || matchTag
  })

  const handleCreateScene = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sceneName.trim()) {
      setValidationError('Scene name is required')
      return
    }
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      name: sceneName.trim(),
      description: sceneDesc.trim() || undefined,
      tags: [],
      createdAt: new Date().toISOString(),
    }
    const updated = setData({ scenes: [...storeData.scenes, newScene] })
    setStoreData(updated)
    setShowCreateModal(false)
    setSceneName('')
    setSceneDesc('')
  }

  const handleDuplicateScene = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    const duplicate: Scene = {
      id: `scene-${Date.now()}`,
      name: `Copy of ${scene.name}`,
      description: scene.description,
      coverImage: scene.coverImage,
      tags: [...(scene.tags || [])],
      createdAt: new Date().toISOString(),
    }
    const updated = setData({ scenes: [...storeData.scenes, duplicate] })
    setStoreData(updated)
  }

  const handleOpenEdit = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingScene(scene)
    setSceneName(scene.name)
    setSceneDesc(scene.description || '')
    setSceneTagsStr((scene.tags || []).join(', '))
    setValidationError('')
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScene) return
    if (!sceneName.trim()) {
      setValidationError('Scene name is required')
      return
    }
    const tags = sceneTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const updatedScenes = storeData.scenes.map((s) =>
      s.id === editingScene.id
        ? {
            ...s,
            name: sceneName.trim(),
            description: sceneDesc.trim() || undefined,
            tags,
          }
        : s,
    )
    const updated = setData({ scenes: updatedScenes })
    setStoreData(updated)
    setEditingScene(null)
  }

  const handleDeleteSceneClick = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    const links = storeData.sessionSceneLinks.filter((l) => l.sceneId === scene.id)
    if (links.length > 0) {
      setSceneToDelete(scene)
    } else {
      const updatedScenes = storeData.scenes.map((s) =>
        s.id === scene.id ? { ...s, deletedAt: new Date().toISOString() } : s,
      )
      const updated = setData({ scenes: updatedScenes })
      setStoreData(updated)
    }
  }

  const handleConfirmDeleteLinked = () => {
    if (!sceneToDelete) return
    const updatedScenes = storeData.scenes.map((s) =>
      s.id === sceneToDelete.id ? { ...s, deletedAt: new Date().toISOString() } : s,
    )
    const updatedLinks = storeData.sessionSceneLinks.filter((l) => l.sceneId !== sceneToDelete.id)
    const updated = setData({ scenes: updatedScenes, sessionSceneLinks: updatedLinks })
    setStoreData(updated)
    setSceneToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-400">Scenes</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Curate and manage your immersive environments.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-zinc-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search scenes by name or tag…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Scenes List */}
      {filteredScenes.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          {searchQuery ? (
            <p className="text-zinc-500 font-serif">No scenes match</p>
          ) : (
            <div className="space-y-2">
              <p className="text-zinc-500 font-serif text-lg">No scenes created yet</p>
              <p className="text-xs text-zinc-600">Create your first environment below.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScenes.map((scene) => {
            const scCount = 0
            const fxCount = storeData.soundboardTiles.filter((t) => t.sceneId === scene.id).length

            return (
              <div
                key={scene.id}
                onClick={() => navigate(`/scenes/${scene.id}`)}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 cursor-pointer flex justify-between items-center gap-4 transition-colors relative overflow-hidden"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg text-amber-400 font-semibold">{scene.name}</h3>
                    {scene.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-zinc-800 text-amber-400/80 px-2 py-0.5 rounded border border-zinc-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  {scene.description && (
                    <p className="text-xs text-zinc-400 line-clamp-1">{scene.description}</p>
                  )}
                  <div className="text-xs text-zinc-500">
                    {scCount} SC · {fxCount} FX
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEdit(scene, e)}
                    aria-label={`Edit ${scene.name}`}
                    className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDuplicateScene(scene, e)}
                    aria-label={`Duplicate ${scene.name}`}
                    className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteSceneClick(scene, e)}
                    aria-label={`Delete ${scene.name}`}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Scene CTA Row */}
      <button
        onClick={() => {
          setSceneName('')
          setSceneDesc('')
          setValidationError('')
          setShowCreateModal(true)
        }}
        className="w-full border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-lg p-4 flex items-center justify-center gap-2 text-amber-400 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium text-sm">New Scene</span>
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">New Scene</h2>
            <form onSubmit={handleCreateScene} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Scene name *</label>
                <input
                  type="text"
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  placeholder="Tavern"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">{validationError}</span>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Scene description</label>
                <textarea
                  value={sceneDesc}
                  onChange={(e) => setSceneDesc(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingScene && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">Edit Scene</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Scene name *</label>
                <input
                  type="text"
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">{validationError}</span>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  value={sceneDesc}
                  onChange={(e) => setSceneDesc(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={sceneTagsStr}
                  onChange={(e) => setSceneTagsStr(e.target.value)}
                  placeholder="Combat, Tavern"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
                {sceneTagsStr && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sceneTagsStr.split(',').map((t) => {
                      const tag = t.trim()
                      if (!tag) return null
                      return (
                        <span key={tag} className="text-xs bg-zinc-800 text-amber-400 border border-zinc-700 px-2 py-0.5 rounded flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            aria-label={`Remove ${tag} tag`}
                            onClick={() => {
                              const newTags = sceneTagsStr.split(',').map(x => x.trim()).filter(x => x && x !== tag)
                              setSceneTagsStr(newTags.join(', '))
                            }}
                            className="text-zinc-400 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingScene(null)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Linked Scene Warning Modal */}
      {sceneToDelete && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-serif font-semibold text-amber-400">Delete Scene</h3>
            <p className="text-sm text-zinc-300">
              This scene is linked to{' '}
              {
                storeData.sessionSceneLinks.filter((l) => l.sceneId === sceneToDelete.id)
                  .length
              }{' '}
              sessions. It will be unlinked from those sessions and moved to Trash.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSceneToDelete(null)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteLinked}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
