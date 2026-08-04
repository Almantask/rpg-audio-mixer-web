import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Dialog } from '../components/common/Dialog'

export const CampaignsPage: React.FC = () => {
  const navigate = useNavigate()
  const { campaigns, sessions, createCampaign, softDeleteCampaign } = useApp()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    createCampaign(newName.trim(), newDescription.trim() || undefined)
    setNewName('')
    setNewDescription('')
    setIsCreateOpen(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-yellow-500">Active Campaigns</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your campaigns.</p>
      </div>

      {/* Campaigns List (Vertical full-width rows) */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-12 bg-[#141414] rounded-xl border border-yellow-900/20 p-8 space-y-3">
            <BookOpen size={48} className="mx-auto text-yellow-500/40" />
            <h3 className="font-serif text-2xl font-bold text-yellow-500">No campaigns yet</h3>
            <p className="text-sm text-gray-400">Create your first campaign to begin adding sessions.</p>
          </div>
        ) : (
          campaigns.map((camp) => {
            const campSessions = sessions.filter((s) => s.campaignId === camp.id)
            const sessionCount = campSessions.length
            const sessionCountLabel =
              sessionCount === 1 ? '1 session' : `${sessionCount} sessions`
            const hasSessions = sessionCount > 0

            return (
              <div
                key={camp.id}
                className="w-full bg-[#161616] border border-yellow-900/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-yellow-900/60"
              >
                {/* Left side info */}
                <div className="flex items-start gap-4">
                  {/* Cover thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-yellow-900/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                    <BookOpen size={28} className="text-yellow-500/70" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-bold text-yellow-500">{camp.name}</h3>
                    {camp.description && (
                      <p className="text-xs text-gray-400 line-clamp-2">{camp.description}</p>
                    )}
                    <p className="text-xs text-gray-500 font-medium">{sessionCountLabel}</p>
                  </div>
                </div>

                {/* Right side CTAs */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => navigate(`/campaigns/${camp.id}/sessions`)}
                    className="px-5 py-2.5 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors"
                  >
                    {hasSessions ? 'Resume' : 'Start'}
                  </button>
                  <button
                    onClick={() => softDeleteCampaign(camp.id)}
                    className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Move to Trash"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* Create Campaign Card */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="w-full p-6 border-2 border-dashed border-yellow-900/40 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/60 transition-all flex items-center justify-center gap-3 text-yellow-500 font-serif font-bold text-lg"
        >
          <Plus size={24} />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Create Campaign Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Campaign"
        subtitle="Add a new campaign to your collection."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Shadows of the Underdark"
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Brief summary of the adventure..."
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
    </div>
  )
}
