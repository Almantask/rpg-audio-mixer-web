import React, { useState } from 'react'
import { Plus, Play, Pause, Trash2, Edit2, Music, Sliders } from 'lucide-react'
import type { SoundscapeCategory, FxTrack } from '../types'

interface LibraryProps {
  soundscapeCategories: SoundscapeCategory[]
  fxTracks: FxTrack[]
  onCreateCategory: (name: string, description: string, tags: string[]) => void
  onDeleteCategory: (id: string) => void
  onEditFx: (id: string, name: string, category: string) => void
  onOpenComposer: (categoryId: string) => void
}

export const Library: React.FC<LibraryProps> = ({
  soundscapeCategories,
  fxTracks,
  onCreateCategory,
  onDeleteCategory,
  onEditFx,
  onOpenComposer,
}) => {
  const [activeTab, setActiveTab] = useState<'Soundscapes' | 'Sound Effects'>('Soundscapes')
  const [playingId, setPlayingId] = useState<string | null>(null)

  // Category creation state
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catTags, setCatTags] = useState('')

  // FX editing state
  const [editingFx, setEditingFx] = useState<FxTrack | null>(null)
  const [fxName, setFxName] = useState('')
  const [fxCategory, setFxCategory] = useState('')

  const activeCategories = soundscapeCategories.filter((c) => !c.deletedAt)
  const activeFx = fxTracks.filter((f) => !f.deletedAt)

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return
    const tags = catTags.split(',').map((t) => t.trim()).filter(Boolean)
    onCreateCategory(catName.trim(), catDesc.trim(), tags)
    setCatName('')
    setCatDesc('')
    setCatTags('')
    setIsCreateCategoryOpen(false)
  }

  const handleEditFxSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFx || !fxName.trim()) return
    onEditFx(editingFx.id, fxName.trim(), fxCategory.trim())
    setEditingFx(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-400">Library</h1>
          <p className="text-gray-400 text-sm">Browse and manage audio categories and effects.</p>
        </div>
        {activeTab === 'Soundscapes' && (
          <button
            onClick={() => {
              setCatName('')
              setCatDesc('')
              setCatTags('')
              setIsCreateCategoryOpen(true)
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-900/30 gap-2">
        <button
          onClick={() => setActiveTab('Soundscapes')}
          className={`px-5 py-2.5 font-serif font-bold text-base border-b-2 transition ${
            activeTab === 'Soundscapes' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Soundscapes
        </button>
        <button
          onClick={() => setActiveTab('Sound Effects')}
          className={`px-5 py-2.5 font-serif font-bold text-base border-b-2 transition ${
            activeTab === 'Sound Effects' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Sound Effects
        </button>
      </div>

      {/* Soundscapes Tab */}
      {activeTab === 'Soundscapes' && (
        <div className="space-y-4">
          {activeCategories.length === 0 ? (
            <div className="bg-[#121212] border border-amber-900/20 rounded-xl p-12 text-center space-y-3">
              <Music className="w-12 h-12 text-amber-500/40 mx-auto" />
              <h3 className="text-xl font-serif font-semibold text-gray-200">No categories found</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">Create a soundscape category to begin composing audio tracks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCategories.map((sc) => {
                const isPlaying = playingId === sc.id
                const trackCount =
                  sc.tracks.level1.length + sc.tracks.level2.length + sc.tracks.level3.length

                return (
                  <div key={sc.id} className="bg-[#121212] border border-amber-900/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-serif font-bold text-gray-100">{sc.name}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            aria-label={`Preview ${sc.name}`}
                            onClick={() => setPlayingId(isPlaying ? null : sc.id)}
                            className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                          </button>
                          <button
                            aria-label={`Delete ${sc.name}`}
                            onClick={() => onDeleteCategory(sc.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{sc.description || 'No description'}</p>
                    </div>

                    <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{trackCount} tracks</span>
                      <button
                        onClick={() => onOpenComposer(sc.id)}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Sliders className="w-3.5 h-3.5" /> Compose Category
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* FX Tab */}
      {activeTab === 'Sound Effects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeFx.map((fx) => {
              const isPlaying = playingId === fx.id

              return (
                <div key={fx.id} className="bg-[#121212] border border-purple-900/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{fx.category || 'FX'}</span>
                    <h4 className="font-serif font-bold text-gray-100 text-sm">{fx.name}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label={`Preview ${fx.name}`}
                      onClick={() => setPlayingId(isPlaying ? null : fx.id)}
                      className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-full"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <button
                      aria-label={`Edit ${fx.name}`}
                      onClick={() => {
                        setEditingFx(fx)
                        setFxName(fx.name)
                        setFxCategory(fx.category || '')
                      }}
                      className="p-1.5 text-gray-400 hover:text-purple-400 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {isCreateCategoryOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-400">Create Soundscape Category</h2>
            <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Forest Winds"
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Category atmosphere..."
                  rows={3}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateCategoryOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit FX Modal */}
      {editingFx && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-purple-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-purple-400">Edit Effect</h2>
            <form onSubmit={handleEditFxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Effect Name</label>
                <input
                  type="text"
                  required
                  value={fxName}
                  onChange={(e) => setFxName(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-purple-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Category</label>
                <input
                  type="text"
                  value={fxCategory}
                  onChange={(e) => setFxCategory(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-purple-900/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-400"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingFx(null)} className="px-4 py-2 text-gray-400 hover:text-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded-lg">
                  Save Effect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
