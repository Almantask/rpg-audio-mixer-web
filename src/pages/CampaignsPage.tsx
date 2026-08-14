import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Play, RefreshCw, AlertTriangle } from 'lucide-react'
import { db } from '../storage/db'
import type { Campaign } from '../types'
import { CreateCampaignModal } from '../components/campaigns/CreateCampaignModal'

interface CampaignsPageProps {
  initialLoading?: boolean
  initialError?: boolean
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({
  initialLoading = false,
  initialError = false,
}) => {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState(initialError)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [undoCampaign, setUndoCampaign] = useState<Campaign | null>(null)

  const reloadCampaigns = () => {
    setLoading(true)
    setError(false)
    try {
      const camps = db.getCampaigns()
      // Sort by lastPlayedDate (most recent first), then createdAt
      const sorted = [...camps].sort((a, b) => {
        const dateA = a.lastPlayedDate || a.createdAt
        const dateB = b.lastPlayedDate || b.createdAt
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
      setCampaigns(sorted)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadCampaigns()
    const handleUpdate = () => reloadCampaigns()
    window.addEventListener('arcanum_db_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_db_updated', handleUpdate)
  }, [])

  const handleCreate = (name: string, description?: string, coverUrl?: string) => {
    db.createCampaign(name, description, coverUrl)
    reloadCampaigns()
  }

  const handleDelete = (campaign: Campaign) => {
    db.deleteCampaign(campaign.id)
    setUndoCampaign(campaign)
    reloadCampaigns()
  }

  const handleUndo = () => {
    if (undoCampaign) {
      db.restoreCampaign(undoCampaign.id)
      setUndoCampaign(null)
      reloadCampaigns()
    }
  }

  const handleResumeOrStart = (campaign: Campaign) => {
    db.touchCampaignPlayed(campaign.id)
    navigate(`/campaigns/${campaign.id}`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-100">Active Campaigns</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Manage your campaign story arcs and sessions
          </p>
        </div>
      </div>

      {/* Undo Toast */}
      {undoCampaign && (
        <div className="bg-amber-900/40 border border-amber-500/50 rounded-lg p-3 flex items-center justify-between text-amber-200 text-sm">
          <span>Campaign "{undoCampaign.name}" moved to Trash.</span>
          <button
            onClick={handleUndo}
            className="underline font-semibold hover:text-amber-100"
          >
            Undo
          </button>
        </div>
      )}

      {/* Error state */}
      {error ? (
        <div className="bg-red-950/40 border border-red-800 rounded-xl p-8 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-red-200">Failed to load campaigns</h2>
          <button
            onClick={reloadCampaigns}
            className="inline-flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : loading ? (
        /* Loading skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-neutral-900 border border-neutral-800 rounded-xl h-64 animate-pulse p-4 space-y-4"
            >
              <div className="bg-neutral-800 h-32 rounded-lg" />
              <div className="bg-neutral-800 h-6 w-3/4 rounded" />
              <div className="bg-neutral-800 h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        /* Empty state */
        <div className="space-y-6 text-center py-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 space-y-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-neutral-200">No campaigns yet</h2>
            <p className="text-neutral-400 text-sm">
              Create your first campaign to begin organising play nights and sound scenes.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Create Campaign
            </button>
          </div>
        </div>
      ) : (
        /* Campaign list grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const sessions = db.getSessionsByCampaign(camp.id)
            const sessionCount = sessions.length
            const sessionLabel =
              sessionCount === 1 ? '1 session' : `${sessionCount} sessions`
            const hasSessions = sessionCount > 0

            return (
              <div
                key={camp.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-neutral-700 transition-colors"
                data-campaign-card={camp.name}
              >
                <div>
                  <div className="h-36 bg-neutral-800 relative overflow-hidden">
                    {camp.coverUrl ? (
                      <img
                        src={camp.coverUrl}
                        alt={camp.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-950/20 text-amber-500 font-bold text-2xl">
                        {camp.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(camp)}
                      aria-label={`Delete ${camp.name}`}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-900/80 text-neutral-300 hover:text-white rounded-lg backdrop-blur-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-xl font-bold text-neutral-100">{camp.name}</h3>
                    {camp.description && (
                      <p className="text-sm text-neutral-400 line-clamp-2">
                        {camp.description}
                      </p>
                    )}
                    <span className="inline-block text-xs font-semibold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      {sessionLabel}
                    </span>
                  </div>
                </div>

                <div className="p-4 border-t border-neutral-800/80">
                  <button
                    onClick={() => handleResumeOrStart(camp)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {hasSessions ? 'Resume' : 'Start'}
                  </button>
                </div>
              </div>
            )
          })}

          {/* Create Campaign Card below the campaign list */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-neutral-900/40 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl p-8 flex flex-col items-center justify-center text-neutral-400 hover:text-amber-400 transition-colors min-h-[260px] group"
          >
            <div className="p-3 rounded-full bg-neutral-800 group-hover:bg-amber-500/20 text-neutral-300 group-hover:text-amber-400 mb-3">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold text-lg">Create Campaign</span>
            <span className="text-xs text-neutral-500 mt-1">Start a new story arc</span>
          </button>
        </div>
      )}

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreate}
      />
    </div>
  )
}
