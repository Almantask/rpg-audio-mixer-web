import React, { useState, useEffect } from 'react'
import { Search, Upload, ShoppingCart, ExternalLink, Edit2, Play, Pause, Trash2, Check } from 'lucide-react'
import { getData, setData } from '../services/store'
import { audioEngine } from '../services/audioEngine'
import { updateTrackState } from '../services/audioState'
import type { FXTrack } from '../types'

export const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'fx'>('fx')
  const [storeData, setStoreData] = useState(getData())
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleUpdate = () => setStoreData(getData())
    window.addEventListener('arcanum_store_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_store_updated', handleUpdate)
  }, [])

  // Modals
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showFreeModal, setShowFreeModal] = useState(false)
  const [editingFxId, setEditingFxId] = useState<string | null>(null)

  // Edit fields
  const [editName, setEditName] = useState('')
  const [editTags, setEditTags] = useState('')

  // Preview state
  const [previewTrack, setPreviewTrack] = useState<FXTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const activeFX = storeData.fxTracks.filter((f) => !f.deletedAt)

  const filteredFX = activeFX.filter((f) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const matchName = f.name.toLowerCase().includes(q)
    const matchTag = f.tags?.some((t) => t.toLowerCase().includes(q))
    return matchName || matchTag
  })

  const handleStartPreview = (track: FXTrack) => {
    if (previewTrack?.id === track.id) {
      if (isPlaying) {
        audioEngine.pauseFX(track.name, 'library')
        setIsPlaying(false)
      } else {
        audioEngine.playFX(track.name, 'library')
        setIsPlaying(true)
      }
    } else {
      if (previewTrack) {
        audioEngine.stopFX(previewTrack.name, 'library')
      }
      setPreviewTrack(track)
      setIsPlaying(true)
      audioEngine.playFX(track.name, 'library')
    }
  }

  const handleToggleMiniPlayerPlay = () => {
    if (!previewTrack) return
    if (isPlaying) {
      audioEngine.pauseFX(previewTrack.name, 'library')
      setIsPlaying(false)
    } else {
      audioEngine.playFX(previewTrack.name, 'library')
      setIsPlaying(true)
    }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newTracks: FXTrack[] = []
    Array.from(files).forEach((file, idx) => {
      newTracks.push({
        id: `fx-${Date.now()}-${idx}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        duration: '0:04',
        durationSeconds: 4,
        intensityLevel: 'II',
        tags: ['IMPACT'],
        createdAt: new Date().toISOString(),
      } as FXTrack & { createdAt: string })
    })

    const updated = setData({ fxTracks: [...storeData.fxTracks, ...newTracks] })
    setStoreData(updated)
    e.target.value = ''
  }

  const handleOpenEdit = (fx: FXTrack, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingFxId(fx.id)
    setEditName(fx.name)
    setEditTags(fx.tags.join(', '))
  }

  const handleSaveInlineEdit = (fxId: string) => {
    const tags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const updatedFX = storeData.fxTracks.map((f) =>
      f.id === fxId ? { ...f, name: editName.trim() || f.name, tags } : f,
    )
    const updated = setData({ fxTracks: updatedFX })
    setStoreData(updated)
    setEditingFxId(null)
  }

  const handleDeleteFX = (fxId: string) => {
    const updatedFX = storeData.fxTracks.map((f) =>
      f.id === fxId ? { ...f, deletedAt: new Date().toISOString() } : f,
    )
    // Remove from soundboards as well
    const updatedTiles = storeData.soundboardTiles.filter((t) => t.fxTrackId !== fxId)
    const updated = setData({ fxTracks: updatedFX, soundboardTiles: updatedTiles })
    setStoreData(updated)
    setEditingFxId(null)
    if (previewTrack?.id === fxId) {
      audioEngine.stopFX(previewTrack.name, 'library')
      setPreviewTrack(null)
      setIsPlaying(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 relative">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-400">Library</h1>

        {/* Tab Strip */}
        <div className="flex gap-6 border-b border-zinc-800 mt-4">
          <button
            onClick={() => {
              setActiveTab('soundscapes')
              if (previewTrack) {
                updateTrackState(previewTrack.name, 'stopped', 'library')
                setPreviewTrack(null)
                setIsPlaying(false)
              }
            }}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'soundscapes'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Soundscapes
          </button>
          <button
            onClick={() => setActiveTab('fx')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'fx'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sound Effects
          </button>
        </div>
      </div>

      {activeTab === 'fx' ? (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/40 rounded font-semibold text-xs cursor-pointer flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" />
              Import FX
              <input
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleImportFile}
              />
            </label>
            <button
              onClick={() => setShowBuyModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy More
            </button>
            <button
              onClick={() => setShowFreeModal(true)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Free Tracks
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search effects…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* FX Card Grid */}
          {filteredFX.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              {searchQuery ? (
                <p className="text-zinc-500 font-serif">No effects match your filters</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-zinc-500 font-serif text-lg">No FX tracks in library</p>
                  <p className="text-xs text-zinc-600">Import audio files above to get started.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredFX.map((fx) => {
                const isThisPlaying = previewTrack?.id === fx.id && isPlaying
                const isEditing = editingFxId === fx.id

                return (
                  <div
                    key={fx.id}
                    onClick={() => !isEditing && handleStartPreview(fx)}
                    className={`bg-zinc-900 border rounded-lg p-4 cursor-pointer relative flex flex-col justify-between transition-all ${
                      isThisPlaying
                        ? 'border-amber-400 ring-1 ring-amber-400/50'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center text-amber-400">
                          {isThisPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </div>
                        <button
                          onClick={(e) => handleOpenEdit(fx, e)}
                          aria-label={`Edit ${fx.name}`}
                          className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
                            placeholder="Tags (Combat, Impact)"
                          />
                          <div className="flex justify-between items-center pt-1">
                            <button
                              onClick={() => handleDeleteFX(fx.id)}
                              className="text-red-400 hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                            <button
                              onClick={() => handleSaveInlineEdit(fx.id)}
                              className="px-2 py-1 bg-amber-500 text-zinc-950 font-semibold rounded flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-sm text-zinc-100 line-clamp-1">{fx.name}</div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {fx.duration} · Level {fx.intensityLevel}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {fx.tags?.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800/40 px-1.5 py-0.5 rounded font-semibold uppercase"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 font-serif">
          Browse and manage your soundscape categories.
        </div>
      )}

      {/* FX Mini Player (Sticky at bottom of main area) */}
      {previewTrack && activeTab === 'fx' && (
        <div className="fixed bottom-4 left-4 right-4 md:left-72 max-w-4xl mx-auto bg-zinc-900/95 backdrop-blur border border-amber-500/40 rounded-lg p-3 shadow-2xl flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMiniPlayerPlay}
              className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div>
              <div className="text-xs text-zinc-400 uppercase font-semibold">Previewing</div>
              <div className="text-sm font-serif font-bold text-amber-400">{previewTrack.name}</div>
            </div>
          </div>
          <button
            onClick={() => {
              audioEngine.stopFX(previewTrack.name, 'library')
              setPreviewTrack(null)
              setIsPlaying(false)
            }}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1"
          >
            Close
          </button>
        </div>
      )}

      {/* Storefront Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">Storefront</h2>
            <p className="text-sm text-zinc-300">Explore additional sound effect packs and compositions.</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowBuyModal(false)}
                className="px-4 py-2 bg-amber-500 text-zinc-950 font-semibold text-xs rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Free Tracks Modal */}
      {showFreeModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-serif font-semibold text-amber-400">Free Tracks</h2>
            <p className="text-sm text-zinc-300">Free starter audio packs coming soon.</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFreeModal(false)}
                className="px-4 py-2 bg-amber-500 text-zinc-950 font-semibold text-xs rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
