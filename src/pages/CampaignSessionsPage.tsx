import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Calendar, Sparkles } from 'lucide-react'
import { getDb, saveDb, type Campaign, type Session } from '../lib/storage/db'

export const CampaignSessionsPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<Session | null>(null)

  // Form states
  const [sessionName, setSessionName] = useState('')
  const [sessionDate, setSessionDate] = useState('today')
  const [sessionDesc, setSessionDesc] = useState('')
  const [coverArt, setCoverArt] = useState('')
  const [formError, setFormError] = useState('')

  const loadData = () => {
    const db = getDb()
    const foundCamp = db.campaigns.find((c) => c.id === campaignId && !c.deletedAt)
    if (!foundCamp) {
      setCampaign(null)
      return
    }
    setCampaign(foundCamp)

    const campaignSessions = db.sessions
      .filter((s) => s.campaignId === campaignId && !s.deletedAt)
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())

    setSessions(campaignSessions)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData()
  }, [campaignId])

  if (!campaign) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-neutral-400">Campaign not found or deleted.</p>
        <button
          onClick={() => navigate('/campaigns')}
          className="text-amber-400 font-semibold hover:underline text-sm"
        >
          Return to Campaigns
        </button>
      </div>
    )
  }

  const nextSessionNumber = sessions.length + 1

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionName.trim()) {
      setFormError('Session name is required')
      return
    }

    const db = getDb()
    const newSession: Session = {
      id: `s_${Date.now()}`,
      campaignId: campaign.id,
      sessionNumber: nextSessionNumber,
      name: sessionName.trim(),
      date: sessionDate === 'today' ? 'Mar 12' : sessionDate,
      description: sessionDesc.trim() || undefined,
      coverArt: coverArt || undefined,
      lastOpenedAt: new Date().toISOString(),
    }

    db.sessions.unshift(newSession)
    saveDb(db)
    setSessions(db.sessions.filter((s) => s.campaignId === campaign.id && !s.deletedAt))

    setSessionName('')
    setSessionDesc('')
    setCoverArt('')
    setFormError('')
    setIsCreateOpen(false)
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession || !sessionName.trim()) {
      setFormError('Session name is required')
      return
    }

    const db = getDb()
    const target = db.sessions.find((s) => s.id === editingSession.id)
    if (target) {
      target.name = sessionName.trim()
      target.date = sessionDate === 'today' ? 'Mar 12' : sessionDate
      target.description = sessionDesc.trim() || undefined
      if (coverArt) target.coverArt = coverArt
      saveDb(db)
      loadData()
    }

    setEditingSession(null)
    setFormError('')
  }

  const handleConfirmDelete = () => {
    if (!deletingSession) return
    const db = getDb()
    const target = db.sessions.find((s) => s.id === deletingSession.id)
    if (target) {
      target.deletedAt = new Date().toISOString()
      saveDb(db)
      loadData()
    }
    setDeletingSession(null)
  }

  const openSessionScenes = (session: Session) => {
    const db = getDb()
    const target = db.sessions.find((s) => s.id === session.id)
    if (target) {
      target.lastOpenedAt = new Date().toISOString()
      saveDb(db)
    }
    navigate(`/campaigns/${campaign.id}/sessions/${session.id}/scenes`)
  }

  const lastActiveSession = [...sessions].sort(
    (a, b) => new Date(b.lastOpenedAt || 0).getTime() - new Date(a.lastOpenedAt || 0).getTime()
  )[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-amber-400">{campaign.name}</h1>
        <p className="text-xs uppercase tracking-wider font-semibold text-neutral-400 mt-0.5">
          Campaign Sessions
        </p>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#181510] to-neutral-900 border border-amber-900/30 rounded-xl p-6 relative overflow-hidden">
        <p className="text-sm text-neutral-300 font-medium">
          {campaign.description || 'No description added.'}
        </p>
      </div>

      {/* Sessions List Grid */}
      {sessions.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-[#121212] border border-neutral-800 rounded-xl p-10 text-center space-y-4">
            <Calendar className="w-12 h-12 text-amber-500/40 mx-auto" />
            <h2 className="text-lg font-serif font-semibold text-neutral-300">No sessions yet</h2>
            <p className="text-sm text-neutral-400">Add a new session to begin tracking play nights.</p>
          </div>

          <button
            onClick={() => {
              setSessionName('')
              setSessionDate('today')
              setSessionDesc('')
              setFormError('')
              setIsCreateOpen(true)
            }}
            data-testid="add-new-session-button"
            className="w-full border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-5 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Session</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => {
            const isLastActive = lastActiveSession && lastActiveSession.id === session.id

            return (
              <div
                key={session.id}
                data-testid={`session-card-${session.name}`}
                onClick={() => openSessionScenes(session)}
                className="bg-[#121212] border border-neutral-800 hover:border-amber-900/40 rounded-xl p-4 flex flex-col justify-between gap-4 cursor-pointer transition-colors relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                      Session {session.sessionNumber}
                    </span>
                    {isLastActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3" /> Last Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors">
                    {session.name}
                  </h3>

                  <p className="text-xs text-neutral-400 font-medium">
                    {session.date} · 4 Scenes
                  </p>

                  {session.description && (
                    <p className="text-xs text-neutral-500 italic line-clamp-2">
                      {session.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/60" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditingSession(session)
                      setSessionName(session.name)
                      setSessionDate(session.date)
                      setSessionDesc(session.description || '')
                      setFormError('')
                    }}
                    aria-label={`Edit ${session.name}`}
                    className="p-1.5 text-neutral-400 hover:text-amber-400 transition-colors rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingSession(session)}
                    aria-label={`Delete ${session.name}`}
                    className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          <button
            onClick={() => {
              setSessionName('')
              setSessionDate('today')
              setSessionDesc('')
              setFormError('')
              setIsCreateOpen(true)
            }}
            data-testid="add-new-session-button"
            className="border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors min-h-[160px]"
          >
            <Plus className="w-6 h-6" />
            <span>Add New Session</span>
          </button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      {(isCreateOpen || editingSession) && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-md w-full space-y-5">
            <h2 className="font-serif text-xl font-bold text-amber-400">
              {editingSession ? 'Edit Session' : 'Add New Session'}
            </h2>

            {formError && (
              <p className="text-xs text-red-400 font-medium bg-red-950/50 border border-red-800 p-2 rounded">
                {formError}
              </p>
            )}

            <form onSubmit={editingSession ? handleEdit : handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Session Number
                </label>
                <input
                  type="text"
                  readOnly
                  value={`Session ${editingSession ? editingSession.sessionNumber : nextSessionNumber}`}
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Session Name *
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. The Dark Arrival"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  placeholder="e.g. Mar 12"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
                  placeholder="Optional session notes..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setEditingSession(null)
                    setFormError('')
                  }}
                  className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm"
                >
                  {editingSession ? 'Save Changes' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation AlertDialog */}
      {deletingSession && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-red-900/40 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-serif text-lg font-bold text-red-400">Delete Session</h3>
            <p className="text-sm text-neutral-300">
              Are you sure you want to delete "{deletingSession.name}"? It will be moved to Trash.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingSession(null)}
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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
