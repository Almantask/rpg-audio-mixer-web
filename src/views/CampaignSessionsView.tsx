import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge } from '../components/common/Badge'
import { Dialog } from '../components/common/Dialog'
import { AlertDialog } from '../components/common/AlertDialog'
import type { Session } from '../types'

export const CampaignSessionsView: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()

  const {
    campaigns,
    sessions,
    sessionScenes,
    createSession,
    updateSession,
    softDeleteSession,
    setActiveSessionId,
  } = useApp()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  const campaign = campaigns.find((c) => c.id === campaignId)
  if (!campaign) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Campaign not found.{' '}
        <button onClick={() => navigate('/campaigns')} className="text-amber-400 underline">
          Go back to campaigns
        </button>
      </div>
    )
  }

  const campaignSessions = sessions
    .filter((s) => s.campaignId === campaign.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Find last active session
  const lastActiveSession = [...campaignSessions].sort(
    (a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0),
  )[0]

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createSession({
      campaignId: campaign.id,
      name: name.trim(),
      date,
      description: description.trim() || undefined,
    })
    setName('')
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setIsCreateOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession || !name.trim()) return
    updateSession(editingSession.id, {
      name: name.trim(),
      date,
      description: description.trim() || undefined,
    })
    setEditingSession(null)
  }

  const handleOpenSession = (sess: Session) => {
    setActiveSessionId(sess.id)
    updateSession(sess.id, { lastOpenedAt: Date.now() })
    navigate(`/campaigns/${campaign.id}/sessions/${sess.id}/scenes`)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">{campaign.name}</h1>
        <p className="text-sm text-neutral-400 uppercase tracking-wider">Campaign Sessions</p>
      </div>

      {/* Campaign Hero Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-neutral-900 p-6 space-y-2">
        <h2 className="font-serif text-xl font-bold text-neutral-100">{campaign.name}</h2>
        {campaign.description && (
          <p className="text-sm text-neutral-300">{campaign.description}</p>
        )}
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaignSessions.map((sess) => {
          const linkedScenes = sessionScenes.filter((ss) => ss.sessionId === sess.id)
          const sceneCount = linkedScenes.length
          const sceneLabel = sceneCount === 1 ? '1 Scene' : `${sceneCount} Scenes`
          const isLastActive = lastActiveSession?.id === sess.id

          return (
            <div
              key={sess.id}
              onClick={() => handleOpenSession(sess)}
              className="group relative rounded-xl border border-neutral-800 bg-neutral-900 p-5 cursor-pointer hover:border-amber-500/50 transition shadow-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase">
                    Session {sess.sessionNumber}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-neutral-100 group-hover:text-amber-300 transition">
                    {sess.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  {isLastActive && <Badge variant="gold">Last Active</Badge>}
                  <button
                    onClick={() => {
                      setEditingSession(sess)
                      setName(sess.name)
                      setDate(sess.date)
                      setDescription(sess.description || '')
                    }}
                    className="p-1.5 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition"
                    aria-label={`Edit ${sess.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSessionId(sess.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                    aria-label={`Delete ${sess.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-neutral-400 font-medium">
                {sess.date} · {sceneLabel}
              </div>

              {sess.description && (
                <p className="text-xs text-neutral-400 italic line-clamp-2">{sess.description}</p>
              )}
            </div>
          )
        })}

        {/* Add New Session Card */}
        <button
          onClick={() => {
            setName('')
            setDate(new Date().toISOString().split('T')[0])
            setDescription('')
            setIsCreateOpen(true)
          }}
          className="rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-neutral-900/40 hover:bg-neutral-900/80 p-6 flex items-center justify-center space-x-2 text-amber-400 font-bold transition group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Add New Session</span>
        </button>
      </div>

      {/* Create Dialog */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Session">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Session Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Howling Crags"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              placeholder="Session notes..."
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
              Create Session
            </button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        isOpen={Boolean(editingSession)}
        onClose={() => setEditingSession(null)}
        title="Edit Session"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Session Name *
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
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              onClick={() => setEditingSession(null)}
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

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        isOpen={Boolean(deletingSessionId)}
        onClose={() => setDeletingSessionId(null)}
        onConfirm={() => {
          if (deletingSessionId) {
            softDeleteSession(deletingSessionId)
            setDeletingSessionId(null)
          }
        }}
        title="Delete Session"
        description="Are you sure you want to delete this session? It will be moved to Trash for 7 days."
        confirmText="Delete to Trash"
      />
    </div>
  )
}
