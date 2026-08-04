import React, { useState, useRef } from 'react'
import { ArrowLeft, Search, Upload, Music } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { audioEngine } from '../../services/audioEngine'

interface TrackPickerModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  intensity: 'I' | 'II' | 'III'
}

export const TrackPickerModal: React.FC<TrackPickerModalProps> = ({
  isOpen,
  onClose,
  categoryId,
  intensity,
}) => {
  const {
    soundscapeCategories,
    soundscapeTracks,
    addTrackToCategoryLevel,
    importSoundscapeTrack,
    showToast,
  } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const category = soundscapeCategories.find((c) => c.id === categoryId)
  const currentLevelTrackIds = category?.levels[intensity] || []

  // Filter out tracks already on THIS level (PW-45: duplicates allowed across levels, blocked within same level)
  const availableTracks = soundscapeTracks.filter((track) => {
    if (currentLevelTrackIds.includes(track.id)) return false
    if (searchTerm.trim() !== '') {
      return track.title.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  const toggleSelect = (trackId: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    )
  }

  const handlePreview = (track: typeof soundscapeTracks[0]) => {
    if (previewTrackId === track.id) {
      audioEngine.stopSoundscapeCategory('preview-track')
      setPreviewTrackId(null)
      return
    }

    if (previewTrackId) {
      audioEngine.stopSoundscapeCategory('preview-track')
    }

    audioEngine.playSoundscapeCategory(
      'preview-track',
      track.id,
      track.audioUrl,
      'I',
      0.8,
      () => setPreviewTrackId(null)
    )
    setPreviewTrackId(track.id)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileUrl = URL.createObjectURL(file)
    const newTrack = importSoundscapeTrack(file.name.replace(/\.[^/.]+$/, ''), fileUrl, 'Local')
    setSelectedTrackIds((prev) => [...prev, newTrack.id])
  }

  const handleCommit = () => {
    if (selectedTrackIds.length === 0) return
    selectedTrackIds.forEach((tId) => {
      addTrackToCategoryLevel(categoryId, intensity, tId)
    })
    showToast(`${selectedTrackIds.length} track(s) added to Level ${intensity}.`)
    setSelectedTrackIds([])
  }

  const handleClose = () => {
    if (previewTrackId) {
      audioEngine.stopSoundscapeCategory('preview-track')
      setPreviewTrackId(null)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-[#161616] border border-yellow-900/40 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-yellow-900/20 bg-[#121212] flex items-center justify-between">
          <div>
            <button
              onClick={handleClose}
              className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 font-medium mb-1"
            >
              <ArrowLeft size={16} />
              <span>Back to Category Composer</span>
            </button>
            <h2 className="font-serif text-2xl font-bold text-yellow-500">Add track</h2>
            <p className="text-xs text-gray-400">Add tracks to Level {intensity}.</p>
          </div>
        </div>

        {/* Action & Search */}
        <div className="p-4 bg-[#141414] border-b border-yellow-900/20 flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept="audio/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Upload size={14} /> Import Track
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search tracks…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {availableTracks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Music className="mx-auto mb-3 text-gray-600" size={36} />
              <p>No available tracks for Level {intensity}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableTracks.map((track) => {
                const isSelected = selectedTrackIds.includes(track.id)
                const isPlaying = previewTrackId === track.id

                return (
                  <div
                    key={track.id}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                      isPlaying
                        ? 'border-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-500/50'
                        : isSelected
                        ? 'border-yellow-500/80 bg-yellow-900/20'
                        : 'border-yellow-900/20 bg-[#1A1A1A] hover:border-yellow-900/50'
                    }`}
                    onClick={() => handlePreview(track)}
                  >
                    <div className="flex items-start justify-between">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleSelect(track.id)
                        }}
                        className="w-5 h-5 accent-yellow-500 cursor-pointer"
                      />
                      {isPlaying && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500 text-black">
                          ● PLAYING
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <h4 className="font-medium text-gray-200 text-sm truncate">{track.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {track.format || 'MP3'} · {track.channels || 'Stereo'} · 3:42
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-yellow-900/20 bg-[#121212] flex items-center justify-between">
          <span className="text-xs text-gray-400">{selectedTrackIds.length} track(s) selected</span>
          <button
            onClick={handleCommit}
            disabled={selectedTrackIds.length === 0}
            className="px-6 py-2.5 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Selected ({selectedTrackIds.length})
          </button>
        </div>
      </div>
    </div>
  )
}
