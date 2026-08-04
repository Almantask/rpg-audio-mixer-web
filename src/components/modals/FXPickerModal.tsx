import React, { useState } from 'react'
import { ArrowLeft, Search, Volume2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { audioEngine } from '../../services/audioEngine'

interface FXPickerModalProps {
  isOpen: boolean
  onClose: () => void
  sceneId: string
}

export const FXPickerModal: React.FC<FXPickerModalProps> = ({ isOpen, onClose, sceneId }) => {
  const { fxTracks, scenes, addFXToScene } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [previewFXId, setPreviewFXId] = useState<string | null>(null)

  if (!isOpen) return null

  const activeScene = scenes.find((s) => s.id === sceneId)
  const existingFXIds = activeScene?.soundboardTiles.map((t) => t.fxTrackId) ?? []

  // Exclude FX already on board
  const availableFX = fxTracks.filter((fx) => {
    if (existingFXIds.includes(fx.id)) return false
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      return (
        fx.title.toLowerCase().includes(term) ||
        fx.tags.some((t) => t.toLowerCase().includes(term))
      )
    }
    return true
  })

  const toggleSelect = (fxId: string) => {
    setSelectedIds((prev) =>
      prev.includes(fxId) ? prev.filter((id) => id !== fxId) : [...prev, fxId]
    )
  }

  const handlePreview = (fx: typeof fxTracks[0]) => {
    if (previewFXId === fx.id) {
      audioEngine.stopFX(fx.id)
      setPreviewFXId(null)
      return
    }

    setPreviewFXId(fx.id)
    audioEngine.playFX(fx.id, fx.audioUrl, fx.defaultVolume ?? 0.8, () => {
      setPreviewFXId(null)
    })
  }

  const handleCommit = () => {
    if (selectedIds.length === 0) return
    addFXToScene(sceneId, selectedIds)
    setSelectedIds([])
    // Modal stays open per PW-26
  }

  const handleClose = () => {
    if (previewFXId) {
      audioEngine.stopFX(previewFXId)
      setPreviewFXId(null)
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
              <span>Back to Active Scene</span>
            </button>
            <h2 className="font-serif text-2xl font-bold text-yellow-500">Sound Effects</h2>
            <p className="text-xs text-gray-400">Select effects for this scene's soundboard.</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 bg-[#141414] border-b border-yellow-900/20">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search effects…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {availableFX.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Volume2 className="mx-auto mb-3 text-gray-600" size={36} />
              <p>No available sound effects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableFX.map((fx) => {
                const isSelected = selectedIds.includes(fx.id)
                const isPlaying = previewFXId === fx.id

                return (
                  <div
                    key={fx.id}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                      isPlaying
                        ? 'border-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-500/50'
                        : isSelected
                        ? 'border-yellow-500/80 bg-yellow-900/20'
                        : 'border-yellow-900/20 bg-[#1A1A1A] hover:border-yellow-900/50'
                    }`}
                    onClick={() => handlePreview(fx)}
                  >
                    <div className="flex items-start justify-between">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleSelect(fx.id)
                        }}
                        className="w-5 h-5 accent-yellow-500 cursor-pointer"
                      />
                      {isPlaying && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500 text-black">
                          ● PLAYING
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <h4 className="font-medium text-gray-200 text-sm truncate">{fx.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        0:0{fx.durationSeconds ?? 3} · {fx.defaultIntensity ?? 'I'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {fx.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-yellow-900/20 bg-[#121212] flex items-center justify-between">
          <span className="text-xs text-gray-400">{selectedIds.length} effect(s) selected</span>
          <button
            onClick={handleCommit}
            disabled={selectedIds.length === 0}
            className="px-6 py-2.5 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Selected ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  )
}
