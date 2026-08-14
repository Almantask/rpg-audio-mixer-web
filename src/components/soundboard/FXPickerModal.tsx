import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Check, Play, Pause, X } from 'lucide-react'
import { db } from '../../storage/db'
import { sceneAudioManager } from '../../audio/sceneAudioManager'
import type { FXTrack } from '../../types'

interface FXPickerModalProps {
  isOpen: boolean
  existingEffectIds: string[]
  onClose: () => void
  onCommit: (selectedFX: FXTrack[]) => void
}

export const FXPickerModal: React.FC<FXPickerModalProps> = ({
  isOpen,
  existingEffectIds,
  onClose,
  onCommit,
}) => {
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      if (previewingId) {
        sceneAudioManager.stopBySource('picker')
        setPreviewingId(null)
      }
      setCheckedIds([])
      setSearchQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const allFX = db.getFXTracks()
  // Exclude FX already on soundboard
  const availableFX = allFX.filter((fx) => !existingEffectIds.includes(fx.id))

  const filteredFX = availableFX.filter((fx) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const matchTitle = fx.title.toLowerCase().includes(q)
    const matchTag = fx.tags.some((t) => t.toLowerCase().includes(q))
    return matchTitle || matchTag
  })

  const handleToggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id))
    } else {
      setCheckedIds([...checkedIds, id])
    }
  }

  const handleCardClick = (fx: FXTrack) => {
    if (previewingId === fx.id) {
      sceneAudioManager.stopTrack(fx.id, fx.title, 'picker')
      setPreviewingId(null)
    } else {
      if (previewingId) {
        sceneAudioManager.stopBySource('picker')
      }
      sceneAudioManager.playTrack(fx.id, fx.title, 'picker', fx.fileUrl)
      setPreviewingId(fx.id)
    }
  }

  const handleAddSelected = () => {
    const selectedTracks = availableFX.filter((fx) => checkedIds.includes(fx.id))
    if (selectedTracks.length === 0) return

    onCommit(selectedTracks)
    setToastMessage(`${selectedTracks.length} effect${selectedTracks.length > 1 ? 's' : ''} added`)
    setTimeout(() => setToastMessage(null), 3000)
    setCheckedIds([])
  }

  const handleBackLink = () => {
    if (previewingId) {
      sceneAudioManager.stopBySource('picker')
      setPreviewingId(null)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Top Header */}
      <div className="h-16 bg-neutral-900 border-b border-neutral-800 px-6 flex items-center justify-between">
        <button
          onClick={handleBackLink}
          className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Active Scene
        </button>

        <button
          onClick={handleAddSelected}
          disabled={checkedIds.length === 0}
          className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
            checkedIds.length > 0
              ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950 shadow-md cursor-pointer'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
          }`}
        >
          Add Selected ({checkedIds.length})
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-100">Sound Effects</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Select effects for this scene's soundboard.
          </p>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-amber-500 text-neutral-950 font-bold px-4 py-2.5 rounded-lg shadow-lg flex items-center justify-between text-sm animate-fade-in">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search effects…"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Content States */}
        {availableFX.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center space-y-3">
            <p className="text-neutral-300 font-medium">
              Every effect in your library is already on this soundboard, or your library is empty.
            </p>
            <p className="text-xs text-neutral-400">
              Go to <span className="text-amber-400 font-semibold">Library — Sound Effects</span> to import or acquire more tracks.
            </p>
          </div>
        ) : filteredFX.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-3">
            <p className="text-neutral-300 font-medium">No effects match your filters</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-amber-400 hover:underline text-sm font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFX.map((fx) => {
              const isChecked = checkedIds.includes(fx.id)
              const isPlaying = previewingId === fx.id

              return (
                <div
                  key={fx.id}
                  onClick={() => handleCardClick(fx)}
                  className={`bg-neutral-900 border rounded-xl p-4 cursor-pointer flex flex-col justify-between transition-all relative group ${
                    isPlaying
                      ? 'border-amber-500 bg-amber-950/20 shadow-md'
                      : isChecked
                      ? 'border-amber-500/60 bg-neutral-850'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                  data-fx-picker-card={fx.title}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isPlaying
                              ? 'bg-amber-500 text-neutral-950'
                              : 'bg-neutral-800 text-neutral-300 group-hover:bg-amber-500/20 group-hover:text-amber-400'
                          }`}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </div>
                        <h4 className="font-bold text-neutral-100 text-sm">{fx.title}</h4>
                      </div>

                      {/* Checkbox */}
                      <button
                        onClick={(e) => handleToggleCheck(fx.id, e)}
                        aria-label={`Select ${fx.title}`}
                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-amber-500 border-amber-500 text-neutral-950'
                            : 'border-neutral-700 bg-neutral-950 hover:border-amber-500/60'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                      <span>{fx.duration}</span>
                    </div>

                    {fx.tags && fx.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {fx.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] uppercase font-bold bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
