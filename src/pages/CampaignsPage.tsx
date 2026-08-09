import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, BookOpen, Upload, Undo2 } from 'lucide-react'
import { getDb, saveDb, type Campaign, type Session } from '../lib/storage/db'

export const CampaignsPage: React.FC = () => {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverArt, setCoverArt] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [undoCampaign, setUndoCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const loadData = () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      const db = getDb()
      const validCampaigns = db.campaigns
        .filter((c) => !c.deletedAt)
        .sort(
          (a, b) => new Date(b.lastPlayedAt || 0).getTime() - new Date(a.lastPlayedAt || 0).getTime()
        )
      setCampaigns(validCampaigns)
      setSessions(db.sessions.filter((s) => !s.deletedAt))
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getSessionCount = (campaignId: string) => {
    return sessions.filter((s) => s.campaignId === campaignId).length
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Campaign name is required')
      return
    }

    const db = getDb()
    const newCampaign: Campaign = {
      id: `c_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      coverArt: coverArt || undefined,
      lastPlayedAt: new Date().toISOString(),
    }

    db.campaigns.unshift(newCampaign)
    saveDb(db)
    setCampaigns(db.campaigns.filter((c) => !c.deletedAt))

    setName('')
    setDescription('')
    setCoverArt('')
    setErrorMsg('')
    setIsModalOpen(false)
  }

  const handleSoftDelete = (campaign: Campaign) => {
    const db = getDb()
    const target = db.campaigns.find((c) => c.id === campaign.id)
    if (target) {
      target.deletedAt = new Date().toISOString()
      saveDb(db)
      setCampaigns(db.campaigns.filter((c) => !c.deletedAt))
      setUndoCampaign(campaign)
    }
  }

  const handleUndo = () => {
    if (!undoCampaign) return
    const db = getDb()
    const target = db.campaigns.find((c) => c.id === undoCampaign.id)
    if (target) {
      delete target.deletedAt
      saveDb(db)
      setCampaigns(db.campaigns.filter((c) => !c.deletedAt))
      setUndoCampaign(null)
    }
  }

  const handleOpenSessions = (campaignId: string) => {
    const db = getDb()
    const target = db.campaigns.find((c) => c.id === campaignId)
    if (target) {
      target.lastPlayedAt = new Date().toISOString()
      saveDb(db)
    }
    navigate(`/campaigns/${campaignId}/sessions`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-amber-400">Active Campaigns</h1>
        <p className="text-sm text-neutral-400">Manage your campaigns.</p>
      </div>

      {undoCampaign && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-lg p-3 flex items-center justify-between text-sm text-amber-200">
          <span>Campaign "{undoCampaign.name}" moved to Trash.</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 font-semibold text-amber-400 hover:text-amber-300"
          >
            <Undo2 className="w-4 h-4" /> Undo
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 bg-neutral-900 animate-pulse rounded-xl" />
          <div className="h-24 bg-neutral-900 animate-pulse rounded-xl" />
        </div>
      ) : loadError ? (
        <div className="bg-red-950/50 border border-red-800 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-300 font-medium">Failed to load campaigns list</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-[#121212] border border-neutral-800 rounded-xl p-10 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-amber-500/40 mx-auto" />
            <h2 className="text-xl font-serif font-semibold text-neutral-300">No campaigns yet</h2>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              Start your journey by creating a campaign for your party.
            </p>
          </div>

          {/* Create Campaign Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            data-testid="create-campaign-button"
            className="w-full border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-6 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Campaign</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const count = getSessionCount(campaign.id)
            const countLabel = count === 1 ? '1 session' : `${count} sessions`
            const ctaLabel = count === 0 ? 'Start' : 'Resume'

            return (
              <div
                key={campaign.id}
                data-testid={`campaign-card-${campaign.name}`}
                className="bg-[#121212] border border-neutral-800 rounded-xl p-4 md:p-5 flex items-center justify-between gap-4 transition-colors hover:border-neutral-700"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-lg bg-neutral-900 border border-neutral-800 shrink-0 overflow-hidden flex items-center justify-center text-amber-500/40">
                    {campaign.coverArt ? (
                      <img
                        src={campaign.coverArt}
                        alt={campaign.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h3 className="font-serif text-lg font-semibold text-amber-300 truncate">
                      {campaign.name}
                    </h3>
                    {campaign.description && (
                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 font-medium">{countLabel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenSessions(campaign.id)}
                    aria-label={`${ctaLabel} ${campaign.name}`}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors"
                  >
                    {ctaLabel}
                  </button>

                  <button
                    onClick={() => handleSoftDelete(campaign)}
                    aria-label={`Delete ${campaign.name}`}
                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Create Campaign Card below list */}
          <button
            onClick={() => setIsModalOpen(true)}
            data-testid="create-campaign-button"
            className="w-full border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-5 flex items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Campaign</span>
          </button>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-md w-full space-y-5">
            <h2 className="font-serif text-xl font-bold text-amber-400">Create Campaign</h2>

            {errorMsg && (
              <p className="text-xs text-red-400 font-medium bg-red-950/50 border border-red-800 p-2 rounded">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shadows of Barovia"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes or summary..."
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Cover Art
                </label>
                <div
                  onClick={() => setCoverArt('https://placeholder.art/cover.jpg')}
                  className="border border-dashed border-neutral-700 hover:border-amber-500/50 p-4 rounded-lg text-center cursor-pointer text-xs text-neutral-400 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{coverArt ? 'Cover Art Selected' : 'Click to select cover art'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setErrorMsg('')
                  }}
                  className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm"
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
