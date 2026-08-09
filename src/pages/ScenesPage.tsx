import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Copy, Trash2, Image, Undo2 } from 'lucide-react'
import { getDb, saveDb, type Scene } from '../lib/storage/db'

export const ScenesPage: React.FC = () => {
  const navigate = useNavigate()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [deletingScene, setDeletingScene] = useState<{ scene: Scene; linkCount: number } | null>(null)
  const [undoScene, setUndoScene] = useState<Scene | null>(null)

  // Form states
  const [sceneName, setSceneName] = useState('')
  const [sceneDesc, setSceneDesc] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [formError, setFormError] = useState('')

  const loadData = () => {
    const db = getDb()
    const valid = db.scenes
      .filter((s) => !s.deletedAt)
      .sort((a, b) => new Date(b.lastPlayedAt || 0).getTime() - new Date(a.lastPlayedAt || 0).getTime())
    setScenes(valid)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredScenes = scenes.filter((scene) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const nameMatch = scene.name.toLowerCase().includes(q)
    const tagMatch = scene.tags?.some((t) => t.toLowerCase().includes(q))
    return nameMatch || tagMatch
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sceneName.trim()) {
      setFormError('Scene name is required')
      return
    }

    const db = getDb()
    const newScene: Scene = {
      id: `sc_${Date.now()}`,
      name: sceneName.trim(),
      description: sceneDesc.trim() || undefined,
      coverImage: coverImage || undefined,
      tags: [],
      soundscapesCount: 0,
      effectsCount: 0,
    }

    db.scenes.unshift(newScene)
    saveDb(db)
    setScenes(db.scenes.filter((s) => !s.deletedAt))

    setSceneName('')
    setSceneDesc('')
    setCoverImage('')
    setFormError('')
    setIsCreateOpen(false)
  }

  const handleDuplicate = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    const db = getDb()
    const clone: Scene = {
      ...scene,
      id: `sc_${Date.now()}`,
      name: `Copy of ${scene.name}`,
    }
    db.scenes.unshift(clone)
    saveDb(db)
    setScenes(db.scenes.filter((s) => !s.deletedAt))
  }

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScene || !sceneName.trim()) {
      setFormError('Scene name is required')
      return
    }

    const db = getDb()
    const target = db.scenes.find((s) => s.id === editingScene.id)
    if (target) {
      target.name = sceneName.trim()
      target.description = sceneDesc.trim() || undefined
      target.coverImage = coverImage || undefined
      if (tagsInput.trim()) {
        target.tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      } else {
        target.tags = []
      }
      saveDb(db)
      loadData()
    }

    setEditingScene(null)
    setFormError('')
  }

  const initiateDelete = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    const db = getDb()
    const linkedLinks = db.sessionScenes.filter((link) => link.sceneId === scene.id)
    if (linkedLinks.length > 0) {
      setDeletingScene({ scene, linkCount: linkedLinks.length })
    } else {
      executeSoftDelete(scene)
    }
  }

  const executeSoftDelete = (scene: Scene) => {
    const db = getDb()
    const target = db.scenes.find((s) => s.id === scene.id)
    if (target) {
      target.deletedAt = new Date().toISOString()
      // Remove session links
      db.sessionScenes = db.sessionScenes.filter((l) => l.sceneId !== scene.id)
      saveDb(db)
      setScenes(db.scenes.filter((s) => !s.deletedAt))
      setUndoScene(scene)
    }
  }

  const handleUndo = () => {
    if (!undoScene) return
    const db = getDb()
    const target = db.scenes.find((s) => s.id === undoScene.id)
    if (target) {
      delete target.deletedAt
      saveDb(db)
      setScenes(db.scenes.filter((s) => !s.deletedAt))
      setUndoScene(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-amber-400">Scenes</h1>
        <p className="text-sm text-neutral-400">Curate and manage your immersive environments.</p>
      </div>

      {undoScene && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-lg p-3 flex items-center justify-between text-sm text-amber-200">
          <span>Scene "{undoScene.name}" moved to Trash.</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 font-semibold text-amber-400 hover:text-amber-300"
          >
            <Undo2 className="w-4 h-4" /> Undo
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search scenes by name or tag…"
          className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Scenes List */}
      {scenes.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-[#121212] border border-neutral-800 rounded-xl p-10 text-center space-y-4">
            <Image className="w-12 h-12 text-amber-500/40 mx-auto" />
            <h2 className="text-lg font-serif font-semibold text-neutral-300">No scenes created</h2>
            <p className="text-sm text-neutral-400">Build your first custom sound scene environment.</p>
          </div>

          <button
            onClick={() => {
              setSceneName('')
              setSceneDesc('')
              setCoverImage('')
              setFormError('')
              setIsCreateOpen(true)
            }}
            data-testid="new-scene-button"
            className="w-full border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-5 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Scene</span>
          </button>
        </div>
      ) : filteredScenes.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-[#121212] border border-neutral-800 rounded-xl p-8 text-center text-sm text-neutral-400">
            No scenes match your search "{searchQuery}"
          </div>

          <button
            onClick={() => {
              setSceneName('')
              setSceneDesc('')
              setCoverImage('')
              setFormError('')
              setIsCreateOpen(true)
            }}
            data-testid="new-scene-button"
            className="w-full border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-5 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Scene</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScenes.map((scene) => (
            <div
              key={scene.id}
              data-testid={`scene-card-${scene.name}`}
              onClick={() => navigate(`/scenes/${scene.id}`)}
              className="bg-[#121212] border border-neutral-800 hover:border-amber-900/40 rounded-xl p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {scene.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="font-serif text-lg font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors">
                  {scene.name}
                </h3>

                {scene.description && (
                  <p className="text-xs text-neutral-400 line-clamp-1">{scene.description}</p>
                )}

                <p className="text-xs font-semibold text-neutral-500">
                  {scene.soundscapesCount ?? 0} SC · {scene.effectsCount ?? 0} FX
                </p>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setEditingScene(scene)
                    setSceneName(scene.name)
                    setSceneDesc(scene.description || '')
                    setCoverImage(scene.coverImage || '')
                    setTagsInput(scene.tags ? scene.tags.join(', ') : '')
                    setFormError('')
                  }}
                  aria-label={`Edit ${scene.name}`}
                  className="p-2 text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => handleDuplicate(scene, e)}
                  aria-label={`Duplicate ${scene.name}`}
                  className="p-2 text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => initiateDelete(scene, e)}
                  aria-label={`Delete ${scene.name}`}
                  className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* New Scene row at bottom */}
          <button
            onClick={() => {
              setSceneName('')
              setSceneDesc('')
              setCoverImage('')
              setFormError('')
              setIsCreateOpen(true)
            }}
            data-testid="new-scene-button"
            className="w-full border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-5 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Scene</span>
          </button>
        </div>
      )}

      {/* Create Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-md w-full space-y-5">
            <h2 className="font-serif text-xl font-bold text-amber-400">New Scene</h2>

            {formError && (
              <p className="text-xs text-red-400 font-medium bg-red-950/50 border border-red-800 p-2 rounded">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Scene Name *
                </label>
                <input
                  type="text"
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  placeholder="Location name (e.g. Dragon's Lair)"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  value={sceneDesc}
                  onChange={(e) => setSceneDesc(e.target.value)}
                  placeholder="Optional place description..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingScene && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-md w-full space-y-5">
            <h2 className="font-serif text-xl font-bold text-amber-400">Edit Scene</h2>

            {formError && (
              <p className="text-xs text-red-400 font-medium bg-red-950/50 border border-red-800 p-2 rounded">
                {formError}
              </p>
            )}

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Scene Name *
                </label>
                <input
                  type="text"
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  value={sceneDesc}
                  onChange={(e) => setSceneDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Combat, Tavern, Forest"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingScene(null)}
                  className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Linked Scene Warning Dialog */}
      {deletingScene && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-serif text-lg font-bold text-amber-400">Linked Scene Warning</h3>
            <p className="text-sm text-neutral-300">
              This scene is linked to {deletingScene.linkCount} sessions. It will be unlinked from those sessions and moved to Trash.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingScene(null)}
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeSoftDelete(deletingScene.scene)
                  setDeletingScene(null)
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
