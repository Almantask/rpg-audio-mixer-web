import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Edit2, Copy, Trash2, Download, Sparkles, Image as ImageIcon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Dialog, AlertDialog } from '../components/common/Dialog'
import { ImportSceneModal } from '../components/modals/ImportSceneModal'
import type { Scene } from '../types'

export const SessionScenesPage: React.FC = () => {
  const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>()
  const navigate = useNavigate()
  const {
    campaigns,
    sessions,
    scenes,
    createScene,
    updateScene,
    duplicateScene,
    unlinkSceneFromSession,
  } = useApp()

  const campaign = campaigns.find((c) => c.id === campaignId)
  const session = sessions.find((s) => s.id === sessionId)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [unlinkingSceneId, setUnlinkingSceneId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  if (!campaign || !session) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Session context not found.</p>
        <button
          onClick={() => navigate('/campaigns')}
          className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold"
        >
          Return to Campaigns
        </button>
      </div>
    )
  }

  // Filter scenes linked to this session
  const sessionScenes = scenes.filter((sc) => session.sceneIds.includes(sc.id))

  // Find Last Active scene (most recently played linked scene)
  const lastActiveScene = sessionScenes.reduce<Scene | null>((latest, current) => {
    if (!current.lastPlayedAt) return latest
    if (!latest || !latest.lastPlayedAt) return current
    return new Date(current.lastPlayedAt) > new Date(latest.lastPlayedAt) ? current : latest
  }, null)

  // Sort scenes: Last Active pinned first, then recent
  const sortedScenes = [...sessionScenes].sort((a, b) => {
    if (lastActiveScene && a.id === lastActiveScene.id) return -1
    if (lastActiveScene && b.id === lastActiveScene.id) return 1
    return (
      new Date(b.lastPlayedAt || b.createdAt).getTime() -
      new Date(a.lastPlayedAt || a.createdAt).getTime()
    )
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    // Auto-links to this session per F-SS-05
    createScene(name.trim(), description.trim() || undefined, undefined, undefined, session.id)
    setName('')
    setDescription('')
    setIsCreateOpen(false)
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb Trail */}
      <div className="text-xs uppercase font-bold tracking-wider text-gray-400 flex items-center gap-2">
        <Link to="/campaigns" className="hover:text-yellow-500">
          CAMPAIGN
        </Link>
        <span>&gt;</span>
        <Link to={`/campaigns/${campaign.id}/sessions`} className="hover:text-yellow-500">
          {campaign.name}
        </Link>
        <span>&gt;</span>
        <span className="text-yellow-500">SESSION {session.sessionNumber}</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-yellow-500">
          Session {session.sessionNumber} — {session.name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">Session Scenes</p>
      </div>

      {/* Scene Rows */}
      <div className="space-y-4">
        {sortedScenes.length === 0 ? (
          <div className="text-center py-12 bg-[#141414] rounded-xl border border-yellow-900/20 p-8 space-y-3">
            <ImageIcon size={48} className="mx-auto text-yellow-500/40" />
            <h3 className="font-serif text-xl font-bold text-gray-300">No scenes in this session</h3>
            <p className="text-sm text-gray-400">
              Create a new scene or import existing scenes from your global catalogue.
            </p>
          </div>
        ) : (
          sortedScenes.map((sc) => {
            const isLastActive = lastActiveScene?.id === sc.id

            return (
              <div
                key={sc.id}
                onClick={() =>
                  navigate(`/campaigns/${campaign.id}/sessions/${session.id}/scenes/${sc.id}`)
                }
                className="relative rounded-xl border border-yellow-900/30 bg-gradient-to-r from-[#1C160C] via-[#161616] to-[#121212] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-yellow-500/60 transition-all group overflow-hidden"
              >
                <div className="space-y-2 z-10">
                  <div className="flex items-center gap-2">
                    {isLastActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-500 text-black animate-pulse">
                        <Sparkles size={12} /> LAST ACTIVE
                      </span>
                    )}
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
                        duplicateScene(sc.id, session.id)
                      }}
                      className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-white/5 rounded-lg transition-colors"
                      title="Duplicate Scene into Session"
                    >
                      <Copy size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUnlinkingSceneId(sc.id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                      title="Unlink Scene from Session"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Bottom CTAs: New Scene (Left) + Import Scene (Right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setName('')
              setDescription('')
              setIsCreateOpen(true)
            }}
            className="p-5 border-2 border-dashed border-yellow-900/40 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/60 transition-all flex items-center justify-center gap-3 text-yellow-500 font-serif font-bold text-base"
          >
            <Plus size={20} />
            <span>New Scene</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="p-5 border-2 border-dashed border-yellow-900/40 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/60 transition-all flex items-center justify-center gap-3 text-yellow-500 font-serif font-bold text-base"
          >
            <Download size={20} />
            <span>Import Scene</span>
          </button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Scene"
        subtitle="Create a new scene and link it to this session."
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
              placeholder="Notes or DM cues..."
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

      {/* Import Modal */}
      <ImportSceneModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        sessionId={session.id}
      />

      {/* Unlink AlertDialog */}
      <AlertDialog
        isOpen={Boolean(unlinkingSceneId)}
        onClose={() => setUnlinkingSceneId(null)}
        onConfirm={() => {
          if (unlinkingSceneId) unlinkSceneFromSession(unlinkingSceneId, session.id)
        }}
        title="Unlink Scene"
        description="This will remove the scene from this session. The global scene will not be deleted."
        confirmText="Unlink"
        isDestructive={false}
      />
    </div>
  )
}
