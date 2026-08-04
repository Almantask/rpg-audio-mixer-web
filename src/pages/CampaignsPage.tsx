import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, BookOpen, Play, FolderPlus, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export const CampaignsPage: React.FC = () => {
  const navigate = useNavigate()
  const { campaigns, sessions, createCampaign, deleteCampaign } = useApp()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [system, setSystem] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createCampaign(name.trim(), system.trim(), description.trim())
    setName('')
    setSystem('')
    setDescription('')
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-900/30">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-300">Active Campaigns</h1>
          <p className="text-sm text-gray-400 mt-1">Manage tabletop campaigns and launch game sessions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg shadow transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus size={18} />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="bg-[#141414] border border-dashed border-gray-800 rounded-xl p-12 text-center space-y-4">
          <BookOpen size={48} className="mx-auto text-gray-600" />
          <h2 className="font-serif text-xl font-bold text-gray-300">No campaigns yet</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Create your first campaign to start organizing your game sessions and audio scenes.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 font-medium text-sm inline-flex items-center space-x-2"
          >
            <FolderPlus size={16} />
            <span>Create Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const campSessions = sessions.filter((s) => s.campaignId === camp.id)
            const hasSessions = campSessions.length > 0

            return (
              <div
                key={camp.id}
                className="bg-[#171717] border border-yellow-900/30 hover:border-amber-500/40 rounded-xl p-6 flex flex-col justify-between space-y-4 transition shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h2 className="font-serif text-xl font-bold text-amber-200">{camp.name}</h2>
                    <button
                      onClick={() => deleteCampaign(camp.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded transition"
                      title="Move to Trash"
                      aria-label={`Delete campaign ${camp.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {camp.system && (
                    <span className="inline-block text-xs font-mono px-2 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-800/40 rounded">
                      {camp.system}
                    </span>
                  )}
                  {camp.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{camp.description}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {campSessions.length} {campSessions.length === 1 ? 'session' : 'sessions'}
                  </span>
                  <button
                    onClick={() => navigate(`/campaigns/${camp.id}/sessions`)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Play size={14} className="fill-current" />
                    <span>{hasSessions ? 'Resume' : 'Start'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-amber-300">Create Campaign</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Curse of Strahd"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  RPG System
                </label>
                <input
                  type="text"
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  placeholder="e.g. D&D 5e, Pathfinder 2e"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary or context..."
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-bold rounded-lg shadow"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
