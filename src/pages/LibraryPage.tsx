import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  ExternalLink,
  Upload,
  Play,
  Pause,
  Edit2,
  Trash2,
  Plus,
  Volume2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { audioEngine } from '../services/audioEngine'
import { Dialog } from '../components/common/Dialog'
import type { FXTrack } from '../types'

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    soundscapeCategories,
    soundscapeTracks,
    fxTracks,
    createSoundscapeCategory,
    softDeleteSoundscapeCategory,
    importFXTrack,
    updateFXTrack,
    softDeleteFXTrack,
    showToast,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'soundscapes' | 'fx'>('soundscapes')
  const [searchTerm, setSearchTerm] = useState('')

  // Soundscape preview state
  const [previewCatId, setPreviewCatId] = useState<string | null>(null)

  // FX preview & mini player state
  const [previewFX, setPreviewFX] = useState<FXTrack | null>(null)
  const [editingFX, setEditingFX] = useState<FXTrack | null>(null)
  const [editFXTitle, setEditFXTitle] = useState('')
  const [editFXTags, setEditFXTags] = useState('')

  // New Category Prompt Dialog
  const [isAddCatOpen, setIsAddCatOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const fxFileInputRef = useRef<HTMLInputElement>(null)

  // Soundscapes tab filtering
  const filteredCategories = soundscapeCategories.filter((cat) => {
    if (!searchTerm.trim()) return true
    return cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // FX tab filtering
  const filteredFX = fxTracks.filter((fx) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return fx.title.toLowerCase().includes(term) || fx.tags.some((t) => t.toLowerCase().includes(term))
  })

  const handleCategoryPreview = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (previewCatId === catId) {
      audioEngine.stopSoundscapeCategory(catId)
      setPreviewCatId(null)
      return
    }

    if (previewCatId) {
      audioEngine.stopSoundscapeCategory(previewCatId)
    }

    const cat = soundscapeCategories.find((c) => c.id === catId)
    if (!cat) return

    const trackId = cat.levels.I?.[0] || cat.levels.II?.[0] || cat.levels.III?.[0]
    const track = soundscapeTracks.find((t) => t.id === trackId)
    if (!track) return

    audioEngine.playSoundscapeCategory(catId, track.id, track.audioUrl, 'I', 0.8, () => {
      setPreviewCatId(null)
    })
    setPreviewCatId(catId)
  }

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    const newCat = createSoundscapeCategory(newCatName.trim())
    setIsAddCatOpen(false)
    setNewCatName('')
    navigate(`/library/soundscapes/${newCat.id}/compose`)
  }

  const handleFXCardClick = (fx: FXTrack) => {
    if (previewFX?.id === fx.id) {
      audioEngine.stopFX(fx.id)
      setPreviewFX(null)
      return
    }

    setPreviewFX(fx)
    audioEngine.playFX(fx.id, fx.audioUrl, fx.defaultVolume ?? 0.8, () => {
      setPreviewFX(null)
    })
  }

  const handleFXFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    importFXTrack(file.name.replace(/\.[^/.]+$/, ''), url)
  }

  const handleEditFXSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFX || !editFXTitle.trim()) return
    const tagsArray = editFXTags
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)

    updateFXTrack(editingFX.id, {
      title: editFXTitle.trim(),
      tags: tagsArray,
    })
    setEditingFX(null)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-yellow-500">Library</h1>
        <p className="text-sm text-gray-400 mt-1">
          {activeTab === 'soundscapes'
            ? 'Browse and manage your soundscape categories.'
            : 'Browse, import, and manage your sound effects.'}
        </p>
      </div>

      {/* Tab Strip */}
      <div className="flex gap-8 border-b border-yellow-900/30 font-serif text-lg">
        <button
          onClick={() => setActiveTab('soundscapes')}
          className={`pb-3 font-bold transition-all relative ${
            activeTab === 'soundscapes'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Soundscapes
        </button>
        <button
          onClick={() => setActiveTab('fx')}
          className={`pb-3 font-bold transition-all relative ${
            activeTab === 'fx'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Sound Effects
        </button>
      </div>

      {/* Soundscapes Tab Content */}
      {activeTab === 'soundscapes' && (
        <div className="space-y-6">
          {/* Action Bar & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="flex gap-3">
              <button
                onClick={() => showToast('Storefront feature in development.')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
              >
                <ShoppingCart size={16} /> Buy Composition
              </button>
              <button
                onClick={() => showToast('Downloading free demo pack...')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
              >
                <ExternalLink size={16} /> Free Compositions
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-2.5 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search compositions…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161616] border border-yellow-900/30 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              const isPlaying = previewCatId === cat.id
              const countI = cat.levels.I?.length || 0
              const countII = cat.levels.II?.length || 0
              const countIII = cat.levels.III?.length || 0

              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/library/soundscapes/${cat.id}/compose`)}
                  className={`p-5 rounded-xl border bg-[#161616] cursor-pointer transition-all flex flex-col justify-between space-y-4 group relative ${
                    isPlaying
                      ? 'border-yellow-500 ring-2 ring-yellow-500/50 bg-yellow-500/5'
                      : 'border-yellow-900/30 hover:border-yellow-500/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Composition
                      </span>
                      {isPlaying && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500 text-black">
                          ● PLAYING
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-yellow-500 mt-2 group-hover:text-yellow-400">
                      {cat.name}
                    </h3>

                    {/* Intensity breakdown */}
                    <div className="text-xs text-gray-400 mt-2 font-mono bg-black/40 px-3 py-1.5 rounded border border-yellow-900/20 inline-block">
                      <span className={countI > 0 ? 'text-gray-200' : 'text-gray-600'}>
                        I:{countI}
                      </span>{' '}
                      ·{' '}
                      <span className={countII > 0 ? 'text-gray-200' : 'text-gray-600'}>
                        II:{countII}
                      </span>{' '}
                      ·{' '}
                      <span className={countIII > 0 ? 'text-gray-200' : 'text-gray-600'}>
                        III:{countIII}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-yellow-900/20">
                    <button
                      onClick={(e) => handleCategoryPreview(cat.id, e)}
                      className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-colors"
                      title={isPlaying ? 'Stop Preview' : 'Preview Category'}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/library/soundscapes/${cat.id}/compose`)
                        }}
                        className="p-2 text-gray-400 hover:text-yellow-500 rounded-lg hover:bg-white/5"
                        title="Edit in Composer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          softDeleteSoundscapeCategory(cat.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* + Add Soundscape Card */}
            <button
              onClick={() => setIsAddCatOpen(true)}
              className="min-h-[180px] p-6 border-2 border-dashed border-yellow-900/40 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/60 transition-all flex flex-col items-center justify-center gap-2 text-yellow-500 font-serif font-bold text-base"
            >
              <Plus size={28} />
              <span>+ Add Soundscape</span>
            </button>
          </div>
        </div>
      )}

      {/* Sound Effects Tab Content */}
      {activeTab === 'fx' && (
        <div className="space-y-6">
          {/* Action Bar & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="flex gap-3">
              <input
                type="file"
                ref={fxFileInputRef}
                onChange={handleFXFileImport}
                accept="audio/*"
                className="hidden"
              />
              <button
                onClick={() => fxFileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
              >
                <Upload size={16} /> Import FX
              </button>
              <button
                onClick={() => showToast('Storefront feature in development.')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
              >
                <ShoppingCart size={16} /> Buy More
              </button>
              <button
                onClick={() => showToast('Downloading free demo FX pack...')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
              >
                <ExternalLink size={16} /> Free Tracks
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-2.5 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search effects…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161616] border border-yellow-900/30 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* FX Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFX.map((fx) => {
              const isPlaying = previewFX?.id === fx.id

              return (
                <div
                  key={fx.id}
                  onClick={() => handleFXCardClick(fx)}
                  className={`p-4 rounded-xl border bg-[#161616] cursor-pointer transition-all flex flex-col justify-between space-y-3 relative group ${
                    isPlaying
                      ? 'border-purple-500 ring-2 ring-purple-500/50 bg-purple-500/10'
                      : 'border-yellow-900/30 hover:border-yellow-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400">
                        0:0{fx.durationSeconds ?? 3} · {fx.defaultIntensity ?? 'I'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingFX(fx)
                          setEditFXTitle(fx.title)
                          setEditFXTags(fx.tags.join(', '))
                        }}
                        className="p-1 text-gray-400 hover:text-yellow-500 rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit FX"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>

                    <h4 className="font-serif font-bold text-gray-100 group-hover:text-purple-300 text-base mt-1">
                      {fx.title}
                    </h4>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {fx.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isPlaying && (
                    <div className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
                      <Volume2 size={12} className="animate-pulse" /> PLAYING
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sticky FX Mini Player */}
          {previewFX && (
            <div className="fixed bottom-4 left-4 right-4 md:left-72 z-40 bg-[#1A1A1A] border border-purple-500/50 rounded-xl p-4 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <Volume2 size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-purple-300 text-sm">{previewFX.title}</h4>
                  <p className="text-xs text-gray-400">Previewing sound effect</p>
                </div>
              </div>

              <button
                onClick={() => {
                  audioEngine.stopFX(previewFX.id)
                  setPreviewFX(null)
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-500"
              >
                Stop Preview
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Soundscape Category Dialog */}
      <Dialog
        isOpen={isAddCatOpen}
        onClose={() => setIsAddCatOpen(false)}
        title="Add Soundscape Category"
        subtitle="Create a new soundscape category and open the Category Composer."
      >
        <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Meteorological"
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-yellow-900/20">
            <button
              type="button"
              onClick={() => setIsAddCatOpen(false)}
              className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Create & Compose
            </button>
          </div>
        </form>
      </Dialog>

      {/* Inline Edit FX Dialog */}
      <Dialog
        isOpen={Boolean(editingFX)}
        onClose={() => setEditingFX(null)}
        title="Edit Sound Effect"
      >
        <form onSubmit={handleEditFXSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={editFXTitle}
              onChange={(e) => setEditFXTitle(e.target.value)}
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={editFXTags}
              onChange={(e) => setEditFXTags(e.target.value)}
              placeholder="e.g. COMBAT, IMPACT"
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-yellow-900/20">
            <button
              type="button"
              onClick={() => {
                if (editingFX) {
                  softDeleteFXTrack(editingFX.id)
                  setEditingFX(null)
                }
              }}
              className="px-3 py-2 text-xs font-semibold rounded-lg text-red-400 hover:bg-red-950/40"
            >
              Delete to Trash
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingFX(null)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
