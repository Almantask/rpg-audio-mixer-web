import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Calendar, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Dialog, AlertDialog } from '../components/common/Dialog'
import type { Session } from '../types'

export const CampaignSessionsPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { campaigns, sessions, createSession, updateSession, softDeleteSession, updateCampaign } = useApp()

  const campaign = campaigns.find((c) => c.id === campaignId)
  const campaignSessions = sessions.filter((s) => s.campaignId === campaignId)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  if (!campaign) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Campaign not found.</p>
        <button
          onClick={() => navigate('/campaigns')}
          className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold"
        >
          Return to Campaigns
        </button>
      </div>
    )
  }

  // Find most recently played session
  const lastActiveSession = campaignSessions.reduce<Session | null>((latest, current) => {
    if (!current.lastPlayedAt) return latest
    if (!latest || !latest.lastPlayedAt) return current
    return new Date(current.lastPlayedAt) > new Date(latest.lastPlayedAt) ? current : latest
  }, null)

  const handleOpenCreate = () => {
    setName('')
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setIsCreateOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createSession(campaign.id, name.trim(), date, description.trim() || undefined)
    setIsCreateOpen(false)
  }

  const handleOpenEdit = (sess: Session, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSession(sess)
    setName(sess.name)
    setDate(sess.date)
    setDescription(sess.description || '')
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

  const handleSessionClick = (sess: Session) => {
    updateSession(sess.id, { lastPlayedAt: new Date().toISOString() })
    updateCampaign(campaign.id, { lastPlayedAt: new Date().toISOString() })
    navigate(`/campaigns/${campaign.id}/sessions/${sess.id}/scenes`)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-yellow-500">{campaign.name}</h1>
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
          Campaign Sessions
        </p>
      </div>

      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-yellow-900/40 bg-gradient-to-r from-yellow-950/60 via-[#1A1A1A] to-[#121212] p-8 flex items-end shadow-2xl">
        <div className="relative z-10">
          <span className="text-xs uppercase tracking-widest text-yellow-400 font-bold">
            Hero Banner
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-yellow-500">
            {campaign.name}
          </h2>
          {campaign.description && (
            <p className="text-sm text-gray-300 mt-1 max-w-xl">{campaign.description}</p>
          )}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaignSessions.map((sess) => {
          const isLastActive = lastActiveSession?.id === sess.id

          return (
            <div
              key={sess.id}
              onClick={() => handleSessionClick(sess)}
              className="p-5 rounded-xl border border-yellow-900/30 bg-[#161616] hover:border-yellow-500/60 cursor-pointer transition-all flex flex-col justify-between space-y-4 group relative"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                    Session {sess.sessionNumber}
                  </span>
                  {isLastActive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 animate-pulse">
                      <Sparkles size={12} /> Last Active
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-xl font-bold text-gray-100 group-hover:text-yellow-500 transition-colors mt-1">
                  {sess.name}
                </h3>

                {sess.description && (
                  <p className="text-xs text-gray-400 mt-1 italic">{sess.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-yellow-900/20 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-yellow-500/70" />
                  {sess.date} · {sess.sceneIds.length} Scenes
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleOpenEdit(sess, e)}
                    className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-white/5 rounded transition-colors"
                    title="Edit Session"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingSessionId(sess.id)
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded transition-colors"
                    title="Delete Session"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add New Session Card */}
        <button
          onClick={handleOpenCreate}
          className="min-h-[160px] p-6 border-2 border-dashed border-yellow-900/40 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/60 transition-all flex flex-col items-center justify-center gap-2 text-yellow-500 font-serif font-bold text-base"
        >
          <Plus size={28} />
          <span>Add New Session</span>
        </button>
      </div>

      {/* Create Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Session"
        subtitle={`Create Session ${campaignSessions.length + 1} for ${campaign.name}`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Session Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Howling Crags"
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              placeholder="Session notes or goals..."
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
        isOpen={Boolean(editingSession)}
        onClose={() => setEditingSession(null)}
        title="Edit Session"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Session Name *
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
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              onClick={() => setEditingSession(null)}
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

      {/* Delete AlertDialog */}
      <AlertDialog
        isOpen={Boolean(deletingSessionId)}
        onClose={() => setDeletingSessionId(null)}
        onConfirm={() => {
          if (deletingSessionId) softDeleteSession(deletingSessionId)
        }}
        title="Delete Session"
        description="Are you sure you want to delete this session? It will be moved to Trash for 7 days."
      />
    </div>
  )
}
