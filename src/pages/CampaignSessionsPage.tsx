import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Calendar, Layers, Shield } from 'lucide-react'
import { db } from '../storage/db'
import type { Campaign, Session } from '../types'
import { CreateSessionModal } from '../components/sessions/CreateSessionModal'
import { EditSessionModal } from '../components/sessions/EditSessionModal'

interface CampaignSessionsPageProps {
  initialLoading?: boolean
  failCreate?: boolean
  failSave?: boolean
}

export const CampaignSessionsPage: React.FC<CampaignSessionsPageProps> = ({
  initialLoading = false,
  failCreate = false,
  failSave = false,
}) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading] = useState(initialLoading)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<Session | null>(null)

  const reloadData = () => {
    if (!campaignId) return
    const camp = db.getCampaignById(campaignId)
    setCampaign(camp || null)
    if (camp) {
      const sessList = db.getSessionsByCampaign(camp.id)
      // Sort by date (most recent first)
      const sorted = [...sessList].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setSessions(sorted)
    }
  }

  useEffect(() => {
    reloadData()
    const handleUpdate = () => reloadData()
    window.addEventListener('arcanum_db_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_db_updated', handleUpdate)
  }, [campaignId])

  if (!campaign) {
    return (
      <div className="text-center py-12 text-neutral-400">
        Campaign not found.
      </div>
    )
  }

  const handleCreateSession = async (
    name: string,
    date: string,
    description?: string,
    coverUrl?: string
  ) => {
    if (failCreate) {
      throw new Error('Create session failed')
    }
    db.createSession(campaign.id, name, date, description, coverUrl)
    reloadData()
  }

  const handleEditSession = async (id: string, updates: Partial<Session>) => {
    if (failSave) {
      throw new Error('Save session failed')
    }
    db.updateSession(id, updates)
    reloadData()
  }

  const handleDeleteConfirm = () => {
    if (deletingSession) {
      db.deleteSession(deletingSession.id)
      setDeletingSession(null)
      reloadData()
    }
  }

  const handleOpenSession = (session: Session) => {
    db.setLastActiveSession(campaign.id, session.id)
    navigate(`/campaigns/${campaign.id}/sessions/${session.id}`)
  }

  const lastActiveSessionId = db.getState().lastActiveSessionIdByCampaign[campaign.id]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Campaign Hero Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="h-40 bg-neutral-800 relative flex items-end p-6">
          {campaign.coverUrl && (
            <img
              src={campaign.coverUrl}
              alt={campaign.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="relative z-10 space-y-1">
            <h1 className="text-3xl font-extrabold text-neutral-100">{campaign.name}</h1>
            <p className="text-sm text-neutral-300 font-medium">
              {campaign.description ? (
                campaign.description
              ) : (
                <button
                  onClick={() => {
                    const desc = prompt('Enter campaign description:')
                    if (desc) {
                      db.getState().campaigns.find((c) => c.id === campaign.id)!.description = desc
                      reloadData()
                    }
                  }}
                  className="text-amber-400 hover:underline"
                >
                  Add a description
                </button>
              )}
            </p>
            <span className="inline-block text-xs font-semibold text-amber-400/90 uppercase tracking-wider">
              Campaign Sessions
            </span>
          </div>
        </div>
      </div>

      {/* Sessions Grid / Loading / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-neutral-900 border border-neutral-800 rounded-xl h-48 animate-pulse p-4 space-y-3"
            >
              <div className="bg-neutral-800 h-5 w-1/3 rounded" />
              <div className="bg-neutral-800 h-6 w-2/3 rounded" />
              <div className="bg-neutral-800 h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-200">No sessions yet</h2>
          <p className="text-neutral-400 text-sm max-w-sm mx-auto">
            Add a play night session to organise your scene soundtracks and audio atmospheres.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-6 py-2.5 rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add New Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((sess) => {
            const isLastActive = sess.id === lastActiveSessionId
            const sceneCount = sess.sceneIds.length
            const formattedDate = new Date(sess.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })

            return (
              <div
                key={sess.id}
                onClick={() => handleOpenSession(sess)}
                className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-xl p-5 shadow-lg cursor-pointer flex flex-col justify-between transition-all group"
                data-session-card={sess.number}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      {sess.number}
                    </span>
                    {isLastActive && (
                      <span className="text-xs font-bold bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full">
                        Last Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                      {sess.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {sceneCount} Scenes
                      </span>
                    </div>
                  </div>

                  {sess.description && (
                    <p className="text-sm text-neutral-400 line-clamp-2">
                      {sess.description}
                    </p>
                  )}
                </div>

                <div
                  className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-neutral-800/60"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setEditingSession(sess)}
                    aria-label={`Edit ${sess.number}`}
                    className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSession(sess)}
                    aria-label={`Delete ${sess.number}`}
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add New Session Card */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-neutral-900/40 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl p-8 flex flex-col items-center justify-center text-neutral-400 hover:text-amber-400 transition-colors min-h-[200px] group"
          >
            <div className="p-3 rounded-full bg-neutral-800 group-hover:bg-amber-500/20 text-neutral-300 group-hover:text-amber-400 mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold">Add New Session</span>
          </button>
        </div>
      )}

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateOpen}
        campaignName={campaign.name}
        nextSessionNumber={`Session ${sessions.length + 1}`}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleCreateSession}
      />

      {/* Edit Session Modal */}
      <EditSessionModal
        isOpen={!!editingSession}
        session={editingSession}
        onClose={() => setEditingSession(null)}
        onConfirm={handleEditSession}
      />

      {/* Delete Confirmation Modal */}
      {deletingSession && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-neutral-100">Delete Session?</h3>
            <p className="text-sm text-neutral-300">
              Are you sure you want to move "{deletingSession.number} – {deletingSession.name}" to Trash?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingSession(null)}
                className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
