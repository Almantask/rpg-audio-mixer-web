import React, { useState } from 'react'
import { ArrowLeft, Search, ShoppingCart, ExternalLink, Music } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { audioEngine } from '../../services/audioEngine'

interface SoundscapesPickerModalProps {
  isOpen: boolean
  onClose: () => void
  sceneId: string
}

export const SoundscapesPickerModal: React.FC<SoundscapesPickerModalProps> = ({
  isOpen,
  onClose,
  sceneId,
}) => {
  const { soundscapeCategories, soundscapeTracks, scenes, addCategoriesToScene, showToast } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [previewCategoryId, setPreviewCategoryId] = useState<string | null>(null)

  if (!isOpen) return null

  const activeScene = scenes.find((s) => s.id === sceneId)
  const existingCategoryIds = activeScene?.soundscapeCategories.map((c) => c.categoryId) ?? []

  // Filter out categories already on scene OR categories with 0 tracks
  const availableCategories = soundscapeCategories.filter((cat) => {
    if (existingCategoryIds.includes(cat.id)) return false
    const totalTracks =
      (cat.levels.I?.length || 0) +
      (cat.levels.II?.length || 0) +
      (cat.levels.III?.length || 0)
    if (totalTracks === 0) return false

    if (searchTerm.trim() !== '') {
      return cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  const toggleSelect = (catId: string) => {
    setSelectedIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    )
  }

  const handlePreview = (catId: string) => {
    if (previewCategoryId === catId) {
      audioEngine.stopSoundscapeCategory(catId)
      setPreviewCategoryId(null)
      return
    }

    if (previewCategoryId) {
      audioEngine.stopSoundscapeCategory(previewCategoryId)
    }

    const cat = soundscapeCategories.find((c) => c.id === catId)
    if (!cat) return

    const trackId = cat.levels.I?.[0] || cat.levels.II?.[0] || cat.levels.III?.[0]
    const track = soundscapeTracks.find((t) => t.id === trackId)
    if (!track) return

    audioEngine.playSoundscapeCategory(catId, track.id, track.audioUrl, 'I', 0.8, () => {
      setPreviewCategoryId(null)
    })
    setPreviewCategoryId(catId)
  }

  const handleCommit = () => {
    if (selectedIds.length === 0) return
    addCategoriesToScene(sceneId, selectedIds)
    setSelectedIds([])
    // Modal stays open per PW-26
  }

  const handleClose = () => {
    if (previewCategoryId) {
      audioEngine.stopSoundscapeCategory(previewCategoryId)
      setPreviewCategoryId(null)
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
            <h2 className="font-serif text-2xl font-bold text-yellow-500">Add Soundscape</h2>
            <p className="text-xs text-gray-400">Select soundscapes for this scene.</p>
          </div>
        </div>

        {/* Action Bar & Search */}
        <div className="p-4 bg-[#141414] border-b border-yellow-900/20 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => showToast('Storefront feature in development.')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded bg-yellow-500 text-black hover:bg-yellow-400"
            >
              <ShoppingCart size={14} /> Buy Composition
            </button>
            <button
              onClick={() => showToast('Downloading free demo pack...')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
            >
              <ExternalLink size={14} /> Free Compositions
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search compositions…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-yellow-900/30 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {availableCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Music className="mx-auto mb-3 text-gray-600" size={36} />
              <p>No available soundscape compositions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableCategories.map((cat) => {
                const isSelected = selectedIds.includes(cat.id)
                const isPlaying = previewCategoryId === cat.id
                const trackCount =
                  (cat.levels.I?.length || 0) +
                  (cat.levels.II?.length || 0) +
                  (cat.levels.III?.length || 0)

                return (
                  <div
                    key={cat.id}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                      isPlaying
                        ? 'border-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-500/50'
                        : isSelected
                        ? 'border-yellow-500/80 bg-yellow-900/20'
                        : 'border-yellow-900/20 bg-[#1A1A1A] hover:border-yellow-900/50'
                    }`}
                    onClick={() => handlePreview(cat.id)}
                  >
                    <div className="flex items-start justify-between">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleSelect(cat.id)
                        }}
                        className="w-5 h-5 accent-yellow-500 cursor-pointer"
                      />
                      {isPlaying && (
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-yellow-500 text-black uppercase">
                          ● PLAYING
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <h3 className="font-serif font-bold text-yellow-500 text-lg">{cat.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {trackCount} tracks · {Object.keys(cat.levels).length} intensity levels
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
          <span className="text-xs text-gray-400">
            {selectedIds.length} composition(s) selected
          </span>
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
