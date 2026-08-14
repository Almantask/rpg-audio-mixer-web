import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getActiveCampaigns, createCampaign, softDeleteCampaign, touchCampaignPlayed } from '../services/campaignService'
import { getActiveSessionsForCampaign } from '../services/sessionService'
import type { Campaign } from '../types/campaign'
import { Plus, Trash2, BookOpen, X } from 'lucide-react'

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')
  const [coverInput, setCoverInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const refreshList = () => {
    setCampaigns(getActiveCampaigns())
  }

  useEffect(() => {
    refreshList()
  }, [])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim()) {
      setErrorMsg('Campaign name is required')
      return
    }
    createCampaign({
      name: nameInput,
      description: descInput,
      coverUrl: coverInput,
    })
    setNameInput('')
    setDescInput('')
    setCoverInput('')
    setErrorMsg('')
    setIsModalOpen(false)
    refreshList()
  }

  const handleDelete = (id: string) => {
    softDeleteCampaign(id)
    refreshList()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">Active Campaigns</h1>
        <p className="text-stone-400 text-sm mt-1">Manage your campaigns.</p>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-10 space-y-3 bg-stone-900/30 rounded-xl border border-dashed border-stone-800">
            <BookOpen className="w-12 h-12 text-stone-600 mx-auto" />
            <h2 className="font-serif text-xl text-amber-400 font-semibold">No campaigns yet</h2>
            <p className="text-stone-400 text-sm">Get started by creating your first campaign below.</p>
          </div>
        ) : (
          campaigns.map((camp) => {
            const sessions = getActiveSessionsForCampaign(camp.id)
            const sessionCount = sessions.length
            const sessionLabel = sessionCount === 1 ? '1 session' : `${sessionCount} sessions`
            const ctaText = sessionCount === 0 ? 'Start' : 'Resume'

            return (
              <div
                key={camp.id}
                className="bg-[#121212] border border-amber-900/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-amber-700/40"
              >
                {/* Left side info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-stone-800 border border-stone-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-amber-500">
                    {camp.coverUrl ? (
                      <img src={camp.coverUrl} alt={camp.name} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-7 h-7 text-amber-500/70" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-serif text-xl font-bold text-stone-100">{camp.name}</h2>
                    {camp.description && (
                      <p className="text-stone-400 text-sm line-clamp-2">{camp.description}</p>
                    )}
                    <div className="text-xs text-stone-500 font-sans font-medium">{sessionLabel}</div>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    type="button"
                    aria-label={`Delete campaign ${camp.name}`}
                    onClick={() => handleDelete(camp.id)}
                    className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <Link
                    to={`/campaigns/${camp.id}/sessions`}
                    onClick={() => touchCampaignPlayed(camp.id)}
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-sm transition-colors shadow-md shadow-amber-950/40"
                  >
                    {ctaText}
                  </Link>
                </div>
              </div>
            )
          })
        )}

        {/* Create Campaign Card */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 border-2 border-dashed border-amber-900/40 hover:border-amber-600/60 rounded-xl bg-stone-900/20 hover:bg-stone-900/40 text-amber-400 flex items-center justify-center gap-2 font-medium text-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Create Campaign Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="modal-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 id="modal-title" className="font-serif text-xl font-bold text-amber-400">Create Campaign</h2>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setErrorMsg('')
                }}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {errorMsg && (
                <div className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-2 rounded">
                  {errorMsg}
                </div>
              )}

              <div>
                <label htmlFor="campaign-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Campaign Name *
                </label>
                <input
                  id="campaign-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Curse of Strahd"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="campaign-desc" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  id="campaign-desc"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Optional campaign notes or pitch..."
                  rows={3}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="campaign-cover" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Cover Image URL
                </label>
                <input
                  id="campaign-cover"
                  type="text"
                  value={coverInput}
                  onChange={(e) => setCoverInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setErrorMsg('')
                  }}
                  className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
