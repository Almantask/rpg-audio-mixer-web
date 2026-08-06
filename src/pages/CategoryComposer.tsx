import React, { useState } from 'react'
import { Plus, Play, Pause, Trash2, ArrowLeft, X, Search, ChevronDown, ChevronRight, Upload, Check } from 'lucide-react'
import type { SoundscapeCategory, SoundscapeTrack } from '../types'
import { storage } from '../lib/storage'

interface CategoryComposerProps {
  category: SoundscapeCategory
  soundscapeLibrary?: SoundscapeTrack[]
  isLoadingLibrary?: boolean
  onBackToLibrary: () => void
  onAddTrackToLevel: (level: 'level1' | 'level2' | 'level3', track: SoundscapeTrack) => void
  onRemoveTrackFromLevel: (level: 'level1' | 'level2' | 'level3', trackId: string) => void
  onSaveComposition?: () => void
  onImportTrack?: (file: File) => void
}

export const CategoryComposer: React.FC<CategoryComposerProps> = ({
  category,
  soundscapeLibrary = [],
  isLoadingLibrary = false,
  onBackToLibrary,
  onAddTrackToLevel,
  onRemoveTrackFromLevel,
  onSaveComposition,
  onImportTrack,
}) => {
  const [expandedLevels, setExpandedLevels] = useState<{ level1: boolean; level2: boolean; level3: boolean }>({
    level1: true,
    level2: false,
    level3: false,
  })

  const [activePickerLevel, setActivePickerLevel] = useState<'level1' | 'level2' | 'level3' | null>(null)
  const [pickerSearch, setPickerSearch] = useState('')
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const toggleLevel = (lvl: 'level1' | 'level2' | 'level3') => {
    setExpandedLevels((prev) => ({ ...prev, [lvl]: !prev[lvl] }))
  }

  const openPicker = (lvl: 'level1' | 'level2' | 'level3') => {
    setActivePickerLevel(lvl)
    setPickerSearch('')
    setSelectedTrackIds([])
    setPreviewingTrackId(null)
  }

  const closePicker = () => {
    setPreviewingTrackId(null)
    setActivePickerLevel(null)
  }

  const handleToggleTrackCheck = (trId: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trId) ? prev.filter((id) => id !== trId) : [...prev, trId]
    )
  }

  const [extraLocalTracks, setExtraLocalTracks] = useState<SoundscapeTrack[]>([])
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false)
  const [pendingPlaylistUrl, setPendingPlaylistUrl] = useState('')

  const handleImportYoutube = () => {
    if (!youtubeUrl.trim() || !activePickerLevel) return
    const url = youtubeUrl.trim()
    if (url.includes('list=')) {
      setPendingPlaylistUrl(url)
      setShowPlaylistDialog(true)
    } else {
      const match = url.match(/v=([^&]+)/) || url.match(/youtu\.be\/([^&]+)/)
      const idStr = match ? match[1] : '12345'
      const ytTrack: SoundscapeTrack = {
        id: `yt-${idStr}`,
        name: `YouTube Video ${idStr}`,
        audioUrl: url,
        durationSeconds: 300,
        isYoutube: true,
        offlineReady: false,
      }
      setExtraLocalTracks((prev) => [...prev, ytTrack])
      setSelectedTrackIds((prev) => [...prev, ytTrack.id])
      setYoutubeUrl('')
    }
  }

  const handleConfirmPlaylistImport = () => {
    if (!pendingPlaylistUrl || !activePickerLevel) return
    const match = pendingPlaylistUrl.match(/list=([^&]+)/)
    const listId = match ? match[1] : 'PL6789'
    const plTrack: SoundscapeTrack = {
      id: `yt-pl-${listId}`,
      name: `YouTube Playlist (${listId})`,
      audioUrl: pendingPlaylistUrl,
      durationSeconds: 600,
      isYoutube: true,
      isPlaylist: true,
      offlineReady: false,
    }
    setExtraLocalTracks((prev) => [...prev, plTrack])
    setSelectedTrackIds((prev) => [...prev, plTrack.id])
    setPendingPlaylistUrl('')
    setShowPlaylistDialog(false)
    setYoutubeUrl('')
  }

  const handleToggleOfflineReady = (lvlId: 'level1' | 'level2' | 'level3', trackId: string) => {
    const lvlKey = lvlId
    const track = levelConfigs.find((l) => l.id === lvlId)?.tracks.find((t) => t.id === trackId)
    if (track) {
      track.offlineReady = !track.offlineReady
      setExtraLocalTracks((prev) => [...prev])
      showToast(track.offlineReady ? 'Offline Ready' : 'Online Only')
    }
  }

  // Derive library tracks directly from prop or fresh storage
  const effectiveLibrary: SoundscapeTrack[] = React.useMemo(() => {
    const fromStorage = storage.getFxLibrary().map((f) => ({
      id: f.id,
      name: f.name,
      audioUrl: f.audioUrl,
      durationSeconds: f.durationSeconds,
    }))
    const merged = [...soundscapeLibrary, ...extraLocalTracks]
    fromStorage.forEach((st) => {
      if (!merged.some((m) => m.id === st.id)) {
        merged.push(st)
      }
    })
    return merged
  }, [soundscapeLibrary, extraLocalTracks, activePickerLevel])

  const handleCommitAddSelected = () => {
    if (!activePickerLevel || selectedTrackIds.length === 0) return
    const count = selectedTrackIds.length
    selectedTrackIds.forEach((trId) => {
      const track = effectiveLibrary.find((t) => t.id === trId) || {
        id: trId,
        name: trId,
        audioUrl: '/assets/audio/crowd.ogg',
        durationSeconds: 222,
      }
      onAddTrackToLevel(activePickerLevel, track)
    })
    showToast(`${count} ${count === 1 ? 'track' : 'tracks'} added`)
    setSelectedTrackIds([])
  }

  const handleSave = () => {
    if (onSaveComposition) onSaveComposition()
    showToast('Composition saved')
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && activePickerLevel) {
      if (onImportTrack) onImportTrack(file)
      const importedTrack: SoundscapeTrack = {
        id: `tr-${file.name}`,
        name: file.name,
        audioUrl: URL.createObjectURL(file),
        durationSeconds: 180,
      }
      setExtraLocalTracks((prev) => [...prev, importedTrack])
      setSelectedTrackIds((prev) => [...prev, importedTrack.id])
    }
  }

  // Filter available tracks for current active level in picker
  const currentLevelTrackIds = activePickerLevel ? category.tracks[activePickerLevel].map((t) => t.id) : []
  const availableTracks = effectiveLibrary.filter(
    (tr) => !currentLevelTrackIds.includes(tr.id) && tr.name.toLowerCase().includes(pickerSearch.toLowerCase())
  )

  const levelConfigs: { id: 'level1' | 'level2' | 'level3'; label: string; levelNumName: string; tracks: SoundscapeTrack[] }[] = [
    { id: 'level1', label: 'Level I', levelNumName: 'Level I', tracks: category.tracks.level1 },
    { id: 'level2', label: 'Level II', levelNumName: 'Level II', tracks: category.tracks.level2 },
    { id: 'level3', label: 'Level III', levelNumName: 'Level III', tracks: category.tracks.level3 },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-amber-500 text-black px-4 py-2 rounded-lg shadow-lg font-semibold text-sm z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <button
            onClick={onBackToLibrary}
            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1 mb-1"
          >
            ← Library
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-amber-500/80 uppercase tracking-wider">{category.name}</span>
            <h1 className="text-3xl font-serif font-bold text-gray-100">Category Composer</h1>
          </div>
          <p className="text-gray-400 text-sm">Assign tracks to intensity levels for this category.</p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition shadow"
        >
          Save Composition
        </button>
      </div>

      {/* Fixed Intensity Levels */}
      <div className="space-y-4">
        {levelConfigs.map((lvl) => {
          const isExpanded = expandedLevels[lvl.id]

          return (
            <div key={lvl.id} data-testid={`level-card-${lvl.id}`} className="bg-[#121212] border border-amber-900/30 rounded-xl overflow-hidden">
              {/* Level Header Row */}
              <div
                data-testid={`level-header-${lvl.id}`}
                onClick={() => toggleLevel(lvl.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition select-none"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-amber-400" /> : <ChevronRight className="w-5 h-5 text-amber-400" />}
                  <h3 className="text-lg font-serif font-bold text-amber-400">{lvl.label}</h3>
                  {!isExpanded && (
                    <span className="text-xs text-gray-500 font-mono">
                      {lvl.tracks.length} {lvl.tracks.length === 1 ? 'track' : 'tracks'}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openPicker(lvl.id)
                    setExpandedLevels((prev) => ({ ...prev, [lvl.id]: true }))
                  }}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add track
                </button>
              </div>

              {/* Expanded Level Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-amber-900/20 space-y-3">
                  {lvl.tracks.length === 0 ? null : (
                    <div className="space-y-2">
                      {lvl.tracks.map((tr) => (
                        <div
                          key={tr.id}
                          data-testid="track-row"
                          className="bg-[#0D0D0D] border border-amber-900/20 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-semibold text-sm text-gray-200">{tr.name}</span>
                              {(tr.isYoutube || tr.name.includes('YouTube')) && (
                                <span className="px-1.5 py-0.5 bg-red-950 border border-red-800 text-red-400 text-[10px] font-bold rounded">YouTube</span>
                              )}
                              {(tr.isPlaylist || tr.name.includes('Playlist')) && (
                                <span className="px-1.5 py-0.5 bg-purple-950 border border-purple-800 text-purple-400 text-[10px] font-bold rounded">Playlist</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">MP3 · Stereo · 3:42</div>
                            {(tr.isYoutube || tr.name.includes('YouTube')) && (
                              <div className="flex items-center gap-3 pt-1">
                                <span className="text-xs text-amber-400/90 font-medium">
                                  Status: {tr.offlineReady ? 'Offline Ready' : 'Online Only'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleOfflineReady(lvl.id, tr.id)}
                                  className="text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
                                >
                                  Make Offline-Ready
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => onRemoveTrackFromLevel(lvl.id, tr.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 rounded transition"
                            title="Remove track"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Track Picker Modal */}
      {activePickerLevel && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="space-y-1">
              <button
                onClick={closePicker}
                className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1 mb-1"
              >
                ← Category Composer
              </button>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-amber-400">Add track</h2>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import</span>
                    <input type="file" accept="audio/*" onChange={handleImportFile} className="hidden" />
                  </label>
                  <button onClick={closePicker} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Add tracks to Level {activePickerLevel === 'level1' ? 'I' : activePickerLevel === 'level2' ? 'II' : 'III'}.
              </p>
            </div>

            {/* YouTube Import Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter YouTube video or playlist URL..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1 bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleImportYoutube}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg transition"
              >
                Import YouTube
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tracks…"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Picker Grid / List */}
            <div className="flex-1 overflow-y-auto min-h-[200px] space-y-2 pr-1">
              {isLoadingLibrary ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-[#0D0D0D] rounded-lg animate-pulse h-12" />
                  ))}
                </div>
              ) : effectiveLibrary.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-sm text-gray-400">No tracks in library.</p>
                  <p className="text-xs text-gray-500">Import tracks via Import button to add audio.</p>
                </div>
              ) : availableTracks.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-gray-400">No tracks match your filters</p>
                  <button
                    onClick={() => setPickerSearch('')}
                    className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-500/20"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                availableTracks.map((tr) => {
                  const isChecked = selectedTrackIds.includes(tr.id)
                  const isPreviewing = previewingTrackId === tr.id

                  return (
                    <div
                      key={tr.id}
                      onClick={() => handleToggleTrackCheck(tr.id)}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition select-none ${
                        isChecked ? 'bg-amber-950/20 border-amber-500/50' : 'bg-[#0D0D0D] border-amber-900/20 hover:border-amber-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`Preview ${tr.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewingTrackId(isPreviewing ? null : tr.id)
                          }}
                          className={`p-1.5 rounded transition ${isPreviewing ? 'bg-amber-400 text-black' : 'text-amber-400 hover:bg-amber-500/10'}`}
                        >
                          {isPreviewing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-semibold text-sm text-gray-200">{tr.name}</span>
                            {(tr.isYoutube || tr.name.includes('YouTube')) && (
                              <span className="px-1.5 py-0.5 bg-red-950 border border-red-800 text-red-400 text-[10px] font-bold rounded">YouTube</span>
                            )}
                            {(tr.isPlaylist || tr.name.includes('Playlist')) && (
                              <span className="px-1.5 py-0.5 bg-purple-950 border border-purple-800 text-purple-400 text-[10px] font-bold rounded">Playlist</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">MP3 · Stereo · 3:42</div>
                        </div>
                      </div>

                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleTrackCheck(tr.id)
                        }}
                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${
                          isChecked ? 'bg-amber-400 border-amber-400 text-black' : 'border-gray-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] lucide-check" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-900/20">
              <span className="text-xs text-gray-400">{selectedTrackIds.length} selected</span>
              <div className="flex gap-2">
                <button onClick={closePicker} className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm">
                  Cancel
                </button>
                <button
                  disabled={selectedTrackIds.length === 0}
                  onClick={handleCommitAddSelected}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-lg transition"
                >
                  Add Selected ({selectedTrackIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Link Dialog */}
      {showPlaylistDialog && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/40 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-serif font-bold text-amber-400">Attach YouTube Playlist</h3>
            <p className="text-sm text-gray-300">How would you like to attach this playlist?</p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmPlaylistImport}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition"
              >
                Keep linked to YouTube (Live-linked)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
