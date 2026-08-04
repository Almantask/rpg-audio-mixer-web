import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Download, Edit2, Copy, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge } from '../components/common/Badge'
import { Dialog } from '../components/common/Dialog'
import { AlertDialog } from '../components/common/AlertDialog'
import type { Scene } from '../types'

export const SessionScenesView: React.FC = () => {
  const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>()
  const navigate = useNavigate()

  const {
    campaigns,
    sessions,
    scenes,
    sessionScenes,
    sceneSoundscapes,
    soundboardItems,
    createScene,
    duplicateScene,
    updateScene,
    unlinkSceneFromSession,
    linkSceneToSession,
    setActiveSceneId,
  } = useApp()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [unlinkingScene, setUnlinkingScene] = useState<Scene | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const campaign = campaigns.find((c) => c.id === campaignId)
  const session = sessions.find((s) => s.id === sessionId)

  if (!campaign || !session) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Session not found.{' '}
        <button onClick={() => navigate('/campaigns')} className="text-amber-400 underline">
          Go back to campaigns
        </button>
      </div>
    )
  }

  // Linked scenes
  const linkedSessionScenes = sessionScenes.filter((ss) => ss.sessionId === session.id)
  const linkedSceneIds = new Set(linkedSessionScenes.map((ss) => ss.sceneId))
  const linkedScenesList = scenes.filter((s) => linkedSceneIds.has(s.id))

  // Sort linked scenes: Last Active scene first
  const sortedLinkedScenes = [...linkedScenesList].sort((a, b) => {
    const aLink = linkedSessionScenes.find((ss) => ss.sceneId === a.id)
    const bLink = linkedSessionScenes.find((ss) => ss.sceneId === b.id)
    return (bLink?.lastPlayedAt || 0) - (aLink?.lastPlayedAt || 0)
  })

  // Unlinked global scenes for Import picker
  const unlinkedGlobalScenes = scenes.filter((s) => !linkedSceneIds.has(s.id))

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createScene(
      {
        name: name.trim(),
        description: description.trim() || undefined,
      },
      session.id,
    )
    setName('')
    setDescription('')
    setIsCreateOpen(false)
  }

  const handleOpenScene = (sceneId: string) => {
    setActiveSceneId(sceneId)
    updateScene(sceneId, { lastPlayedAt: Date.now() })
    navigate(`/scenes/${sceneId}`)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Uppercase Breadcrumb */}
      <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 space-x-1">
        <Link to={`/campaigns/${campaign.id}/sessions`} className="hover:text-amber-400">
          CAMPAIGN &gt; {campaign.name}
        </Link>{' '}
        &gt; SESSION {session.sessionNumber}
      </div>

      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">
          Session {session.sessionNumber} — {session.name}
        </h1>
        <p className="text-sm text-neutral-400 uppercase tracking-wider font-medium">
          Session Scenes
        </p>
      </div>

      {/* Linked Scene Rows */}
      <div className="space-y-4">
        {sortedLinkedScenes.map((scene, idx) => {
          const scCount = sceneSoundscapes.filter((ss) => ss.sceneId === scene.id).length
          const fxCount = soundboardItems.filter((sb) => sb.sceneId === scene.id).length
          const isLastActive = idx === 0 && linkedSessionScenes[0]?.lastPlayedAt

          return (
            <div
              key={scene.id}
              onClick={() => handleOpenScene(scene.id)}
              className="group relative rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden p-5 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition shadow-lg"
            >
              <div className="space-y-1.5 min-w-0 pr-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {isLastActive && <Badge variant="gold">Last Active</Badge>}
                  {scene.tags.map((tag) => (
                    <Badge key={tag} variant="muted">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-serif text-xl font-bold text-neutral-100 group-hover:text-amber-300 transition truncate">
                  {scene.name}
                </h3>
                <div className="text-xs font-semibold text-neutral-400">
                  {scCount} SC · {fxCount} FX
                </div>
              </div>

              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setEditingScene(scene)
                    setName(scene.name)
                    setDescription(scene.description || '')
                  }}
                  className="p-2 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition"
                  aria-label={`Edit ${scene.name}`}
                >
                  <Edit2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => duplicateScene(scene.id, session.id)}
                  className="p-2 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition"
                  aria-label={`Duplicate ${scene.name}`}
                >
                  <Copy className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setUnlinkingScene(scene)}
                  className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                  aria-label={`Unlink ${scene.name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        })}

        {/* Bottom Action Cards: New Scene (Left) + Import Scene (Right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => {
              setName('')
              setDescription('')
              setIsCreateOpen(true)
            }}
            className="rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-neutral-900/40 hover:bg-neutral-900/80 p-5 flex items-center justify-center space-x-2 text-amber-400 font-bold transition group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>New Scene</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="rounded-xl border-2 border-dashed border-neutral-700 hover:border-amber-400 bg-neutral-900/40 hover:bg-neutral-900/80 p-5 flex items-center justify-center space-x-2 text-neutral-300 hover:text-amber-400 font-bold transition group"
          >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Import Scene</span>
          </button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Scene for Session"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Location / Scene Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dragon's Lair"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the place..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
            >
              Create & Link
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
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (editingScene && name.trim()) {
              updateScene(editingScene.id, { name: name.trim(), description: description.trim() || undefined })
              setEditingScene(null)
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Scene Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingScene(null)}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Dialog>

      {/* Import Picker Dialog */}
      <Dialog isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Import Scene">
        <div className="space-y-4">
          {unlinkedGlobalScenes.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {unlinkedGlobalScenes.map((sc) => (
                <div
                  key={sc.id}
                  className="flex items-center justify-between bg-neutral-950 border border-neutral-800 p-3 rounded-lg hover:border-amber-500/40 transition"
                >
                  <span className="font-serif font-bold text-neutral-200">{sc.name}</span>
                  <button
                    onClick={() => {
                      linkSceneToSession(session.id, sc.id)
                      setIsImportOpen(false)
                    }}
                    className="px-3 py-1 bg-amber-500 text-neutral-950 font-bold text-xs rounded hover:bg-amber-400"
                  >
                    Import
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-4">
              All scenes are already in this session. Use <strong className="text-neutral-200">New Scene</strong> to create a new one.
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsImportOpen(false)}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>

      {/* Unlink Confirmation AlertDialog */}
      <AlertDialog
        isOpen={Boolean(unlinkingScene)}
        onClose={() => setUnlinkingScene(null)}
        onConfirm={() => {
          if (unlinkingScene) {
            unlinkSceneFromSession(session.id, unlinkingScene.id)
            setUnlinkingScene(null)
          }
        }}
        title="Unlink Scene"
        description={
          unlinkingScene
            ? `Unlink "${unlinkingScene.name}" from this session? The global scene will not be deleted.`
            : ''
        }
        confirmText="Unlink"
      />
    </div>
  )
}
