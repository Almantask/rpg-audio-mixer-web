import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, ArrowRight, Layers, X, AlertTriangle, Edit3 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Scene } from '../types'

export const ScenesPage: React.FC = () => {
  const navigate = useNavigate()
  const { scenes, links, createScene, updateScene, deleteScene } = useApp()

  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Gather unique tags
  const allTags = Array.from(new Set(scenes.flatMap((s) => s.tags)))

  // Filtering
  const filteredScenes = scenes.filter((sc) => {
    const matchesSearch =
      sc.name.toLowerCase().includes(search.toLowerCase()) ||
      (sc.description && sc.description.toLowerCase().includes(search.toLowerCase()))
    const matchesTag = !selectedTag || sc.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    createScene(name.trim(), description.trim(), parsedTags)
    setName('')
    setDescription('')
    setTagInput('')
    setIsCreateOpen(false)
    // Post-create navigation: stay on Scenes list per PW-31 recommendation
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScene || !name.trim()) return
    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    updateScene(editingScene.id, name.trim(), description.trim(), parsedTags)
    setEditingScene(null)
  }

  const handleDeleteAttempt = (sc: Scene) => {
    const linkedCount = links.filter((l) => l.sceneId === sc.id).length
    if (linkedCount > 0) {
      // Linked to sessions -> requires confirmation dialog
      setDeletingScene(sc)
    } else {
      // Not linked -> instant soft delete
      deleteScene(sc.id)
    }
  }

  const confirmDeleteLinked = () => {
    if (!deletingScene) return
    deleteScene(deletingScene.id)
    setDeletingScene(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-900/30">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-300">Global Scenes Catalogue</h1>
          <p className="text-sm text-gray-400 mt-1">Browse, build, and organize reusable audio scene presets</p>
        </div>
        <button
          onClick={() => {
            setName('')
            setDescription('')
            setTagInput('')
            setIsCreateOpen(true)
          }}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg shadow transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus size={18} />
          <span>Build Your Own Scene</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#171717] p-4 rounded-xl border border-gray-800">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scenes..."
            className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Tag pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
              selectedTag === null
                ? 'bg-amber-500 text-gray-950 border-amber-400'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                selectedTag === tag
                  ? 'bg-amber-500 text-gray-950 border-amber-400'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Scenes Grid */}
      {filteredScenes.length === 0 ? (
        <div className="bg-[#141414] border border-dashed border-gray-800 rounded-xl p-12 text-center space-y-4">
          <Layers size={48} className="mx-auto text-gray-600" />
          <h2 className="font-serif text-xl font-bold text-gray-300">No scenes found</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Try adjusting your search filter or create a custom scene.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenes.map((sc) => {
            const linkedSessionCount = links.filter((l) => l.sceneId === sc.id).length

            return (
              <div
                key={sc.id}
                className="bg-[#171717] border border-yellow-900/30 hover:border-amber-500/40 rounded-xl p-6 flex flex-col justify-between space-y-4 transition shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-amber-200">{sc.name}</h2>
                      {sc.isUserOwned && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80">
                          Custom Preset
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {sc.isUserOwned && (
                        <button
                          onClick={() => {
                            setEditingScene(sc)
                            setName(sc.name)
                            setDescription(sc.description || '')
                            setTagInput(sc.tags.join(', '))
                          }}
                          className="p-1.5 text-gray-500 hover:text-amber-300 rounded transition"
                          title="Edit scene"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAttempt(sc)}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded transition"
                        title="Move to Trash"
                        aria-label={`Delete scene ${sc.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {sc.description && <p className="text-sm text-gray-400">{sc.description}</p>}

                  {/* Tags */}
                  {sc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sc.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-mono px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {linkedSessionCount === 0
                      ? 'Unlinked'
                      : `Linked to ${linkedSessionCount} ${linkedSessionCount === 1 ? 'session' : 'sessions'}`}
                  </span>
                  {/* PW-29: Open-only button, no Play ▶ icon on scene list cards */}
                  <button
                    onClick={() => navigate(`/scenes/${sc.id}`)}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Open Scene</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Build / Create Scene Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-amber-300">Build Your Own Scene</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Scene Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tavern Brawl"
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
                  placeholder="Describe the environment or mood..."
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="combat, tavern, urban"
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
                  Save Scene
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Scene Modal */}
      {editingScene && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-amber-300">Edit Scene</h2>
              <button onClick={() => setEditingScene(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Scene Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingScene(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-bold rounded-lg shadow"
                >
                  Update Scene
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Linked Scene Delete Confirmation AlertDialog (per platform-design SL-07) */}
      {deletingScene && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-red-800/60 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle size={24} />
              <h2 className="font-serif text-xl font-bold text-gray-100">Delete Linked Scene?</h2>
            </div>
            <p className="text-sm text-gray-300">
              Scene <strong className="text-amber-300">{deletingScene.name}</strong> is currently linked to game sessions. Deleting it will unlink it from all sessions and move it to Trash for 7 days.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingScene(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLinked}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shadow"
              >
                Unlink & Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
