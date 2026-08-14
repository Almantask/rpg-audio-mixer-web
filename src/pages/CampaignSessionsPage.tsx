import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCampaignById } from '../services/campaignService'
import {
  getActiveSessionsForCampaign,
  createSession,
  updateSession,
  softDeleteSession,
  markSessionActive,
  getNextSessionNumber,
} from '../services/sessionService'
import { getActiveSessionId } from '../services/storageService'
import type { Campaign, Session } from '../types/campaign'
import { Plus, Edit2, Trash2, Calendar, Sparkles, X } from 'lucide-react'

export const CampaignSessionsPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | undefined>(undefined)
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null)

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<Session | null>(null)

  // Form fields
  const [nameInput, setNameInput] = useState('')
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0])
  const [descInput, setDescInput] = useState('')
  const [coverInput, setCoverInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const refreshData = () => {
    if (!campaignId) return
    const camp = getCampaignById(campaignId)
    setCampaign(camp)
    setSessions(getActiveSessionsForCampaign(campaignId))
    setActiveSessionIdState(getActiveSessionId())
  }

  useEffect(() => {
    refreshData()
  }, [campaignId])

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-8 text-center">
        <h1 className="text-2xl font-serif text-amber-400">Campaign not found</h1>
        <Link to="/campaigns" className="text-amber-500 hover:underline text-sm">
          Return to Campaigns
        </Link>
      </div>
    )
  }

  const nextNumber = campaignId ? getNextSessionNumber(campaignId) : 1

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (sessionStorage.getItem('arcanum_fail_session_create') === 'true') {
      setErrorMsg('Failed to create session')
      return
    }
    if (!nameInput.trim()) {
      setErrorMsg('Session name is required')
      return
    }
    createSession({
      campaignId: campaign.id,
      name: nameInput,
      date: dateInput,
      description: descInput,
      coverUrl: coverInput,
    })
    resetForm()
    setIsCreateOpen(false)
    refreshData()
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (sessionStorage.getItem('arcanum_fail_session_edit') === 'true') {
      setErrorMsg('Failed to save session')
      return
    }
    if (!editingSession || !nameInput.trim()) {
      setErrorMsg('Session name is required')
      return
    }
    updateSession(editingSession.id, {
      name: nameInput,
      date: dateInput,
      description: descInput,
      coverUrl: coverInput,
    })
    resetForm()
    setIsEditOpen(false)
    setEditingSession(null)
    refreshData()
  }

  const confirmDelete = () => {
    if (deletingSession) {
      softDeleteSession(deletingSession.id)
      setDeletingSession(null)
      refreshData()
    }
  }

  const openEditModal = (sess: Session, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSession(sess)
    setNameInput(sess.name)
    setDateInput(sess.date)
    setDescInput(sess.description || '')
    setCoverInput(sess.coverUrl || '')
    setIsEditOpen(true)
  }

  const openDeleteModal = (sess: Session, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingSession(sess)
  }

  const resetForm = () => {
    setNameInput('')
    setDateInput(new Date().toISOString().split('T')[0])
    setDescInput('')
    setCoverInput('')
    setErrorMsg('')
  }

  const handleCardClick = (session: Session) => {
    markSessionActive(session.id)
    navigate(`/campaigns/${campaign.id}/sessions/${session.id}/scenes`)
  }



  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">{campaign.name}</h1>
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider mt-1">Campaign Sessions</p>
      </div>

      {/* Hero Banner */}
      <div className="rounded-xl border border-amber-900/30 bg-stone-900 overflow-hidden relative min-h-[120px] flex items-center p-6">
        {campaign.coverUrl && (
          <img src={campaign.coverUrl} alt={campaign.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative z-10 space-y-1">
          <h2 className="font-serif text-xl text-stone-100 font-bold">{campaign.name}</h2>
          {campaign.description && <p className="text-stone-300 text-sm max-w-xl">{campaign.description}</p>}
        </div>
      </div>

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((sess) => {
          const sceneCount = sess.sceneIds ? sess.sceneIds.length : 0
          const isLastActive = activeSessionId === sess.id

          return (
            <div
              key={sess.id}
              data-session-card={sess.name}
              data-session-number={sess.sessionNumber}
              onClick={() => handleCardClick(sess)}
              className="bg-[#121212] border border-amber-900/30 rounded-xl p-4 cursor-pointer hover:border-amber-600/50 transition-all flex flex-col justify-between space-y-3 relative group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-400/90">
                    Session {sess.sessionNumber}
                  </span>
                  {isLastActive && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full animate-pulse">
                      <Sparkles className="w-3 h-3" /> Last Active
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                  {sess.name}
                </h3>

                {sess.description && (
                  <p className="text-stone-400 text-xs line-clamp-2 italic">{sess.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-stone-800/80 pt-3 text-xs text-stone-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>{sess.date} · {sceneCount === 1 ? '1 Scene' : `${sceneCount} Scenes`}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Edit session ${sess.name}`}
                    onClick={(e) => openEditModal(sess, e)}
                    className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete session ${sess.name}`}
                    onClick={(e) => openDeleteModal(sess, e)}
                    className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add New Session Button Card */}
        <button
          type="button"
          onClick={() => {
            resetForm()
            setIsCreateOpen(true)
          }}
          className="min-h-[140px] border-2 border-dashed border-amber-900/40 hover:border-amber-600/60 rounded-xl bg-stone-900/20 hover:bg-stone-900/40 text-amber-400 flex flex-col items-center justify-center gap-2 font-medium text-sm transition-all"
        >
          <Plus className="w-6 h-6" />
          <span>Add New Session</span>
        </button>
      </div>

      {/* Create Session Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="create-session-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 id="create-session-title" className="font-serif text-xl font-bold text-amber-400">Add New Session</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form noValidate onSubmit={handleCreate} className="space-y-4">
              {errorMsg && <div className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-2 rounded">{errorMsg}</div>}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                  Session Number (Read-only)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`Session ${nextNumber}`}
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-lg px-3 py-2 text-stone-400 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="session-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Session Name *
                </label>
                <input
                  id="session-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. The Howling Crags"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="session-date" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Date *
                </label>
                <input
                  id="session-date"
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="session-desc" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  id="session-desc"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Optional session synopsis..."
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm">
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Session Dialog */}
      {isEditOpen && editingSession && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="edit-session-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 id="edit-session-title" className="font-serif text-xl font-bold text-amber-400">
                Edit Session {editingSession.sessionNumber}
              </h2>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {errorMsg && <div className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-2 rounded">{errorMsg}</div>}

              <div>
                <label htmlFor="edit-session-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Session Name *
                </label>
                <input
                  id="edit-session-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="edit-session-date" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Date *
                </label>
                <input
                  id="edit-session-date"
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="edit-session-desc" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-session-desc"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete AlertDialog */}
      {deletingSession && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="alertdialog" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-desc" className="bg-[#141414] border border-red-900/50 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 id="delete-dialog-title" className="font-serif text-xl font-bold text-red-400">
              Delete Session?
            </h2>
            <p id="delete-dialog-desc" className="text-stone-300 text-sm">
              Are you sure you want to delete <strong className="text-stone-100">Session {deletingSession.sessionNumber}: {deletingSession.name}</strong>? It will be moved to Trash.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSession(null)}
                className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm"
              >
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
