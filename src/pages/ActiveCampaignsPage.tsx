import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { getData, setData } from '../services/store'

export const ActiveCampaignsPage: React.FC = () => {
  const [data, setStoreData] = useState(getData())

  useEffect(() => {
    const handleUpdate = () => setStoreData(getData())
    window.addEventListener('arcanum_store_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_store_updated', handleUpdate)
  }, [])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [validationError, setValidationError] = useState('')
  const [undoToast, setUndoToast] = useState<string | null>(null)
  const navigate = useNavigate()

  const activeCampaigns = [...data.campaigns]
    .filter((c) => !c.deletedAt)
    .sort((a, b) => new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime())

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setValidationError('Campaign name is required')
      return
    }
    const newCampaign = {
      id: `camp-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
      lastPlayedAt: new Date().toISOString(),
    }
    const updated = setData({ campaigns: [...data.campaigns, newCampaign] })
    setStoreData(updated)
    setName('')
    setDescription('')
    setValidationError('')
    setShowCreateModal(false)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setValidationError('Campaign name is required')
      return
    }
    const updatedCampaigns = data.campaigns.map((c) =>
      c.id === editingCampaign.id
        ? { ...c, name: name.trim(), description: description.trim() || undefined }
        : c,
    )
    const updated = setData({ campaigns: updatedCampaigns })
    setStoreData(updated)
    setName('')
    setDescription('')
    setValidationError('')
    setEditingCampaign(null)
  }

  const handleDelete = (campaignId: string, campaignName: string) => {
    const updatedCampaigns = data.campaigns.map((c) =>
      c.id === campaignId ? { ...c, deletedAt: new Date().toISOString() } : c,
    )
    const updated = setData({ campaigns: updatedCampaigns })
    setStoreData(updated)
    setUndoToast(campaignName)
  }

  const handleUndo = () => {
    if (!undoToast) return
    const updatedCampaigns = data.campaigns.map((c) =>
      c.name === undoToast ? { ...c, deletedAt: null } : c,
    )
    const updated = setData({ campaigns: updatedCampaigns })
    setStoreData(updated)
    setUndoToast(null)
  }

  const handleOpenSessions = (campaignId: string) => {
    const updatedCampaigns = data.campaigns.map((c) =>
      c.id === campaignId ? { ...c, lastPlayedAt: new Date().toISOString() } : c,
    )
    setData({ campaigns: updatedCampaigns })
    navigate(`/campaigns/${campaignId}/sessions`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-400">Active Campaigns</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your campaigns.</p>
      </div>

      {undoToast && (
        <div className="p-3 bg-zinc-800 border border-amber-500/50 rounded flex justify-between items-center text-sm text-zinc-200">
          <span>Campaign "{undoToast}" moved to Trash.</span>
          <button
            onClick={handleUndo}
            className="text-amber-400 hover:underline font-semibold text-xs uppercase"
          >
            Undo
          </button>
        </div>
      )}

      {activeCampaigns.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="text-zinc-500 font-serif text-xl">No campaigns yet</div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeCampaigns.map((c) => {
            const sessionCount = data.sessions.filter(
              (s) => s.campaignId === c.id && !s.deletedAt,
            ).length
            return (
              <div
                key={c.id}
                data-testid={`campaign-card-${c.name}`}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between gap-4"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center text-zinc-500 font-serif">
                    {c.coverArt ? (
                      <img
                        src={c.coverArt}
                        alt={c.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      'Cover'
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-amber-400 font-semibold">{c.name}</h3>
                    {c.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2">{c.description}</p>
                    )}
                    <span className="text-xs text-zinc-500">
                      {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingCampaign(c)
                      setName(c.name)
                      setDescription(c.description || '')
                    }}
                    aria-label={`Edit ${c.name}`}
                    className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleOpenSessions(c.id)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm rounded shadow transition-colors"
                  >
                    {sessionCount === 0 ? 'Start' : 'Resume'}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    aria-label={`Delete ${c.name}`}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Campaign Card */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-amber-400 transition-colors"
      >
        <Plus className="w-6 h-6" />
        <span className="font-medium text-sm">Create Campaign</span>
      </button>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">Create Campaign</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  placeholder="The Shattered Throne"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">{validationError}</span>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setValidationError('')
                  }}
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

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div role="dialog" className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">
              Edit Campaign ({editingCampaign.name})
            </h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  placeholder="The Shattered Throne"
                />
                {validationError && (
                  <span className="text-xs text-red-400 mt-1 block">{validationError}</span>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCampaign(null)
                    setValidationError('')
                  }}
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
