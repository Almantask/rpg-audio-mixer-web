import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Download, Edit2, Unlink, Search, Layers, ChevronRight } from 'lucide-react'
import { db } from '../storage/db'
import type { Campaign, Session, Scene } from '../types'
import { CreateSceneModal } from '../components/scenes/CreateSceneModal'
import { EditSceneModal } from '../components/scenes/EditSceneModal'

export const SessionScenesPage: React.FC = () => {
  const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importSearch, setImportSearch] = useState('')
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [unlinkingScene, setUnlinkingScene] = useState<Scene | null>(null)

  const reloadData = () => {
    if (!campaignId || !sessionId) return
    const camp = db.getCampaignById(campaignId)
    const sess = db.getSessionById(sessionId)
    setCampaign(camp || null)
    setSession(sess || null)

    if (sess) {
      const allScenes = db.getScenes()
      const sessSceneIds = Array.isArray(sess.sceneIds) ? sess.sceneIds : []
      const linked = allScenes.filter((sc) => sessSceneIds.includes(sc.id))
      const lastActiveId = (db.getState().lastActiveSceneIdBySession || {})[sess.id]
      // Sort with lastActiveId pinned first, then by lastPlayedAt recency
      const sorted = [...linked].sort((a, b) => {
        if (a.id === lastActiveId) return -1
        if (b.id === lastActiveId) return 1
        const timeA = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0
        const timeB = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0
        return timeB - timeA
      })
      setScenes(sorted)
    }
  }

  useEffect(() => {
    reloadData()
    const handleUpdate = () => reloadData()
    window.addEventListener('arcanum_db_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_db_updated', handleUpdate)
  }, [campaignId, sessionId])

  if (!campaign || !session) {
    return <div className="text-center py-12 text-neutral-400">Session not found.</div>
  }

  const handleCreateScene = (name: string, description?: string, coverUrl?: string) => {
    const newScene = db.createScene(name, description, coverUrl)
    db.linkSceneToSession(session.id, newScene.id)
    reloadData()
  }

  const handleImportScene = (sceneId: string) => {
    db.linkSceneToSession(session.id, sceneId)
    reloadData()
  }

  const handleEditScene = (id: string, updates: Partial<Scene>) => {
    db.updateScene(id, updates)
    reloadData()
  }

  const handleUnlinkConfirm = () => {
    if (unlinkingScene) {
      db.unlinkSceneFromSession(session.id, unlinkingScene.id)
      setUnlinkingScene(null)
      reloadData()
    }
  }

  const handleOpenScene = (scene: Scene) => {
    db.setLastActiveScene(session.id, scene.id)
    navigate(`/campaigns/${campaign.id}/sessions/${session.id}/scenes/${scene.id}`)
  }

  // Available scenes for import
  const allGlobalScenes = db.getScenes()
  const sessSceneIds = Array.isArray(session.sceneIds) ? session.sceneIds : []
  const unlinkedGlobalScenes = allGlobalScenes.filter(
    (sc) => !sessSceneIds.includes(sc.id)
  )

  const filteredImportScenes = unlinkedGlobalScenes.filter((sc) => {
    if (!importSearch.trim()) return true
    const q = importSearch.toLowerCase()
    const matchName = sc.name.toLowerCase().includes(q)
    const matchTag = (sc.tags || []).some((t) => t.toLowerCase().includes(q))
    return matchName || matchTag
  })

  const lastActiveSceneId = (db.getState().lastActiveSceneIdBySession || {})[session.id]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-neutral-400">
        <Link
          to={`/campaigns/${campaign.id}`}
          className="hover:text-amber-400 uppercase font-bold tracking-wider"
        >
          {campaign.name}
        </Link>
        <ChevronRight className="w-4 h-4 text-neutral-600" />
        <span
          onClick={() => reloadData()}
          className="text-neutral-200 uppercase font-bold tracking-wider cursor-pointer hover:text-amber-400"
        >
          {session.number.toLowerCase().startsWith('session') ? session.number : `Session ${session.number}`}
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-100">
          {session.number.toLowerCase().startsWith('session') ? session.number : `Session ${session.number}`} – {session.name}
        </h1>
        {session.description && (
          <p className="text-neutral-400 text-sm mt-1">{session.description}</p>
        )}
      </div>

      {/* Session Scenes Grid */}
      {scenes.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-200">No scenes in this session</h2>
          <p className="text-neutral-400 text-sm max-w-sm mx-auto">
            Create a new scene or import existing scenes from your global catalogue.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-5 py-2.5 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> New Scene
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="border border-neutral-700 hover:bg-neutral-800 text-neutral-200 font-bold px-5 py-2.5 rounded-lg inline-flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> Import Scene
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene) => {
              const isLastActive = scene.id === lastActiveSceneId
              const scCount = scene.soundscapeCategories?.length || 0
              const fxCount = scene.effectIds?.length || 0

              return (
                <div
                  key={scene.id}
                  onClick={() => handleOpenScene(scene)}
                  className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition-all cursor-pointer group"
                  data-session-scene-card={scene.name}
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                          {scene.name}
                        </h3>
                        {isLastActive && (
                          <span className="text-xs font-bold bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full">
                            Last Active
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                        {scCount} SC · {fxCount} FX
                      </span>
                    </div>

                    {scene.description && (
                      <p className="text-sm text-neutral-400 line-clamp-2">
                        {scene.description}
                      </p>
                    )}
                  </div>

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
                      onClick={() => setUnlinkingScene(scene)}
                      aria-label={`Unlink ${scene.name}`}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Unlink className="w-4 h-4" /> Unlink
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Row below scene cards: New Scene (left) & Import Scene (right) */}
          <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 rounded-xl p-3.5 flex items-center justify-center gap-2 font-bold transition-colors"
            >
              <Plus className="w-5 h-5" /> New Scene
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex-1 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 rounded-xl p-3.5 flex items-center justify-center gap-2 font-bold transition-colors"
            >
              <Download className="w-5 h-5" /> Import Scene
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateSceneModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleCreateScene}
      />

      <EditSceneModal
        isOpen={!!editingScene}
        scene={editingScene}
        onClose={() => setEditingScene(null)}
        onConfirm={handleEditScene}
      />

      {/* Import Scene Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-xl font-bold text-neutral-100">Import Scene to Session</h2>
              <button
                onClick={() => setIsImportOpen(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                ×
              </button>
            </div>

            {unlinkedGlobalScenes.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-neutral-300 font-medium">
                  All scenes are already in this session
                </p>
                <Link
                  to="/scenes"
                  onClick={() => setIsImportOpen(false)}
                  className="text-amber-400 hover:underline text-sm font-semibold inline-block"
                >
                  Create a new scene in Scenes
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={importSearch}
                    onChange={(e) => setImportSearch(e.target.value)}
                    placeholder="Search scenes to import..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-100"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {filteredImportScenes.map((sc) => (
                    <div
                      key={sc.id}
                      className="p-3 bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 rounded-lg flex items-center justify-between"
                      data-import-scene-item={sc.name}
                    >
                      <div>
                        <div className="font-bold text-neutral-100">{sc.name}</div>
                        {sc.description && (
                          <div className="text-xs text-neutral-400">{sc.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          handleImportScene(sc.id)
                          setIsImportOpen(false)
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-3 py-1.5 rounded text-xs"
                      >
                        Import
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unlink Confirmation Modal */}
      {unlinkingScene && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-neutral-100">Unlink Scene?</h3>
            <p className="text-sm text-neutral-300">
              Are you sure you want to remove "{unlinkingScene.name}" from this session? The global scene will remain available.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setUnlinkingScene(null)}
                className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlinkConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
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
