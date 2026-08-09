import React, { useState, useEffect } from 'react'
import { Search, Upload, ShoppingCart, Download, Edit2, Play, Pause, X } from 'lucide-react'
import { getDb, saveDb, type FxTrack } from '../lib/storage/db'
import { playFxTrack, stopAllFx } from '../lib/audio/soundboardEngine'

export const AudioLibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'fx'>('fx')
  const [fxList, setFxList] = useState<FxTrack[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Preview state
  const [previewingTrack, setPreviewingTrack] = useState<FxTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Inline edit state
  const [editingFxId, setEditingFxId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTags, setEditTags] = useState('')

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isStorefrontOpen, setIsStorefrontOpen] = useState(false)
  const [isFreeTracksOpen, setIsFreeTracksOpen] = useState(false)
  const [importFileName, setImportFileName] = useState('')
  const [importError, setImportError] = useState('')

  const loadData = () => {
    const db = getDb()
    setFxList(db.fxTracks.filter((f) => !f.deletedAt))
  }

  useEffect(() => {
    loadData()
    return () => {
      stopAllFx()
    }
  }, [])

  const filteredFx = fxList.filter((fx) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return fx.name.toLowerCase().includes(q) || fx.tags.some((t) => t.toLowerCase().includes(q))
  })

  const startPreview = (track: FxTrack) => {
    if (previewingTrack?.id === track.id && isPlaying) {
      stopAllFx()
      setIsPlaying(false)
      setPreviewingTrack(null)
    } else {
      stopAllFx()
      playFxTrack(track.name, 'library')
      setPreviewingTrack(track)
      setIsPlaying(true)
    }
  }

  const toggleMiniPlayerPlayPause = () => {
    if (!previewingTrack) return
    if (isPlaying) {
      stopAllFx()
      setIsPlaying(false)
    } else {
      playFxTrack(previewingTrack.name, 'library')
      setIsPlaying(true)
    }
  }

  const handleTabSwitch = (tab: 'soundscapes' | 'fx') => {
    stopAllFx()
    setPreviewingTrack(null)
    setIsPlaying(false)
    setActiveTab(tab)
  }

  const handleSaveInlineEdit = (fxId: string) => {
    const db = getDb()
    const target = db.fxTracks.find((f) => f.id === fxId)
    if (target) {
      if (editName.trim()) target.name = editName.trim()
      target.tags = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      saveDb(db)
      loadData()
    }
    setEditingFxId(null)
  }

  const handleDeleteFx = (fxId: string) => {
    const db = getDb()
    const target = db.fxTracks.find((f) => f.id === fxId)
    if (target) {
      target.deletedAt = new Date().toISOString()
      // Remove from soundboards
      db.soundboardItems = db.soundboardItems.filter((item) => item.fxTrackId !== fxId)
      saveDb(db)
      loadData()
    }
    if (previewingTrack?.id === fxId) {
      stopAllFx()
      setPreviewingTrack(null)
      setIsPlaying(false)
    }
    setEditingFxId(null)
  }

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFileName.trim()) return
    if (!importFileName.endsWith('.mp3') && !importFileName.endsWith('.ogg') && !importFileName.endsWith('.wav')) {
      setImportError('Invalid audio file format')
      return
    }

    const db = getDb()
    const newFx: FxTrack = {
      id: `fx_${Date.now()}`,
      name: importFileName.replace(/\.[^/.]+$/, ''),
      duration: '0:04',
      intensity: 'I',
      tags: ['Imported'],
    }
    db.fxTracks.unshift(newFx)
    saveDb(db)
    loadData()

    setImportFileName('')
    setImportError('')
    setIsImportModalOpen(false)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-amber-400">Library</h1>
      </div>

      {/* Underline Tabs */}
      <div className="flex items-center gap-6 border-b border-neutral-800">
        <button
          onClick={() => handleTabSwitch('soundscapes')}
          className={`pb-3 font-serif font-medium text-sm transition-colors relative ${
            activeTab === 'soundscapes' ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Soundscapes
          {activeTab === 'soundscapes' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => handleTabSwitch('fx')}
          className={`pb-3 font-serif font-medium text-sm transition-colors relative ${
            activeTab === 'fx' ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Sound Effects
          {activeTab === 'fx' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>
      </div>

      {activeTab === 'soundscapes' ? (
        <div className="bg-[#121212] border border-neutral-800 rounded-xl p-10 text-center space-y-4">
          <p className="text-sm text-neutral-400">
            Browse and manage soundscape categories in your master catalogue.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Import FX</span>
            </button>

            <button
              onClick={() => setIsStorefrontOpen(true)}
              className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buy More</span>
            </button>

            <button
              onClick={() => setIsFreeTracksOpen(true)}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Free Tracks</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search effects…"
              className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* FX Grid */}
          {fxList.length === 0 ? (
            <div className="bg-[#121212] border border-neutral-800 rounded-xl p-10 text-center space-y-4">
              <h3 className="font-serif text-lg font-semibold text-neutral-300">
                FX library is empty
              </h3>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                Directing you to import or download FX tracks for your collection.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 text-black font-semibold text-sm rounded-lg"
                >
                  Import FX
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFx.map((fx) => {
                const isCurrentPreview = previewingTrack?.id === fx.id && isPlaying
                const isEditing = editingFxId === fx.id

                return (
                  <div
                    key={fx.id}
                    data-testid={`fx-card-${fx.name}`}
                    onClick={() => startPreview(fx)}
                    className={`bg-[#121212] border rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                      isCurrentPreview
                        ? 'border-amber-400 bg-amber-950/20 shadow-md shadow-amber-950/40'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="block text-[10px] font-semibold text-neutral-400 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-neutral-400 mb-1">
                            Tags (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-100"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => handleDeleteFx(fx.id)}
                            className="text-xs text-red-400 hover:underline font-semibold"
                          >
                            Delete
                          </button>

                          <button
                            onClick={() => handleSaveInlineEdit(fx.id)}
                            className="px-3 py-1 bg-amber-500 text-black text-xs font-semibold rounded"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-bold text-purple-400 px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-500/20">
                            {fx.intensity}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingFxId(fx.id)
                              setEditName(fx.name)
                              setEditTags(fx.tags.join(', '))
                            }}
                            aria-label={`Edit ${fx.name}`}
                            className="p-1 text-neutral-500 hover:text-amber-400 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-serif text-sm font-semibold text-neutral-100 truncate">
                            {fx.name}
                          </h4>
                          <p className="text-[10px] text-neutral-500 font-medium">{fx.duration}</p>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap pt-1">
                          {fx.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] uppercase font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/20"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Mini Player */}
      {activeTab === 'fx' && previewingTrack && (
        <div
          data-testid="fx-mini-player"
          className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 bg-[#161616] border border-amber-500/40 rounded-xl p-3 shadow-2xl z-40 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMiniPlayerPlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-semibold hover:bg-amber-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div>
              <p className="font-serif text-sm font-semibold text-neutral-100">
                {previewingTrack.name}
              </p>
              <p className="text-[10px] text-amber-400 font-medium">Previewing</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAllFx()
              setPreviewingTrack(null)
              setIsPlaying(false)
            }}
            className="p-1 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="font-serif text-xl font-bold text-amber-400">Import FX</h2>

            {importError && (
              <p className="text-xs text-red-400 font-medium bg-red-950/50 border border-red-800 p-2 rounded">
                {importError}
              </p>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Audio File Name (.mp3, .ogg, .wav)
                </label>
                <input
                  type="text"
                  value={importFileName}
                  onChange={(e) => setImportFileName(e.target.value)}
                  placeholder="e.g. wolf_howl.mp3"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm"
                >
                  Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Free Tracks Modal */}
      {isFreeTracksOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-sm w-full space-y-4 text-center">
            <h3 className="font-serif text-lg font-bold text-amber-400">Free Tracks</h3>
            <p className="text-sm text-neutral-300">
              Demo FX packs are coming soon to Arcanum Audio!
            </p>
            <button
              onClick={() => setIsFreeTracksOpen(false)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Storefront Modal */}
      {isStorefrontOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-900/40 rounded-xl p-6 max-w-sm w-full space-y-4 text-center">
            <h3 className="font-serif text-lg font-bold text-amber-400">Arcanum Storefront</h3>
            <p className="text-sm text-neutral-300">
              Premium FX expansion packs coming soon!
            </p>
            <button
              onClick={() => setIsStorefrontOpen(false)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
