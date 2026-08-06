import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'
import type { Campaign, Session } from '../types'

interface CampaignsProps {
  campaigns: Campaign[]
  sessions?: Session[]
  initialEditingCampaignId?: string | null
  onCreateCampaign: (name: string, description: string) => void
  onEditCampaign: (id: string, name: string, description: string) => void
  onDeleteCampaign: (id: string) => void
  onOpenCampaign: (id: string) => void
}

export const Campaigns: React.FC<CampaignsProps> = ({
  campaigns,
  sessions = [],
  initialEditingCampaignId,
  onCreateCampaign,
  onEditCampaign,
  onDeleteCampaign,
  onOpenCampaign,
}) => {
  const activeCampaigns = campaigns.filter((c) => !c.deletedAt)
  const initialCamp = initialEditingCampaignId ? activeCampaigns.find((c) => c.id === initialEditingCampaignId) : null

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(initialCamp || null)
  const [name, setName] = useState(initialCamp?.name || '')
  const [description, setDescription] = useState(initialCamp?.description || '')
  const [validationError, setValidationError] = useState(false)

  useEffect(() => {
    if (initialEditingCampaignId) {
      const target = campaigns.filter((c) => !c.deletedAt).find((c) => c.id === initialEditingCampaignId || c.name.toLowerCase() === initialEditingCampaignId.toLowerCase())
      if (target) {
        setEditingCampaign(target)
        setName(target.name)
        setDescription(target.description || '')
      }
    }
  }, [initialEditingCampaignId, campaigns])

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setValidationError(true)
      return
    }
    onCreateCampaign(name.trim(), description.trim())
    setName('')
    setDescription('')
    setValidationError(false)
    setIsCreateOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCampaign || !name.trim()) {
      setValidationError(true)
      return
    }
    onEditCampaign(editingCampaign.id, name.trim(), description.trim())
    setEditingCampaign(null)
    setName('')
    setDescription('')
    setValidationError(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-400">Active Campaigns</h1>
          <p className="text-gray-400 text-sm">Manage your RPG campaigns and sessions.</p>
        </div>
        <button
          onClick={() => {
            setName('')
            setDescription('')
            setValidationError(false)
            setIsCreateOpen(true)
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {activeCampaigns.length === 0 ? (
        <div className="bg-[#121212] border border-amber-900/20 rounded-xl p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-amber-500/40 mx-auto" />
          <h3 className="text-xl font-serif font-semibold text-gray-200">No campaigns yet</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Get started by creating your first campaign to organize audio for your gaming sessions.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setName('')
                setDescription('')
                setValidationError(false)
                setIsCreateOpen(true)
              }}
              className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg"
            >
              Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCampaigns.map((camp) => {
              const campSessions = sessions.filter((s) => s.campaignId === camp.id && !s.deletedAt)
              const count = campSessions.length
              const sessionLabel = count === 1 ? '1 session' : `${count} sessions`

              return (
                <div
                  key={camp.id}
                  className="bg-[#121212] border border-amber-900/30 hover:border-amber-500/50 rounded-xl p-5 flex flex-col justify-between transition group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3
                        className="text-xl font-serif font-bold text-gray-100"
                      >
                        {camp.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          aria-label={`Edit ${camp.name}`}
                          onClick={() => {
                            setEditingCampaign(camp)
                            setName(camp.name)
                            setDescription(camp.description || '')
                            setValidationError(false)
                          }}
                          className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-white/5"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          aria-label={`Delete ${camp.name}`}
                          onClick={() => onDeleteCampaign(camp.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-white/5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {camp.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">{camp.description}</p>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-amber-900/10 mt-4">
                    <span className="text-xs text-gray-500">{sessionLabel}</span>
                    <button
                      onClick={() => onOpenCampaign(camp.id)}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition"
                    >
                      {count === 0 ? 'Start' : 'Resume'}
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Create Campaign Card below list */}
            <button
              type="button"
              aria-label="Create Campaign card"
              onClick={() => {
                setName('')
                setDescription('')
                setValidationError(false)
                setIsCreateOpen(true)
              }}
              className="border-2 border-dashed border-amber-900/30 hover:border-amber-500/40 rounded-xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer transition min-h-[160px] w-full"
            >
              <Plus className="w-8 h-8 text-amber-500/60" />
              <span className="font-serif font-semibold text-amber-400 text-sm">Create Campaign</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-400">Create Campaign</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setValidationError(false)
                  }}
                  placeholder="e.g. Curse of Strahd"
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">A campaign name is required</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Campaign details..."
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
      {editingCampaign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-400">
              Edit Campaign dialog for "{editingCampaign.name}"
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setValidationError(false)
                  }}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">A campaign name is required</span>
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
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
