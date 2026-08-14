import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit2, Copy, Trash2, Layers, AlertTriangle } from 'lucide-react'
import { db } from '../storage/db'
import type { Scene } from '../types'
import { CreateSceneModal } from '../components/scenes/CreateSceneModal'
import { EditSceneModal } from '../components/scenes/EditSceneModal'

export const ScenesPage: React.FC = () => {
  const navigate = useNavigate()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [deletingScene, setDeletingScene] = useState<{ scene: Scene; linkCount: number } | null>(null)
  const [undoScene, setUndoScene] = useState<Scene | null>(null)

  const reloadScenes = () => {
    setScenes([...db.getScenes()])
  }

  useEffect(() => {
    reloadScenes()
    const handleUpdate = () => reloadScenes()
    window.addEventListener('arcanum_db_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_db_updated', handleUpdate)
  }, [])

  const handleCreate = (name: string, description?: string, coverUrl?: string) => {
    db.createScene(name, description, coverUrl)
    reloadScenes()
  }

  const handleEdit = (id: string, updates: Partial<Scene>) => {
    db.updateScene(id, updates)
    reloadScenes()
  }

  const handleDuplicate = (scene: Scene) => {
    db.createScene(`${scene.name} (Copy)`, scene.description, scene.coverUrl)
    reloadScenes()
  }

  const handleDeleteRequest = (scene: Scene) => {
    // Check how many sessions link this scene
    const sessions = db.getState().sessions
    const linkedSessions = sessions.filter((s) => s.sceneIds.includes(scene.id))
    if (linkedSessions.length > 0) {
      setDeletingScene({ scene, linkCount: linkedSessions.length })
    } else {
      // Unlinked -> soft delete immediately
      db.deleteScene(scene.id)
      setUndoScene(scene)
      reloadScenes()
    }
  }

  const handleConfirmDelete = () => {
    if (deletingScene) {
      db.deleteScene(deletingScene.scene.id)
      setDeletingScene(null)
      reloadScenes()
    }
  }

  const handleUndo = () => {
    if (undoScene) {
      db.restoreScene(undoScene.id)
      setUndoScene(null)
      reloadScenes()
    }
  }

  // Filter scenes
  const filteredScenes = scenes.filter((scene) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const matchName = scene.name.toLowerCase().includes(q)
    const matchTag = scene.tags.some((t) => t.toLowerCase().includes(q))
    return matchName || matchTag
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-100">Scenes</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Browse and manage your audio atmosphere scenes
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scenes by name or tag…"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Undo Toast */}
      {undoScene && (
        <div className="bg-amber-900/40 border border-amber-500/50 rounded-lg p-3 flex items-center justify-between text-amber-200 text-sm">
          <span>Scene "{undoScene.name}" moved to Trash.</span>
          <button
            onClick={handleUndo}
            className="underline font-semibold hover:text-amber-100"
          >
            Undo
          </button>
        </div>
      )}

      {/* Main Grid */}
      {scenes.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-200">No scenes yet</h2>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Scene
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredScenes.length === 0 && searchQuery && (
            <div className="text-neutral-400 py-4 text-center font-medium">
              No scenes match
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenes.map((scene) => {
              const scCount = scene.soundscapeCategories?.length || 0
              const fxCount = scene.effectIds?.length || 0

              return (
                <div
                  key={scene.id}
                  onClick={() => navigate(`/scenes/${scene.id}`)}
                  className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition-all cursor-pointer group"
                  data-scene-card={scene.name}
                >
                  <div>
                    {scene.coverUrl && (
                      <div className="h-32 bg-neutral-800 overflow-hidden">
                        <img
                          src={scene.coverUrl}
                          alt={scene.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                          {scene.name}
                        </h3>
                        <span className="text-xs font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                          {scCount} SC · {fxCount} FX
                        </span>
                      </div>

                      {scene.description && (
                        <p className="text-sm text-neutral-400 line-clamp-2">
                          {scene.description}
                        </p>
                      )}

                      {/* Tag Chips */}
                      {scene.tags && scene.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {scene.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded"
                              data-tag-chip={tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scene Card Actions */}
                  <div
                    className="p-4 border-t border-neutral-800/80 flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setEditingScene(scene)}
                      aria-label={`Edit ${scene.name}`}
                      className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(scene)}
                      aria-label={`Duplicate ${scene.name}`}
                      className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Copy className="w-4 h-4" /> Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(scene)}
                      aria-label={`Delete ${scene.name}`}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Trash
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* New Scene Row below scene cards */}
          <div className="pt-4 border-t border-neutral-800/80">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full bg-neutral-900/60 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl p-4 flex items-center justify-center gap-2 text-neutral-400 hover:text-amber-400 font-bold transition-colors"
            >
              <Plus className="w-5 h-5" /> New Scene
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateSceneModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleCreate}
      />

      <EditSceneModal
        isOpen={!!editingScene}
        scene={editingScene}
        onClose={() => setEditingScene(null)}
        onConfirm={handleEdit}
      />

      {/* Linked Scene Delete Warning Dialog */}
      {deletingScene && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-neutral-100">Delete Linked Scene?</h3>
            </div>
            <p className="text-sm text-neutral-300">
              "{deletingScene.scene.name}" is linked to {deletingScene.linkCount} session(s) and will be unlinked and moved to Trash.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingScene(null)}
                className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
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
