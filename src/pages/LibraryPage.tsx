import React, { useState, useEffect } from 'react'
import {
  getActiveFXTracks,
  createFXTrack,
  updateFXTrack,
  softDeleteFXTrack,
} from '../services/libraryService'
import { audioEngine } from '../services/audioEngine'
import type { FXTrack } from '../types/library'
import { Search, Upload, Download, Sparkles, Play, Pause, Edit2, Trash2, X, Music } from 'lucide-react'

export const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'fx'>('fx')
  const [fxTracks, setFxTracks] = useState<FXTrack[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)

  // Edit inline modal
  const [editingTrack, setEditingTrack] = useState<FXTrack | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [intensityInput, setIntensityInput] = useState<'I' | 'II' | 'III'>('I')

  const refreshFX = () => {
    setFxTracks(getActiveFXTracks())
  }

  useEffect(() => {
    refreshFX()
    return () => {
      audioEngine.stopAll()
    }
  }, [])

  const filteredFX = fxTracks.filter((t) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q))
  })

  const togglePreview = async (track: FXTrack, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (playingTrackId === track.id) {
      audioEngine.stopFXTrack(track.id)
      setPlayingTrackId(null)
    } else {
      audioEngine.stopAll()
      setPlayingTrackId(track.id)
      await audioEngine.playFX({
        id: track.id,
        name: track.name,
        audioUrl: track.audioUrl,
        source: 'library',
      })
    }
  }

  const handleImportFX = () => {
    createFXTrack({
      name: `Imported Effect ${fxTracks.length + 1}`,
      intensity: 'II',
      tags: ['IMPORTED'],
    })
    refreshFX()
  }

  const handleFreeTracks = () => {
    createFXTrack({
      name: 'Demo Sound FX',
      intensity: 'I',
      tags: ['DEMO'],
    })
    refreshFX()
  }

  const openInlineEdit = (track: FXTrack, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTrack(track)
    setNameInput(track.name)
    setTagsInput(track.tags.join(', '))
    setIntensityInput(track.intensity)
  }

  const saveInlineEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTrack || !nameInput.trim()) return
    const tagsArr = tagsInput.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean)
    updateFXTrack(editingTrack.id, {
      name: nameInput,
      tags: tagsArr,
      intensity: intensityInput,
    })
    setEditingTrack(null)
    refreshFX()
  }

  const handleDeleteFX = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (playingTrackId === id) {
      audioEngine.stopFXTrack(id)
      setPlayingTrackId(null)
    }
    softDeleteFXTrack(id)
    if (editingTrack?.id === id) setEditingTrack(null)
    refreshFX()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header & Tabs */}
      <div className="space-y-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-amber-400">Library</h1>
          <p className="text-stone-400 text-sm mt-1">Browse, import, and manage your audio collection.</p>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-amber-900/30">
          <button
            type="button"
            onClick={() => setActiveTab('soundscapes')}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'soundscapes'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Soundscapes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fx')}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'fx'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Sound Effects
          </button>
        </div>
      </div>

      {activeTab === 'soundscapes' ? (
        <div className="text-center py-12 bg-stone-900/30 rounded-xl border border-dashed border-stone-800 space-y-2">
          <Music className="w-10 h-10 text-stone-600 mx-auto" />
          <h2 className="font-serif text-lg text-amber-400 font-semibold">Soundscapes Library</h2>
          <p className="text-stone-400 text-sm">Switch to the Sound Effects tab to manage FX tracks.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleImportFX}
              className="px-4 py-2 rounded-lg border border-amber-900/50 hover:bg-stone-800 text-amber-300 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import FX</span>
            </button>
            <button
              type="button"
              onClick={handleFreeTracks}
              className="px-4 py-2 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-300 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Free Tracks</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search effects…"
              className="w-full bg-[#121212] border border-amber-900/30 rounded-xl pl-10 pr-4 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500 placeholder:text-stone-500"
            />
          </div>

          {/* FX Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFX.length === 0 ? (
              <div className="col-span-full text-center py-8 text-stone-400 text-sm bg-stone-900/30 rounded-xl border border-dashed border-stone-800">
                No effects match your filters.
              </div>
            ) : (
              filteredFX.map((track) => {
                const isPlaying = playingTrackId === track.id
                return (
                  <div
                    key={track.id}
                    onClick={() => togglePreview(track)}
                    className={`bg-[#121212] border rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between space-y-3 relative group ${
                      isPlaying
                        ? 'border-amber-400 bg-amber-950/20 shadow-lg shadow-amber-950/50'
                        : 'border-stone-800 hover:border-amber-900/50'
                    }`}
                  >
                    {/* Thumbnail & Title */}
                    <div className="space-y-2">
                      <div className="w-full aspect-square rounded-lg bg-stone-800 border border-stone-700/60 flex items-center justify-center text-purple-400 relative overflow-hidden">
                        {isPlaying ? (
                          <div className="absolute inset-0 bg-amber-500/20 flex flex-col items-center justify-center gap-1 text-amber-300 font-bold text-xs">
                            <Pause className="w-6 h-6 fill-amber-300" />
                            <span>● PLAYING</span>
                          </div>
                        ) : (
                          <Play className="w-6 h-6 fill-purple-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-serif text-sm font-bold text-stone-100 line-clamp-1 group-hover:text-amber-300">
                          {track.name}
                        </h3>
                        <p className="text-[11px] text-stone-400 font-sans mt-0.5">
                          0:0{track.durationSeconds} · <strong className="text-amber-400/90">{track.intensity}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Footer Tags & Edit button */}
                    <div className="flex items-center justify-between border-t border-stone-800/60 pt-2">
                      <div className="flex flex-wrap gap-1">
                        {track.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[9px] font-bold uppercase tracking-wider bg-purple-950/70 text-purple-300 border border-purple-900/50 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        aria-label={`Edit effect ${track.name}`}
                        onClick={(e) => openInlineEdit(track, e)}
                        className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Sticky FX Mini Player */}
          {playingTrackId && (
            <div className="fixed bottom-4 left-4 right-4 md:left-72 max-w-3xl mx-auto bg-[#141414] border border-amber-500/60 rounded-xl p-3 shadow-2xl flex items-center justify-between gap-4 z-40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-950 text-amber-400 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Previewing FX</span>
                  <p className="font-serif text-sm font-bold text-stone-100">
                    {fxTracks.find((t) => t.id === playingTrackId)?.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  audioEngine.stopAll()
                  setPlayingTrackId(null)
                }}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Stop
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline Card Edit Dialog */}
      {editingTrack && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="edit-fx-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 id="edit-fx-title" className="font-serif text-xl font-bold text-amber-400">Edit Effect</h2>
              <button type="button" onClick={() => setEditingTrack(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveInlineEdit} className="space-y-4">
              <div>
                <label htmlFor="fx-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Effect Name *
                </label>
                <input
                  id="fx-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="fx-intensity" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Intensity Level
                </label>
                <select
                  id="fx-intensity"
                  value={intensityInput}
                  onChange={(e) => setIntensityInput(e.target.value as 'I' | 'II' | 'III')}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="I">Level I</option>
                  <option value="II">Level II</option>
                  <option value="III">Level III</option>
                </select>
              </div>

              <div>
                <label htmlFor="fx-tags" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  id="fx-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => handleDeleteFX(editingTrack.id)}
                  className="px-3 py-2 rounded-lg bg-red-950/60 border border-red-900/60 text-red-400 text-sm hover:bg-red-900/50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete Effect
                </button>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setEditingTrack(null)} className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-sm hover:bg-stone-800">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
