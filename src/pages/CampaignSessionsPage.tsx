import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { getData, setData } from '../services/store'
import type { Session } from '../types'

export const CampaignSessionsPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const [storeData, setStoreData] = useState(getData())

  useEffect(() => {
    const handleUpdate = () => setStoreData(getData())
    window.addEventListener('arcanum_store_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_store_updated', handleUpdate)
  }, [])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null)

  // Form states
  const [sessionName, setSessionName] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [sessionDesc, setSessionDesc] = useState('')
  const [validationError, setValidationError] = useState('')

  const campaign = storeData.campaigns.find((c) => c.id === campaignId)
  const [campName, setCampName] = useState(campaign?.name || '')
  const [campDesc, setCampDesc] = useState(campaign?.description || '')

  const handleSaveCampaignEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaign) return
    if (!campName.trim()) {
      setValidationError('Campaign name is required')
      return
    }
    const updatedCampaigns = storeData.campaigns.map((c) =>
      c.id === campaign.id
        ? { ...c, name: campName.trim(), description: campDesc.trim() || undefined }
        : c,
    )
    const updated = setData({ campaigns: updatedCampaigns })
    setStoreData(updated)
    setShowEditCampaignModal(false)
  }

  const sessions = storeData.sessions
    .filter((s) => s.campaignId === campaignId && !s.deletedAt)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const lastActiveSessionId = storeData.lastActiveSessionIdByCampaign[campaignId || '']

  if (!campaign) {
    return <div className="text-zinc-400">Campaign not found</div>
  }

  const nextSessionNumber =
    storeData.sessions.filter((s) => s.campaignId === campaignId).length + 1

  const handleOpenCreate = () => {
    setSessionName('')
    setSessionDate(new Date().toISOString().split('T')[0])
    setSessionDesc('')
    setValidationError('')
    setShowCreateModal(true)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionName.trim()) {
      setValidationError('Session name is required')
      return
    }
    const newSession: Session = {
      id: `sess-${Date.now()}`,
      campaignId: campaign.id,
      sessionNumber: nextSessionNumber,
      name: sessionName.trim(),
      date: sessionDate,
      description: sessionDesc.trim() || undefined,
    }
    const updated = setData({ sessions: [...storeData.sessions, newSession] })
    setStoreData(updated)
    setShowCreateModal(false)
  }

  const handleOpenEdit = (sess: Session, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSession(sess)
    setSessionName(sess.name)
    setSessionDate(sess.date)
    setSessionDesc(sess.description || '')
    setValidationError('')
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession) return
    if (!sessionName.trim()) {
      setValidationError('Session name is required')
      return
    }
    const updatedSessions = storeData.sessions.map((s) =>
      s.id === editingSession.id
        ? {
            ...s,
            name: sessionName.trim(),
            date: sessionDate,
            description: sessionDesc.trim() || undefined,
          }
        : s,
    )
    const updated = setData({ sessions: updatedSessions })
    setStoreData(updated)
    setEditingSession(null)
  }

  const handleConfirmDelete = () => {
    if (!sessionToDelete) return
    const updatedSessions = storeData.sessions.map((s) =>
      s.id === sessionToDelete.id ? { ...s, deletedAt: new Date().toISOString() } : s,
    )
    const updated = setData({ sessions: updatedSessions })
    setStoreData(updated)
    setSessionToDelete(null)
  }

  const handleOpenSessionScenes = (sessionId: string) => {
    setData({
      lastActiveSessionIdByCampaign: {
        ...storeData.lastActiveSessionIdByCampaign,
        [campaign.id]: sessionId,
      },
    })
    navigate(`/campaigns/${campaign.id}/sessions/${sessionId}/scenes`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-400">{campaign.name}</h1>
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mt-1">
          Campaign Sessions
        </p>
      </div>

      {/* Hero Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10 space-y-2">
          <p className="text-sm text-zinc-300">
            {campaign.description ? (
              campaign.description
            ) : (
              <button
                onClick={() => setShowEditCampaignModal(true)}
                className="italic text-zinc-500 hover:text-amber-400"
              >
                Add a description
              </button>
            )}
          </p>
          {!campaign.coverArt && (
            <button
              onClick={() => setShowEditCampaignModal(true)}
              className="text-xs text-amber-400 hover:underline block"
            >
              Add cover art
            </button>
          )}
        </div>
        <button
          onClick={() => setShowEditCampaignModal(true)}
          aria-label={`Edit ${campaign.name}`}
          className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-zinc-500 font-serif text-lg">No sessions added yet</p>
          <button
            onClick={handleOpenCreate}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded text-sm transition-colors"
          >
            Add New Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((sess) => {
            const sceneCount = storeData.sessionSceneLinks.filter(
              (l) => l.sessionId === sess.id,
            ).length
            const isLastActive = lastActiveSessionId === sess.id

            return (
              <div
                key={sess.id}
                onClick={() => handleOpenSessionScenes(sess.id)}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-5 cursor-pointer flex justify-between items-start gap-4 transition-colors relative"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase">
                      Session {sess.sessionNumber}
                    </span>
                    {isLastActive && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-semibold uppercase animate-pulse">
                        Last Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-serif text-amber-400 font-semibold">{sess.name}</h3>
                  {sess.description && (
                    <p className="text-xs text-zinc-400 line-clamp-1">{sess.description}</p>
                  )}
                  <div className="text-xs text-zinc-500">
                    {sess.date} · {sceneCount} Scenes
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEdit(sess, e)}
                    aria-label={`Edit ${sess.name}`}
                    className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSessionToDelete(sess)
                    }}
                    aria-label={`Delete ${sess.name}`}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add New Session Card */}
          <button
            onClick={handleOpenCreate}
            className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-amber-400 transition-colors min-h-[140px]"
          >
            <Plus className="w-6 h-6" />
            <span className="font-medium text-sm">Add New Session</span>
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">Add New Session</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Session Number</label>
                <input
                  type="text"
                  readOnly
                  value={`Session ${nextSessionNumber}`}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Session Name *</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  placeholder="The Dark Arrival"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">{validationError}</span>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description (optional)</label>
                <textarea
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
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

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">Edit Session</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Session Name *</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">{validationError}</span>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
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

      {/* Delete Confirmation AlertDialog */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-serif font-semibold text-amber-400">Delete Session</h3>
            <p className="text-sm text-zinc-300">
              Are you sure you want to delete "{sessionToDelete.name}"? It will be moved to Trash.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditCampaignModal && (
        <div role="dialog" className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">
              Edit Campaign ({campaign.name})
            </h2>
            <form onSubmit={handleSaveCampaignEdit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  value={campName || campaign.name}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">{validationError}</span>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  value={campDesc ?? campaign.description ?? ''}
                  onChange={(e) => setCampDesc(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditCampaignModal(false)}
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
    </div>
  )
}
