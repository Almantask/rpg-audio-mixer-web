import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Dialog } from '../components/common/Dialog'

export const CampaignsView: React.FC = () => {
  const navigate = useNavigate()
  const { campaigns, sessions, createCampaign, softDeleteCampaign } = useApp()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createCampaign({ name: name.trim(), description: description.trim() || undefined })
    setName('')
    setDescription('')
    setIsCreateOpen(false)
  }

  // Sorted by most recently played / created
  const sortedCampaigns = [...campaigns].sort(
    (a, b) => (b.lastPlayedAt || b.createdAt) - (a.lastPlayedAt || a.createdAt),
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">Active Campaigns</h1>
        <p className="text-sm text-neutral-400">Manage your campaigns.</p>
      </div>

      <div className="space-y-4">
        {sortedCampaigns.map((camp) => {
          const campSessions = sessions.filter((s) => s.campaignId === camp.id)
          const sessionCount = campSessions.length
          const countLabel =
            sessionCount === 1 ? '1 session' : `${sessionCount} sessions`

          return (
            <div
              key={camp.id}
              className="group relative rounded-xl border border-neutral-800 bg-neutral-900 p-5 flex items-center justify-between space-x-4 hover:border-amber-500/40 transition shadow-lg"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-16 h-16 rounded-lg bg-neutral-800 border border-neutral-700 flex-shrink-0 flex items-center justify-center font-serif text-amber-400 text-xl font-bold">
                  {camp.name.charAt(0)}
                </div>

                <div className="min-w-0 space-y-1">
                  <h3 className="font-serif text-xl font-bold text-neutral-100 truncate">
                    {camp.name}
                  </h3>
                  {camp.description && (
                    <p className="text-sm text-neutral-400 line-clamp-2">{camp.description}</p>
                  )}
                  <p className="text-xs text-amber-400/80 font-medium">{countLabel}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => softDeleteCampaign(camp.id)}
                  className="p-2 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                  aria-label={`Delete ${camp.name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate(`/campaigns/${camp.id}/sessions`)}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition flex items-center space-x-1.5"
                >
                  <span>{sessionCount > 0 ? 'Resume' : 'Start'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}

        {/* Create Campaign Card */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="w-full rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-neutral-900/40 hover:bg-neutral-900/80 p-5 flex items-center justify-center space-x-2 text-amber-400 font-bold transition group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Create Dialog */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Campaign">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shadows of the Underdark"
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
              placeholder="Campaign background or notes..."
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
              Create
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
