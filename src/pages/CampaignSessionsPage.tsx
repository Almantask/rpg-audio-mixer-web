import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Edit3, Trash2, Play, Calendar, FileText, X, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Session } from '../types'

export const CampaignSessionsPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { campaigns, sessions, createSession, updateSession, deleteSession } = useApp()

  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0]
  const campaignSessions = sessions.filter((s) => s.campaignId === (campaign?.id || ''))

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSession, setDeletingSession] = useState<Session | null>(null)

  // Form inputs
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')

  if (!campaign) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="font-serif text-2xl text-red-400">Campaign not found</h2>
        <Link to="/campaigns" className="text-amber-400 underline">
          Return to Campaigns
        </Link>
      </div>
    )
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createSession(campaign.id, title.trim(), notes.trim())
    setTitle('')
    setNotes('')
    setIsCreateOpen(false)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession || !title.trim()) return
    updateSession(editingSession.id, title.trim(), notes.trim())
    setEditingSession(null)
  }

  const confirmDelete = () => {
    if (!deletingSession) return
    deleteSession(deletingSession.id)
    setDeletingSession(null)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header per platform-design */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
        <Link to="/campaigns" className="hover:underline">
          CAMPAIGN
        </Link>
        <span>&gt;</span>
        <span className="text-gray-300">{campaign.name}</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-900/30">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-300">{campaign.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {campaign.system ? `${campaign.system} • ` : ''}
            {campaign.description || 'Campaign Sessions Log'}
          </p>
        </div>
        <button
          onClick={() => {
            setTitle(`Session ${campaignSessions.length + 1}`)
            setNotes('')
            setIsCreateOpen(true)
          }}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg shadow transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus size={18} />
          <span>Create Session</span>
        </button>
      </div>

      {/* Sessions List */}
      {campaignSessions.length === 0 ? (
        <div className="bg-[#141414] border border-dashed border-gray-800 rounded-xl p-12 text-center space-y-4">
          <Calendar size={48} className="mx-auto text-gray-600" />
          <h2 className="font-serif text-xl font-bold text-gray-300">No sessions recorded yet</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Create a session to organize audio scenes and prepare for your next game night.
          </p>
          <button
            onClick={() => {
              setTitle('Session 1')
              setNotes('')
              setIsCreateOpen(true)
            }}
            className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 font-medium text-sm inline-flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create Session 1</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaignSessions.map((sess) => (
            <div
              key={sess.id}
              className="bg-[#171717] border border-yellow-900/30 hover:border-amber-500/40 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className="font-serif text-xl font-bold text-amber-200">{sess.title}</h2>
                  <span className="text-xs text-gray-500 flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
                {sess.notes && (
                  <p className="text-sm text-gray-400 flex items-start space-x-2">
                    <FileText size={16} className="text-amber-500/70 shrink-0 mt-0.5" />
                    <span>{sess.notes}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 self-end md:self-center">
                <button
                  onClick={() => {
                    setEditingSession(sess)
                    setTitle(sess.title)
                    setNotes(sess.notes || '')
                  }}
                  className="p-2 text-gray-400 hover:text-amber-300 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition"
                  title="Edit session"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => setDeletingSession(sess)}
                  className="p-2 text-gray-400 hover:text-red-400 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition"
                  title="Delete session"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => navigate(`/campaigns/${campaign.id}/sessions/${sess.id}/scenes`)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Play size={14} className="fill-current" />
                  <span>Open Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-amber-300">New Game Session</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Session Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Outline objectives, location, or notes..."
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-bold rounded-lg shadow"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-amber-300">Edit Session</h2>
              <button onClick={() => setEditingSession(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Session Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-bold rounded-lg shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory AlertDialog Delete Session Confirmation per platform-design */}
      {deletingSession && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-red-800/60 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle size={24} />
              <h2 className="font-serif text-xl font-bold text-gray-100">Delete Session?</h2>
            </div>
            <p className="text-sm text-gray-300">
              Are you sure you want to delete <strong className="text-amber-300">{deletingSession.title}</strong>? It will be soft-deleted to Trash for 7 days.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingSession(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shadow"
              >
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
