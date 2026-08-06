import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar, AlertTriangle, Image as ImageIcon } from 'lucide-react'
import type { Campaign, Session } from '../types'

interface SessionsProps {
  campaign: Campaign
  sessions: Session[]
  onCreateSession: (name: string, description: string) => void
  onEditSession: (id: string, name: string, description: string) => void
  onDeleteSession: (id: string) => void
  onOpenSession: (id: string) => void
  onOpenEditCampaign: () => void
}

export const Sessions: React.FC<SessionsProps> = ({
  campaign,
  sessions,
  onCreateSession,
  onEditSession,
  onDeleteSession,
  onOpenSession,
  onOpenEditCampaign,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<Session | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [validationError, setValidationError] = useState(false)

  const activeSessions = sessions.filter((s) => s.campaignId === campaign.id && !s.deletedAt)

  // Find most recently opened session for "Last Active" badge
  const sortedSessions = [...activeSessions].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const lastActiveSessionId = sortedSessions[0]?.id

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setValidationError(true)
      return
    }
    onCreateSession(name.trim(), description.trim())
    setName('')
    setDescription('')
    setValidationError(false)
    setIsCreateOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession || !name.trim()) {
      setValidationError(true)
      return
    }
    onEditSession(editingSession.id, name.trim(), description.trim())
    setEditingSession(null)
    setName('')
    setDescription('')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Campaign Sessions Hero */}
      <div className="bg-gradient-to-br from-[#1A1813] to-[#121212] border border-amber-900/30 rounded-xl p-6 relative space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400">Campaign Sessions</span>
            <h1 className="text-3xl font-serif font-bold text-gray-100">{campaign.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label={`Edit Campaign ${campaign.name}`}
              onClick={onOpenEditCampaign}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        </div>

        {campaign.description && (
          <p className="text-gray-300 text-sm">{campaign.description}</p>
        )}
        <div className="flex items-center gap-4 pt-1">
          {!campaign.description && (
            <button
              onClick={onOpenEditCampaign}
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              + Add a description
            </button>
          )}
          <button
            onClick={onOpenEditCampaign}
            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Add cover art
          </button>
        </div>
      </div>

      {/* Header & Create Action */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-serif font-bold text-gray-200">Sessions List</h2>
        {activeSessions.length > 0 && (
          <button
            onClick={() => {
              const nextNumber = activeSessions.length + 1
              setName(`Session ${nextNumber}`)
              setDescription('')
              setValidationError(false)
              setIsCreateOpen(true)
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Session</span>
          </button>
        )}
      </div>

      {activeSessions.length === 0 ? (
        <div className="bg-[#121212] border border-amber-900/20 rounded-xl p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-amber-500/40 mx-auto" />
          <h3 className="text-xl font-serif font-semibold text-gray-200">No sessions yet</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Create a session for {campaign.name} to start adding audio scenes.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setName('Session 1')
                setDescription('')
                setValidationError(false)
                setIsCreateOpen(true)
              }}
              className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-lg text-sm"
            >
              Add New Session
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedSessions.map((sess, idx) => {
            const isLastActive = sess.id === lastActiveSessionId

            return (
              <div
                key={sess.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenSession(sess.id)}
                className={`
                  bg-[#121212] border rounded-xl p-5 flex flex-col justify-between transition cursor-pointer group relative
                  ${isLastActive ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-amber-900/30 hover:border-amber-500/50'}
                `}
              >
                {isLastActive && (
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider rounded-full">
                    Last Active
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Session {sess.number || (idx + 1)}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-gray-100 group-hover:text-amber-400 transition">
                        {sess.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        aria-label={`Edit ${sess.name}`}
                        onClick={() => {
                          setEditingSession(sess)
                          setName(sess.name)
                          setDescription(sess.description || '')
                        }}
                        className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-white/5"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        aria-label={`Delete ${sess.name}`}
                        onClick={() => setDeletingSession(sess)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-white/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {sess.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">{sess.description}</p>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-amber-900/10 mt-4">
                  <span className="text-xs text-gray-500">
                    {sess.metaText || `${sess.date || new Date(sess.createdAt).toLocaleDateString()} · ${sess.sceneCount ?? 0} Scenes`}
                  </span>
                  <button className="text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                    View Scenes →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-400">Create Session</h2>
            <div className="text-xs text-gray-400">Session Number: Read-only auto-assigned</div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Session Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setValidationError(false)
                  }}
                  placeholder="e.g. The Dark Arrival"
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">A session name is required</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Session notes..."
                  rows={3}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-400">Edit Session</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Session Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">A session name is required</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-red-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-serif font-bold">Delete Session?</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Are you sure you want to move "{deletingSession.name}" to Trash?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSession(null)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSession(deletingSession.id)
                  setDeletingSession(null)
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg"
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
