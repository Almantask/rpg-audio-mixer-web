import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Download, Play, Unlink, Layers, Flame, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export const SessionScenesPage: React.FC = () => {
  const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>()
  const navigate = useNavigate()
  const {
    campaigns,
    sessions,
    scenes,
    links,
    linkSceneToSession,
    unlinkSceneFromSession,
    createScene,
  } = useApp()

  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0]
  const session = sessions.find((s) => s.id === sessionId) || sessions[0]

  // Linked scenes
  const sessionLinks = links.filter((l) => l.sessionId === (session?.id || ''))
  const linkedSceneIds = sessionLinks.map((l) => l.sceneId)
  const linkedScenes = scenes.filter((sc) => linkedSceneIds.includes(sc.id))

  // Find most recently played linked scene (PW-30)
  const lastPlayedLink = [...sessionLinks]
    .filter((l) => l.lastPlayedAt)
    .sort((a, b) => new Date(b.lastPlayedAt!).getTime() - new Date(a.lastPlayedAt!).getTime())[0]

  // Unlinked global scenes for import
  const availableToImport = scenes.filter((sc) => !linkedSceneIds.includes(sc.id))

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Create Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  if (!campaign || !session) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="font-serif text-2xl text-red-400">Session not found</h2>
        <Link to="/campaigns" className="text-amber-400 underline">
          Return to Campaigns
        </Link>
      </div>
    )
  }

  const handleCreateFromSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const newSc = createScene(name.trim(), description.trim(), ['session-created'])
    linkSceneToSession(session.id, newSc.id)
    setName('')
    setDescription('')
    setIsCreateOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Uppercase Breadcrumb Trail per platform-design */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
        <Link to="/campaigns" className="hover:underline">
          CAMPAIGN
        </Link>
        <span>&gt;</span>
        <Link to={`/campaigns/${campaign.id}/sessions`} className="hover:underline text-gray-300">
          {campaign.name}
        </Link>
        <span>&gt;</span>
        <span className="text-gray-100">{session.title}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-900/30">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-300">{session.title} — Scenes</h1>
          <p className="text-sm text-gray-400 mt-1">Audio scenes prepared for this game session</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 rounded-lg text-sm font-semibold flex items-center space-x-1.5"
          >
            <Download size={16} />
            <span>Import Scene</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg text-sm flex items-center space-x-1.5 shadow"
          >
            <Plus size={16} />
            <span>Create Scene</span>
          </button>
        </div>
      </div>

      {/* Linked Scenes Grid */}
      {linkedScenes.length === 0 ? (
        <div className="bg-[#141414] border border-dashed border-gray-800 rounded-xl p-12 text-center space-y-4">
          <Layers size={48} className="mx-auto text-gray-600" />
          <h2 className="font-serif text-xl font-bold text-gray-300">No scenes linked to this session</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Import existing scene presets or create a new scene to get started.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold"
            >
              Import Scene
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {linkedScenes.map((sc) => {
            const isLastActive = lastPlayedLink?.sceneId === sc.id

            return (
              <div
                key={sc.id}
                className={`bg-[#171717] border rounded-xl p-6 flex flex-col justify-between space-y-4 transition shadow-lg relative ${
                  isLastActive ? 'border-amber-500 glow-active' : 'border-yellow-900/30 hover:border-amber-500/40'
                }`}
              >
                {/* Last Active Badge (PW-30) */}
                {isLastActive && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-amber-500 text-gray-950 text-[10px] font-bold uppercase tracking-wider rounded-full shadow flex items-center space-x-1">
                    <Flame size={12} className="fill-current" />
                    <span>Last Active</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h2 className="font-serif text-xl font-bold text-amber-200">{sc.name}</h2>
                    <button
                      onClick={() => unlinkSceneFromSession(session.id, sc.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded transition"
                      title="Unlink from session"
                    >
                      <Unlink size={16} />
                    </button>
                  </div>
                  {sc.description && <p className="text-sm text-gray-400">{sc.description}</p>}
                </div>

                <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Session Scene</span>
                  <button
                    onClick={() =>
                      navigate(
                        `/campaigns/${campaign.id}/sessions/${session.id}/scenes/${sc.id}`
                      )
                    }
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Play size={14} className="fill-current" />
                    <span>Launch Scene</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Import Scene Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-amber-300">Import Scene to Session</h2>
              <button onClick={() => setIsImportOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {availableToImport.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                All global scenes are already linked to this session.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {availableToImport.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-3 bg-[#121212] border border-gray-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-200">{sc.name}</div>
                      {sc.description && (
                        <div className="text-xs text-gray-400 line-clamp-1">{sc.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        linkSceneToSession(session.id, sc.id)
                        setIsImportOpen(false)
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs font-semibold hover:bg-amber-500/30"
                    >
                      Import
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsImportOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Scene from Session Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-amber-300">Create & Link Scene</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFromSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Scene Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Boss Fight"
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
                  Create & Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
