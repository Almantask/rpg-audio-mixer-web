import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Download, Copy, Trash2, Image, Search, ChevronRight } from 'lucide-react'
import { getDb, saveDb, type Campaign, type Session, type Scene } from '../lib/storage/db'

export const SessionScenesPage: React.FC = () => {
  const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [linkedScenes, setLinkedScenes] = useState<Scene[]>([])
  const [globalScenes, setGlobalScenes] = useState<Scene[]>([])

  const [isNewSceneOpen, setIsNewSceneOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [unlinkingScene, setUnlinkingScene] = useState<Scene | null>(null)

  // Form states
  const [sceneName, setSceneName] = useState('')
  const [sceneDesc, setSceneDesc] = useState('')
  const [importSearch, setImportSearch] = useState('')
  const [selectedImportIds, setSelectedImportIds] = useState<string[]>([])
  const [formError, setFormError] = useState('')

  const loadData = () => {
    const db = getDb()
    const foundCamp = db.campaigns.find((c) => c.id === campaignId && !c.deletedAt)
    const foundSess = db.sessions.find((s) => s.id === sessionId && !s.deletedAt)

    setCampaign(foundCamp || null)
    setSession(foundSess || null)

    if (foundSess) {
      const links = db.sessionScenes.filter((l) => l.sessionId === sessionId)
      const linkedIds = new Set(links.map((l) => l.sceneId))

      const validScenes = db.scenes.filter((s) => !s.deletedAt)
      setGlobalScenes(validScenes)

      const linked = validScenes.filter((s) => linkedIds.has(s.id))
      // Sort by last played
      linked.sort((a, b) => {
        const linkA = links.find((l) => l.sceneId === a.id)
        const linkB = links.find((l) => l.sceneId === b.id)
        return (
          new Date(linkB?.lastPlayedAt || 0).getTime() - new Date(linkA?.lastPlayedAt || 0).getTime()
        )
      })

      setLinkedScenes(linked)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData()
  }, [campaignId, sessionId])

  if (!campaign || !session) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-neutral-400">Session or Campaign not found.</p>
        <button
          onClick={() => navigate('/campaigns')}
          className="text-amber-400 font-semibold hover:underline text-sm"
        >
          Return to Campaigns
        </button>
      </div>
    )
  }

  const handleCreateNewScene = (e: React.FormEvent) => {
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
      soundscapesCount: 0,
      effectsCount: 0,
    }

    db.scenes.unshift(newScene)
    db.sessionScenes.push({
      sessionId: session.id,
      sceneId: newScene.id,
      lastPlayedAt: new Date().toISOString(),
    })

    saveDb(db)
    loadData()

    setSceneName('')
    setSceneDesc('')
    setFormError('')
    setIsNewSceneOpen(false)
  }

  const handleImportSubmit = () => {
    if (selectedImportIds.length === 0) return
    const db = getDb()
    selectedImportIds.forEach((id) => {
      if (!db.sessionScenes.some((l) => l.sessionId === session.id && l.sceneId === id)) {
        db.sessionScenes.push({
          sessionId: session.id,
          sceneId: id,
          lastPlayedAt: new Date().toISOString(),
        })
      }
    })
    saveDb(db)
    loadData()
    setSelectedImportIds([])
    setIsImportOpen(false)
  }

  const handleConfirmUnlink = () => {
    if (!unlinkingScene) return
    const db = getDb()
    db.sessionScenes = db.sessionScenes.filter(
      (l) => !(l.sessionId === session.id && l.sceneId === unlinkingScene.id)
    )
    saveDb(db)
    loadData()
    setUnlinkingScene(null)
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
    db.sessionScenes.push({
      sessionId: session.id,
      sceneId: clone.id,
      lastPlayedAt: new Date().toISOString(),
    })
    saveDb(db)
    loadData()
  }

  const unlinkedGlobalScenes = globalScenes.filter(
    (s) => !linkedScenes.some((ls) => ls.id === s.id)
  )

  const filteredUnlinked = unlinkedGlobalScenes.filter((s) => {
    if (!importSearch.trim()) return true
    const q = importSearch.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.tags?.some((t) => t.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs uppercase font-sans tracking-wider flex items-center gap-1.5 text-neutral-400">
        <Link to="/campaigns" className="hover:text-amber-400 transition-colors">
          CAMPAIGN
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-600" />
        <Link
          to={`/campaigns/${campaign.id}/sessions`}
          className="hover:text-amber-400 transition-colors"
        >
          {campaign.name}
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-600" />
        <span className="text-amber-400 font-semibold">SESSION {session.sessionNumber}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-amber-400">
          Session {session.sessionNumber} – {session.name}
        </h1>
        {session.description ? (
          <p className="text-sm text-neutral-400 mt-1">{session.description}</p>
        ) : (
          <p className="text-xs text-neutral-500 mt-1">Session Scenes</p>
        )}
      </div>

      {/* Linked Scenes Grid */}
      {linkedScenes.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-[#121212] border border-neutral-800 rounded-xl p-10 text-center space-y-4">
            <Image className="w-12 h-12 text-amber-500/40 mx-auto" />
            <h2 className="text-lg font-serif font-semibold text-neutral-300">
              No scenes linked to this session
            </h2>
            <p className="text-sm text-neutral-400">
              Create a new scene or import an existing global scene for tonight's play.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSceneName('')
                setSceneDesc('')
                setFormError('')
                setIsNewSceneOpen(true)
              }}
              data-testid="new-scene-button"
              className="border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-5 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Scene</span>
            </button>

            <button
              onClick={() => {
                setImportSearch('')
                setSelectedImportIds([])
                setIsImportOpen(true)
              }}
              data-testid="import-scene-button"
              className="border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-5 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Import Scene</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {linkedScenes.map((scene, idx) => {
            const isLastActive = idx === 0

            return (
              <div
                key={scene.id}
                data-testid={`session-scene-card-${scene.name}`}
                onClick={() =>
                  navigate(
                    `/campaigns/${campaign.id}/sessions/${session.id}/scenes/${scene.id}`
                  )
                }
                className="bg-[#121212] border border-neutral-800 hover:border-amber-900/40 rounded-xl p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isLastActive && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                        Last Active
                      </span>
                    )}
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
                    <p className="text-xs text-neutral-400 line-clamp-1">
                      {scene.description}
                    </p>
                  )}

                  <p className="text-xs font-semibold text-neutral-500">
                    {scene.soundscapesCount ?? 0} SC · {scene.effectsCount ?? 0} FX
                  </p>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleDuplicate(scene, e)}
                    aria-label={`Duplicate ${scene.name}`}
                    className="p-2 text-neutral-400 hover:text-amber-400 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setUnlinkingScene(scene)}
                    aria-label={`Unlink ${scene.name}`}
                    className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Bottom CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => {
                setSceneName('')
                setSceneDesc('')
                setFormError('')
                setIsNewSceneOpen(true)
              }}
              data-testid="new-scene-button"
              className="border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-5 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Scene</span>
            </button>

            <button
              onClick={() => {
                setImportSearch('')
                setSelectedImportIds([])
                setIsImportOpen(true)
              }}
              data-testid="import-scene-button"
              className="border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-5 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Import Scene</span>
            </button>
          </div>
        </div>
      )}

      {/* New Scene Dialog */}
      {isNewSceneOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-md w-full space-y-5">
            <h2 className="font-serif text-xl font-bold text-amber-400">New Scene</h2>

            {formError && (
              <p className="text-xs text-red-400 font-medium bg-red-950/50 border border-red-800 p-2 rounded">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateNewScene} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Scene Name *
                </label>
                <input
                  type="text"
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  placeholder="Location name (e.g. Tavern)"
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
                  onClick={() => setIsNewSceneOpen(false)}
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

      {/* Import Scene Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="font-serif text-xl font-bold text-amber-400">Import Scene</h2>

            {unlinkedGlobalScenes.length === 0 ? (
              <div className="space-y-4 text-center py-4">
                <p className="text-sm text-neutral-300">All scenes are already in this session</p>
                <button
                  onClick={() => {
                    setIsImportOpen(false)
                    setIsNewSceneOpen(true)
                  }}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  Create a new scene
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={importSearch}
                    onChange={(e) => setImportSearch(e.target.value)}
                    placeholder="Search scenes to import…"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {filteredUnlinked.map((sc) => {
                    const isChecked = selectedImportIds.includes(sc.id)
                    return (
                      <div
                        key={sc.id}
                        onClick={() =>
                          setSelectedImportIds((prev) =>
                            isChecked ? prev.filter((id) => id !== sc.id) : [...prev, sc.id]
                          )
                        }
                        className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between text-sm ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <p className="font-serif font-semibold">{sc.name}</p>
                          {sc.description && (
                            <p className="text-xs text-neutral-400">{sc.description}</p>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-amber-500 w-4 h-4"
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportOpen(false)}
                    className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={selectedImportIds.length === 0}
                    onClick={handleImportSubmit}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-lg text-sm"
                  >
                    Import Selected ({selectedImportIds.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Unlink Confirmation AlertDialog */}
      {unlinkingScene && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-serif text-lg font-bold text-amber-400">Unlink Scene</h3>
            <p className="text-sm text-neutral-300">
              Unlink "{unlinkingScene.name}" from this session? The global scene will remain in Scenes.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUnlinkingScene(null)}
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnlink}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm"
              >
                Confirm Unlink
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
