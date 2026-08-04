import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Music, Sparkles, Plus, Play, Pause, Trash2, Edit3, Search, Upload, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { FxTrack } from '../types'

export const LibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'fx' ? 'fx' : 'soundscapes'
  const navigate = useNavigate()

  const {
    soundscapeCategories,
    deleteSoundscapeCategory,
    fxTracks,
    createFxTrack,
    updateFxTrack,
    deleteFxTrack,
  } = useApp()

  const [search, setSearch] = useState('')
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  // FX Import & Edit Modal
  const [isFxImportOpen, setIsFxImportOpen] = useState(false)
  const [editingFx, setEditingFx] = useState<FxTrack | null>(null)

  // FX Form State
  const [fxName, setFxName] = useState('')
  const [fxCategory, setFxCategory] = useState('')
  const [fxTags, setFxTags] = useState('')
  const [fxDuration, setFxDuration] = useState(2)
  const [fxUrl, setFxUrl] = useState('')

  const setTab = (tab: 'soundscapes' | 'fx') => {
    setSearchParams({ tab })
    setPreviewingId(null)
  }

  // Audio preview toggle handler
  const handleTogglePreview = (id: string) => {
    setPreviewingId((prev) => (prev === id ? null : id))
  }

  // Submit FX Import
  const handleImportFxSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fxName.trim()) return
    const tagsArr = fxTags.split(',').map((t) => t.trim()).filter(Boolean)
    createFxTrack(fxName.trim(), fxCategory.trim() || 'General', tagsArr, fxDuration, fxUrl)
    setFxName('')
    setFxCategory('')
    setFxTags('')
    setFxDuration(2)
    setFxUrl('')
    setIsFxImportOpen(false)
  }

  // Submit FX Update
  const handleUpdateFxSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFx || !fxName.trim()) return
    const tagsArr = fxTags.split(',').map((t) => t.trim()).filter(Boolean)
    updateFxTrack(editingFx.id, fxName.trim(), fxCategory.trim(), tagsArr, fxDuration)
    setEditingFx(null)
  }

  // Filtered categories
  const filteredCategories = soundscapeCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  // Filtered FX tracks
  const filteredFx = fxTracks.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase()) ||
    f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-900/30">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-300">Audio Library</h1>
          <p className="text-sm text-gray-400 mt-1">Browse and compose soundscapes and sound effects</p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-[#171717] p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setTab('soundscapes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'soundscapes'
                ? 'bg-amber-500 text-gray-950 shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Music size={16} />
            <span>Soundscapes</span>
          </button>
          <button
            onClick={() => setTab('fx')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'fx'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles size={16} />
            <span>Sound Effects (FX)</span>
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#171717] p-4 rounded-xl border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'soundscapes' ? 'Search soundscapes...' : 'Search sound effects...'
            }
            className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {activeTab === 'soundscapes' ? (
          <button
            onClick={() => navigate('/library/composer')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg text-sm flex items-center space-x-1.5 shadow"
          >
            <Plus size={16} />
            <span>+ Add Soundscape</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setFxName('')
              setFxCategory('General')
              setFxTags('')
              setFxDuration(2)
              setFxUrl('/assets/audio/fx/sword_clash.ogg')
              setIsFxImportOpen(true)
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-sm flex items-center space-x-1.5 shadow"
          >
            <Upload size={16} />
            <span>Import FX</span>
          </button>
        )}
      </div>

      {/* TAB 1: Soundscapes */}
      {activeTab === 'soundscapes' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">
            Free Compositions ({filteredCategories.length})
          </div>

          {filteredCategories.length === 0 ? (
            <div className="bg-[#141414] border border-dashed border-gray-800 rounded-xl p-12 text-center text-gray-500">
              No compositions match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((cat) => {
                const totalTracks =
                  cat.level1TrackIds.length + cat.level2TrackIds.length + cat.level3TrackIds.length
                const isPreviewing = previewingId === cat.id

                return (
                  <div
                    key={cat.id}
                    className="bg-[#171717] border border-yellow-900/30 hover:border-amber-500/40 rounded-xl p-6 flex flex-col justify-between space-y-4 transition shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h2 className="font-serif text-xl font-bold text-amber-200">{cat.name}</h2>
                        <button
                          onClick={() => deleteSoundscapeCategory(cat.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 rounded transition"
                          title="Move to Trash"
                          aria-label={`Delete category ${cat.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {cat.description && <p className="text-sm text-gray-400">{cat.description}</p>}

                      <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
                        <span>Levels I-III:</span>
                        <span className="px-2 py-0.5 bg-gray-800 rounded border border-gray-700">
                          {totalTracks} tracks
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between">
                      <button
                        onClick={() => handleTogglePreview(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                          isPreviewing
                            ? 'bg-amber-500 text-gray-950'
                            : 'bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30'
                        }`}
                        aria-label={isPreviewing ? `Pause preview ${cat.name}` : `Preview ${cat.name}`}
                      >
                        {isPreviewing ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                        <span>{isPreviewing ? 'Pause Preview' : 'Preview'}</span>
                      </button>

                      <button
                        onClick={() => navigate(`/library/composer/${cat.id}`)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 flex items-center space-x-1"
                      >
                        <Edit3 size={14} />
                        <span>Edit Category</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Sound Effects (FX) */}
      {activeTab === 'fx' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-purple-400/80">
            Free Tracks ({filteredFx.length})
          </div>

          {filteredFx.length === 0 ? (
            <div className="bg-[#141414] border border-dashed border-gray-800 rounded-xl p-12 text-center text-gray-500">
              No effects match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFx.map((fx) => {
                const isPreviewing = previewingId === fx.id

                return (
                  <div
                    key={fx.id}
                    className="bg-[#171717] border border-purple-900/30 hover:border-purple-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 transition shadow"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-200 text-sm line-clamp-1">{fx.name}</h3>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingFx(fx)
                              setFxName(fx.name)
                              setFxCategory(fx.category)
                              setFxTags(fx.tags.join(', '))
                              setFxDuration(fx.durationSeconds)
                            }}
                            className="p-1 text-gray-500 hover:text-amber-300 rounded"
                            title="Edit metadata"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => deleteFxTrack(fx.id)}
                            className="p-1 text-gray-500 hover:text-red-400 rounded"
                            title="Move to Trash"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-1">
                        <span className="px-1.5 py-0.5 bg-purple-950/60 text-purple-300 rounded border border-purple-800/40">
                          {fx.category}
                        </span>
                        <span>{fx.durationSeconds}s</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePreview(fx.id)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                        isPreviewing
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-purple-300 border border-purple-500/30'
                      }`}
                      aria-label={isPreviewing ? `Pause preview ${fx.name}` : `Preview ${fx.name}`}
                    >
                      {isPreviewing ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                      <span>{isPreviewing ? 'Pause Preview' : 'Preview Track'}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Import FX Modal */}
      {isFxImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-purple-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-purple-300">Import Sound Effect</h2>
              <button onClick={() => setIsFxImportOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleImportFxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Effect Name *
                </label>
                <input
                  type="text"
                  required
                  value={fxName}
                  onChange={(e) => setFxName(e.target.value)}
                  placeholder="e.g. Dragon Roar"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={fxCategory}
                  onChange={(e) => setFxCategory(e.target.value)}
                  placeholder="Combat, Magic, Monsters..."
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={fxTags}
                  onChange={(e) => setFxTags(e.target.value)}
                  placeholder="fire, spell, blast"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Audio File Path / URL
                </label>
                <input
                  type="text"
                  value={fxUrl}
                  onChange={(e) => setFxUrl(e.target.value)}
                  placeholder="/assets/audio/fx/sword_clash.ogg"
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFxImportOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg shadow"
                >
                  Import FX
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit FX Modal */}
      {editingFx && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-purple-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-purple-300">Edit FX Metadata</h2>
              <button onClick={() => setEditingFx(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateFxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Effect Name *
                </label>
                <input
                  type="text"
                  required
                  value={fxName}
                  onChange={(e) => setFxName(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={fxCategory}
                  onChange={(e) => setFxCategory(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={fxTags}
                  onChange={(e) => setFxTags(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFx(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg shadow"
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
