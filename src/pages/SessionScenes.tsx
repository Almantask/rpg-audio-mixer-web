import React, { useState } from 'react'
import { Plus, Link, Unlink, Sparkles, AlertTriangle, Edit3 } from 'lucide-react'
import type { Campaign, Session, Scene, SessionScene } from '../types'

interface SessionScenesProps {
  campaign: Campaign
  session: Session
  scenes: Scene[]
  sessionScenes: SessionScene[]
  onLinkScene: (sceneId: string) => void
  onUnlinkScene: (sceneId: string) => void
  onCreateAndLinkScene: (name: string, description: string) => void
  onUpdateScene?: (sceneId: string, updates: Partial<Scene>) => void
  onOpenScene: (sceneId: string) => void
  onNavigateToCampaign?: () => void
  onNavigateToSession?: () => void
}

export const SessionScenes: React.FC<SessionScenesProps> = ({
  campaign,
  session,
  scenes,
  sessionScenes,
  onLinkScene,
  onUnlinkScene,
  onCreateAndLinkScene,
  onUpdateScene,
  onOpenScene,
  onNavigateToCampaign,
  onNavigateToSession,
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [unlinkingSceneId, setUnlinkingSceneId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Linked scenes for this session
  const linkedSessionScenes = sessionScenes.filter((ss) => ss.sessionId === session.id)
  const linkedSceneIds = new Set(linkedSessionScenes.map((ss) => ss.sceneId))

  // Find most recent lastActiveAt scene ID for "Last Active" badge
  const sortedByActive = [...linkedSessionScenes].sort((a, b) => {
    if (!a.lastActiveAt) return 1
    if (!b.lastActiveAt) return -1
    return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
  })
  const lastActiveSceneId = sortedByActive[0]?.lastActiveAt ? sortedByActive[0].sceneId : null

  const linkedScenes = scenes
    .filter((sc) => linkedSceneIds.has(sc.id) && !sc.deletedAt)
    .sort((a, b) => {
      const ssA = linkedSessionScenes.find((ss) => ss.sceneId === a.id)
      const ssB = linkedSessionScenes.find((ss) => ss.sceneId === b.id)
      if (ssA?.sceneId === lastActiveSceneId) return -1
      if (ssB?.sceneId === lastActiveSceneId) return 1
      const timeA = ssA?.lastActiveAt ? new Date(ssA.lastActiveAt).getTime() : 0
      const timeB = ssB?.lastActiveAt ? new Date(ssB.lastActiveAt).getTime() : 0
      return timeB - timeA
    })
  const unlinkedScenes = scenes.filter((sc) => !linkedSceneIds.has(sc.id) && !sc.deletedAt)

  const [linkSearch, setLinkSearch] = useState('')

  const availableScenesToLink = unlinkedScenes.filter((sc) => {
    if (!linkSearch.trim()) return true
    const query = linkSearch.toLowerCase()
    const nameMatch = sc.name.toLowerCase().includes(query)
    const tagMatch = sc.tags?.some((t) => t.toLowerCase().includes(query))
    return nameMatch || tagMatch
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreateAndLinkScene(name.trim(), description.trim())
    setName('')
    setDescription('')
    setIsCreateModalOpen(false)
  }

  const unlinkingScene = unlinkingSceneId ? scenes.find((s) => s.id === unlinkingSceneId) : null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1">
          <button onClick={onNavigateToCampaign} className="hover:underline">
            {campaign.name.toUpperCase()}
          </button>
          <span>&gt;</span>
          <button onClick={onNavigateToSession} className="hover:underline">
            {session.name.toUpperCase()}
          </button>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-100">{session.name}</h1>
            {session.description && (
              <p className="text-gray-400 text-sm mt-1">{session.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setName('')
                setDescription('')
                setIsCreateModalOpen(true)
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Scene</span>
            </button>
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold rounded-lg text-sm flex items-center gap-1.5 transition"
            >
              <Link className="w-4 h-4" />
              <span>Import Scene</span>
            </button>
          </div>
        </div>
      </div>

      {linkedScenes.length === 0 ? (
        <div className="bg-[#121212] border border-amber-900/20 rounded-xl p-12 text-center space-y-3">
          <Sparkles className="w-12 h-12 text-amber-500/40 mx-auto" />
          <h3 className="text-xl font-serif font-semibold text-gray-200">No scenes in this session</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Import an existing scene or create a new scene to prepare audio for this session.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setName('')
                setDescription('')
                setIsCreateModalOpen(true)
              }}
              className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm"
            >
              New Scene
            </button>
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded-lg text-sm"
            >
              Import Scene
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedScenes.map((scene) => {
              const isLastActive = scene.id === lastActiveSceneId

              return (
                <div
                  key={scene.id}
                  onClick={() => onOpenScene(scene.id)}
                  className={`
                    bg-[#121212] border rounded-xl p-5 flex flex-col justify-between transition cursor-pointer group relative
                    ${isLastActive ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-amber-900/30 hover:border-amber-500/50'}
                  `}
                >
                  {isLastActive && (
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider rounded-full flex items-center gap-1 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" /> Last Active
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3
                        className="text-xl font-serif font-bold text-gray-100 group-hover:text-amber-400 transition"
                      >
                        {scene.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          aria-label={`Edit ${scene.name}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditingScene(scene)
                            setName(scene.name)
                            setDescription(scene.description || '')
                          }}
                          className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-white/5"
                          title="Edit scene"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          aria-label={`Unlink ${scene.name}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setUnlinkingSceneId(scene.id)
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-white/5"
                          title="Unlink scene from session"
                        >
                          <Unlink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {scene.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">{scene.description}</p>
                    )}

                    {scene.tags && scene.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {scene.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-amber-900/10 mt-4">
                    <span className="text-xs text-gray-500 font-mono">
                      {scene.soundscapeCategoryIds?.length || 0} SC · {scene.soundboardFxIds?.length || 0} FX
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action buttons below grid */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setName('')
                setDescription('')
                setIsCreateModalOpen(true)
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Scene</span>
            </button>
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold rounded-lg text-sm flex items-center gap-1.5 transition"
            >
              <Link className="w-4 h-4" />
              <span>Import Scene</span>
            </button>
          </div>
        </div>
      )}

      {/* Link Scene Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-serif font-bold text-amber-400">Import Scene to Session</h2>
            {unlinkedScenes.length === 0 ? (
              <div className="space-y-4 py-4 text-center">
                <p className="text-gray-400 text-sm">All scenes are already in this session</p>
                <button
                  onClick={() => {
                    setIsLinkModalOpen(false)
                    setIsCreateModalOpen(true)
                  }}
                  className="text-amber-400 hover:underline text-sm font-semibold inline-block"
                >
                  Create a new scene in Scenes
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search scenes by name or tag…"
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-400"
                />
                <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                  {availableScenesToLink.map((sc) => (
                    <div key={sc.id} className="bg-[#0D0D0D] border border-amber-900/30 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="font-serif font-semibold text-gray-200">{sc.name}</div>
                        <div className="text-xs text-gray-400">{sc.description || 'No description'}</div>
                      </div>
                      <button
                        onClick={() => {
                          onLinkScene(sc.id)
                          setIsLinkModalOpen(false)
                          setLinkSearch('')
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded"
                      >
                        Import
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={() => { setIsLinkModalOpen(false); setLinkSearch(''); }} className="px-4 py-2 text-gray-400 hover:text-gray-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Scene Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-400">Create Scene</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Scene Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tavern Brawl"
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Scene notes..."
                  rows={3}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg">
                  Create Scene
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unlink Confirmation Modal */}
      {unlinkingScene && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-serif font-bold">Unlink Scene?</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Are you sure you want to unlink "{unlinkingScene.name}" from {session.name}? The scene will remain available in the global Scenes catalogue.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnlinkingSceneId(null)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUnlinkScene(unlinkingScene.id)
                  setUnlinkingSceneId(null)
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
              >
                Unlink
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Scene Modal */}
      {editingScene && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-400">Edit Scene</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!name.trim()) return
                if (onUpdateScene) {
                  onUpdateScene(editingScene.id, { name: name.trim(), description: description.trim() })
                }
                setEditingScene(null)
                setName('')
                setDescription('')
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs uppercase text-amber-400/80 font-semibold mb-1">
                  Scene Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tavern"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-amber-400/80 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the environment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingScene(null)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
