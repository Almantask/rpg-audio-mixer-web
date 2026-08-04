import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Play, Pause, Edit2, Trash2, Upload } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge } from '../components/common/Badge'
import { Dialog } from '../components/common/Dialog'
import { audioEngine } from '../utils/audioEngine'
import type { FXTrack } from '../types'

export const LibraryView: React.FC = () => {
  const navigate = useNavigate()
  const {
    categories,
    fxTracks,
    createCategory,
    softDeleteCategory,
    importFXTrack,
    updateFXTrack,
    softDeleteFXTrack,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'soundscapes' | 'fx'>('soundscapes')
  const [search, setSearch] = useState('')

  const [previewingCatId, setPreviewingCatId] = useState<string | null>(null)
  const [previewingFX, setPreviewingFX] = useState<FXTrack | null>(null)

  const [isAddCatOpen, setIsAddCatOpen] = useState(false)
  const [catName, setCatName] = useState('')

  const [editingFX, setEditingFX] = useState<FXTrack | null>(null)
  const [fxName, setFxName] = useState('')
  const [fxTags, setFxTags] = useState('')

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const filteredFX = fxTracks.filter(
    (f) =>
      f.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(search.trim().toLowerCase())),
  )

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return
    const newCat = createCategory(catName.trim())
    setCatName('')
    setIsAddCatOpen(false)
    navigate(`/library/soundscapes/${newCat.id}/compose`)
  }

  const handleImportFX = () => {
    const fakeName = prompt('Enter Sound Effect Name:')
    if (!fakeName) return
    importFXTrack({
      name: fakeName,
      url: '/assets/audio/fireball.ogg',
      durationSeconds: 3,
      intensity: 'II',
      tags: ['IMPORTED', 'CUSTOM'],
    })
  }

  const handleSaveFXEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFX || !fxName.trim()) return
    const tags = fxTags
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)
    updateFXTrack(editingFX.id, { name: fxName.trim(), tags })
    setEditingFX(null)
  }

  const handleToggleCategoryPreview = (catId: string) => {
    if (previewingCatId === catId) {
      audioEngine.stopSoundscape(catId)
      setPreviewingCatId(null)
    } else {
      audioEngine.stopAll()
      setPreviewingFX(null)
      const cat = categories.find((c) => c.id === catId)
      const track =
        cat?.tracksByLevel.I[0] || cat?.tracksByLevel.II[0] || cat?.tracksByLevel.III[0]
      if (track) {
        audioEngine.playSoundscape(catId, track.url, 0.8, 1.0, 'I')
        setPreviewingCatId(catId)
      }
    }
  }

  const handleToggleFXPreview = (fx: FXTrack) => {
    if (previewingFX?.id === fx.id) {
      audioEngine.stopFXTrack(fx.id)
      setPreviewingFX(null)
    } else {
      audioEngine.stopAll()
      setPreviewingCatId(null)
      audioEngine.playFX(fx.id, fx.url)
      setPreviewingFX(fx)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-amber-400">Library</h1>
      </div>

      {/* Tab Strip */}
      <div className="flex border-b border-neutral-800 space-x-8">
        <button
          onClick={() => {
            setActiveTab('soundscapes')
            audioEngine.stopAll()
            setPreviewingFX(null)
            setPreviewingCatId(null)
          }}
          className={`pb-3 font-serif font-bold text-lg transition border-b-2 ${
            activeTab === 'soundscapes'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Soundscapes
        </button>

        <button
          onClick={() => {
            setActiveTab('fx')
            audioEngine.stopAll()
            setPreviewingFX(null)
            setPreviewingCatId(null)
          }}
          className={`pb-3 font-serif font-bold text-lg transition border-b-2 ${
            activeTab === 'fx'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Sound Effects
        </button>
      </div>

      {/* Soundscapes Tab */}
      {activeTab === 'soundscapes' && (
        <div className="space-y-6">
          <p className="text-sm text-neutral-400">
            Browse and manage your soundscape categories.
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search compositions..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => {
              const iCount = cat.tracksByLevel.I.length
              const iiCount = cat.tracksByLevel.II.length
              const iiiCount = cat.tracksByLevel.III.length
              const isPlaying = previewingCatId === cat.id

              return (
                <div
                  key={cat.id}
                  className={`rounded-xl border p-5 bg-neutral-900 space-y-4 shadow-lg transition ${
                    isPlaying ? 'border-amber-400 ring-1 ring-amber-400' : 'border-neutral-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-lg font-bold text-neutral-100">{cat.name}</h3>
                    {isPlaying && <Badge variant="gold">● PLAYING</Badge>}
                  </div>

                  <div className="text-xs font-semibold text-neutral-400">
                    I: {iCount} · II: {iiCount} · III: {iiiCount}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => handleToggleCategoryPreview(cat.id)}
                      className="p-2 rounded-full bg-amber-500 text-neutral-950 hover:bg-amber-400 transition"
                      aria-label={`Preview ${cat.name}`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/library/soundscapes/${cat.id}/compose`)}
                        className="p-2 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition"
                        aria-label={`Edit ${cat.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => softDeleteCategory(cat.id)}
                        className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                        aria-label={`Delete ${cat.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add Soundscape Tile */}
            <button
              onClick={() => {
                setCatName('')
                setIsAddCatOpen(true)
              }}
              className="rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-neutral-900/40 hover:bg-neutral-900/80 p-6 flex flex-col items-center justify-center space-y-2 text-amber-400 font-bold transition group min-h-[160px]"
            >
              <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>+ Add Soundscape</span>
            </button>
          </div>
        </div>
      )}

      {/* Sound Effects Tab */}
      {activeTab === 'fx' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-neutral-400">
              Browse, import, and manage your sound effects.
            </p>

            <button
              onClick={handleImportFX}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-sm border border-amber-500/40 flex items-center space-x-2 transition self-start sm:self-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Import FX</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search effects..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* FX Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFX.map((fx) => {
              const isPlaying = previewingFX?.id === fx.id

              return (
                <div
                  key={fx.id}
                  onClick={() => handleToggleFXPreview(fx)}
                  className={`rounded-xl border p-5 bg-neutral-900 space-y-3 cursor-pointer transition shadow-lg ${
                    isPlaying ? 'border-purple-400 ring-1 ring-purple-400' : 'border-neutral-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-lg font-bold text-neutral-100">{fx.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingFX(fx)
                        setFxName(fx.name)
                        setFxTags(fx.tags.join(', '))
                      }}
                      className="p-1.5 text-neutral-400 hover:text-purple-300 rounded-lg hover:bg-neutral-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-neutral-400">
                    0:0{fx.durationSeconds} · <span className="font-semibold">{fx.intensity}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {fx.tags.map((t) => (
                      <Badge key={t} variant="purple">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sticky FX Mini Player */}
          {previewingFX && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-purple-950 border border-purple-500/50 text-purple-200 px-6 py-3 rounded-full shadow-2xl flex items-center space-x-4">
              <span className="text-sm font-bold truncate max-w-xs">{previewingFX.name}</span>
              <button
                onClick={() => {
                  audioEngine.stopFXTrack(previewingFX.id)
                  setPreviewingFX(null)
                }}
                className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-400"
              >
                <Pause className="w-4 h-4 fill-current" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Soundscape Modal */}
      <Dialog
        isOpen={isAddCatOpen}
        onClose={() => setIsAddCatOpen(false)}
        title="Add Soundscape Category"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Meteorological"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddCatOpen(false)}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-800 text-neutral-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-lg bg-amber-500 text-neutral-950 font-bold"
            >
              Create Category
            </button>
          </div>
        </form>
      </Dialog>

      {/* Edit FX Modal */}
      <Dialog isOpen={Boolean(editingFX)} onClose={() => setEditingFX(null)} title="Edit FX Track">
        <form onSubmit={handleSaveFXEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              FX Name *
            </label>
            <input
              type="text"
              required
              value={fxName}
              onChange={(e) => setFxName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={fxTags}
              onChange={(e) => setFxTags(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (editingFX) {
                  softDeleteFXTrack(editingFX.id)
                  setEditingFX(null)
                }
              }}
              className="px-4 py-2 text-sm rounded-lg bg-red-950 border border-red-500/40 text-red-400 hover:bg-red-900 font-medium"
            >
              Delete to Trash
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setEditingFX(null)}
                className="px-4 py-2 text-sm rounded-lg bg-neutral-800 text-neutral-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm rounded-lg bg-purple-500 text-white font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
