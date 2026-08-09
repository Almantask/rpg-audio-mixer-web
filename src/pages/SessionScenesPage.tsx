import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Download, Edit2, Copy, Trash2, Search } from 'lucide-react'
import { getData, setData } from '../services/store'
import type { Scene } from '../types'

export const SessionScenesPage: React.FC = () => {
  const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>()
  const navigate = useNavigate()
  const [storeData, setStoreData] = useState(getData())

  useEffect(() => {
    const handleUpdate = () => setStoreData(getData())
    window.addEventListener('arcanum_store_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_store_updated', handleUpdate)
  }, [])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importSearch, setImportSearch] = useState('')
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [sceneToUnlink, setSceneToUnlink] = useState<Scene | null>(null)

  // Form state
  const [sceneName, setSceneName] = useState('')
  const [sceneDesc, setSceneDesc] = useState('')
  const [validationError, setValidationError] = useState('')

  const campaign = storeData.campaigns.find((c) => c.id === campaignId)
  const session = storeData.sessions.find((s) => s.id === sessionId)

  const linkedLinks = storeData.sessionSceneLinks.filter((l) => l.sessionId === sessionId)
  const linkedSceneIds = new Set(linkedLinks.map((l) => l.sceneId))

  const linkedScenes = storeData.scenes.filter((s) => linkedSceneIds.has(s.id) && !s.deletedAt)

  const lastPlayedSceneId = storeData.lastPlayedSceneIdBySession[sessionId || '']

  // Sort: Last Played first, then normal order
  const sortedScenes = [...linkedScenes].sort((a, b) => {
    if (a.id === lastPlayedSceneId) return -1
    if (b.id === lastPlayedSceneId) return 1
    return 0
  })

  if (!campaign || !session) {
    return <div className="text-zinc-400">Session not found</div>
  }

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
    const newLink = { sessionId: session.id, sceneId: newScene.id }
    const updated = setData({
      scenes: [...storeData.scenes, newScene],
      sessionSceneLinks: [...storeData.sessionSceneLinks, newLink],
    })
    setStoreData(updated)
    setShowCreateModal(false)
    setSceneName('')
    setSceneDesc('')
  }

  const handleImportScene = (sceneId: string) => {
    const newLink = { sessionId: session.id, sceneId }
    const updated = setData({
      sessionSceneLinks: [...storeData.sessionSceneLinks, newLink],
    })
    setStoreData(updated)
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
    const newLink = { sessionId: session.id, sceneId: duplicate.id }
    const updated = setData({
      scenes: [...storeData.scenes, duplicate],
      sessionSceneLinks: [...storeData.sessionSceneLinks, newLink],
    })
    setStoreData(updated)
  }

  const handleConfirmUnlink = () => {
    if (!sceneToUnlink) return
    const updatedLinks = storeData.sessionSceneLinks.filter(
      (l) => !(l.sessionId === session.id && l.sceneId === sceneToUnlink.id),
    )
    const updated = setData({ sessionSceneLinks: updatedLinks })
    setStoreData(updated)
    setSceneToUnlink(null)
  }

  const handleOpenEdit = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingScene(scene)
    setSceneName(scene.name)
    setSceneDesc(scene.description || '')
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScene) return
    if (!sceneName.trim()) {
      setValidationError('Scene name is required')
      return
    }
    const updatedScenes = storeData.scenes.map((s) =>
      s.id === editingScene.id
        ? {
            ...s,
            name: sceneName.trim(),
            description: sceneDesc.trim() || undefined,
          }
        : s,
    )
    const updated = setData({ scenes: updatedScenes })
    setStoreData(updated)
    setEditingScene(null)
  }

  const unlinkedGlobalScenes = storeData.scenes
    .filter((s) => !s.deletedAt && !linkedSceneIds.has(s.id))
    .filter((s) => {
      const q = importSearch.toLowerCase().trim()
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) || s.tags?.some((t) => t.toLowerCase().includes(q))
      )
    })

  return (
    <div className="space-y-6">
      {/* Uppercase Breadcrumbs */}
      <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold space-x-2">
        <Link to="/campaigns" className="hover:text-zinc-300">
          CAMPAIGN
        </Link>
        <span>&gt;</span>
        <Link to={`/campaigns/${campaign.id}/sessions`} className="hover:text-zinc-300">
          {campaign.name}
        </Link>
        <span>&gt;</span>
        <span className="text-amber-400">SESSION {session.sessionNumber}</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-400">
          Session {session.sessionNumber} – {session.name}
        </h1>
        {session.description ? (
          <p className="text-zinc-400 text-sm mt-1">{session.description}</p>
        ) : (
          <p className="text-zinc-500 text-xs mt-1 uppercase font-semibold">Session Scenes</p>
        )}
      </div>

      {/* Session Scenes List */}
      {sortedScenes.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-zinc-500 font-serif text-lg">No scenes in this session</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setSceneName('')
                setSceneDesc('')
                setValidationError('')
                setShowCreateModal(true)
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Scene
            </button>
            <button
              onClick={() => {
                setImportSearch('')
                setShowImportModal(true)
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-semibold rounded text-sm transition-colors border border-amber-500/40 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Import Scene
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedScenes.map((scene) => {
            const isLastActive = lastPlayedSceneId === scene.id
            const fxCount = storeData.soundboardTiles.filter((t) => t.sceneId === scene.id).length

            return (
              <div
                key={scene.id}
                onClick={() => navigate(`/scenes/${scene.id}`)}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 cursor-pointer flex justify-between items-center gap-4 transition-colors relative"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isLastActive && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-semibold uppercase animate-pulse">
                        Last Active
                      </span>
                    )}
                    <h3 className="font-serif text-lg text-amber-400 font-semibold">{scene.name}</h3>
                  </div>
                  {scene.description && (
                    <p className="text-xs text-zinc-400 line-clamp-1">{scene.description}</p>
                  )}
                  <div className="text-xs text-zinc-500">0 SC · {fxCount} FX</div>
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
                    onClick={(e) => {
                      e.stopPropagation()
                      setSceneToUnlink(scene)
                    }}
                    aria-label={`Unlink ${scene.name}`}
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

      {/* Bottom CTAs: New Scene (left) + Import Scene (right) */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setSceneName('')
            setSceneDesc('')
            setValidationError('')
            setShowCreateModal(true)
          }}
          className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-lg p-4 flex items-center justify-center gap-2 text-amber-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-sm">New Scene</span>
        </button>

        <button
          onClick={() => {
            setImportSearch('')
            setShowImportModal(true)
          }}
          className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg p-4 flex items-center justify-center gap-2 text-zinc-300 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium text-sm">Import Scene</span>
        </button>
      </div>

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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">Import Scene</h2>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={importSearch}
                onChange={(e) => setImportSearch(e.target.value)}
                placeholder="Search global scenes…"
                className="w-full bg-zinc-800 border border-zinc-700 rounded pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {unlinkedGlobalScenes.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">
                  {storeData.scenes.filter((s) => !s.deletedAt).length === linkedScenes.length ? (
                    <span>All scenes are already in this session</span>
                  ) : (
                    <span>No matching scenes</span>
                  )}
                </div>
              ) : (
                unlinkedGlobalScenes.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-3 bg-zinc-800/60 border border-zinc-700/50 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="text-sm font-semibold text-amber-400">{sc.name}</div>
                      {sc.description && (
                        <div className="text-xs text-zinc-400 line-clamp-1">{sc.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleImportScene(sc.id)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded"
                    >
                      Import
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Close
              </button>
            </div>
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

      {/* Unlink Confirmation Dialog */}
      {sceneToUnlink && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-serif font-semibold text-amber-400">Unlink Scene</h3>
            <p className="text-sm text-zinc-300">
              Unlink "{sceneToUnlink.name}" from this session? It will remain available in global Scenes.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSceneToUnlink(null)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnlink}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded"
              >
                Unlink
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
