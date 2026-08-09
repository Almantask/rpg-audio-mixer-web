import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Check, Play, Pause } from 'lucide-react'
import { getDb, saveDb, type FxTrack } from '../../lib/storage/db'
import { playFxTrack, stopAllFx } from '../../lib/audio/soundboardEngine'

interface AddFxPickerModalProps {
  sceneId: string
  onClose: () => void
  onAdded: (count: number) => void
}

export const AddFxPickerModal: React.FC<AddFxPickerModalProps> = ({
  sceneId,
  onClose,
  onAdded,
}) => {
  const [availableFx, setAvailableFx] = useState<FxTrack[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState('')

  const loadData = () => {
    const db = getDb()
    const validFx = db.fxTracks.filter((f) => !f.deletedAt)
    const currentSceneItems = db.soundboardItems.filter((item) => item.sceneId === sceneId)
    const existingFxIds = new Set(currentSceneItems.map((item) => item.fxTrackId))

    // Exclude FX already on this scene soundboard
    const notOnBoard = validFx.filter((f) => !existingFxIds.has(f.id))
    setAvailableFx(notOnBoard)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData()
    const handleStorage = () => loadData()
    window.addEventListener('storage', handleStorage)
    window.addEventListener('arcanum_db_update', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('arcanum_db_update', handleStorage)
    }
  }, [sceneId])

  const filteredFx = availableFx.filter((fx) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return fx.name.toLowerCase().includes(q) || fx.tags.some((t) => t.toLowerCase().includes(q))
  })

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const togglePreview = (fx: FxTrack, e: React.MouseEvent) => {
    e.stopPropagation()
    if (previewingId === fx.id) {
      stopAllFx()
      setPreviewingId(null)
    } else {
      stopAllFx()
      playFxTrack(fx.name, 'picker')
      setPreviewingId(fx.id)
    }
  }

  const handleCommit = () => {
    if (selectedIds.length === 0) return
    const db = getDb()
    const currentSceneItems = db.soundboardItems.filter((item) => item.sceneId === sceneId)
    let maxOrder = currentSceneItems.reduce((max, item) => Math.max(max, item.order), -1)

    selectedIds.forEach((fxId) => {
      maxOrder++
      db.soundboardItems.push({
        sceneId,
        fxTrackId: fxId,
        order: maxOrder,
      })
    })

    saveDb(db)
    const addedCount = selectedIds.length
    onAdded(addedCount)
    setToastMsg(`${addedCount} effect${addedCount > 1 ? 's' : ''} added`)

    setTimeout(() => {
      setToastMsg('')
    }, 3000)

    setSelectedIds([])
    loadData()
  }

  const handleCloseModal = () => {
    stopAllFx()
    setPreviewingId(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-amber-900/40 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col justify-between overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-neutral-800 space-y-3">
          <button
            onClick={handleCloseModal}
            className="flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Active Scene
          </button>

          <div>
            <h2 className="font-serif text-xl font-bold text-amber-400">Sound Effects</h2>
            <p className="text-xs text-neutral-400">Select effects for this scene's soundboard.</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search effects…"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {toastMsg && (
          <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 font-semibold text-center">
            {toastMsg}
          </div>
        )}

        {/* Content Grid */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {availableFx.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-neutral-400">
                Import or purchase tracks via Library — Sound Effects
              </p>
            </div>
          ) : filteredFx.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-neutral-400">No effects match your filters</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-amber-400 font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredFx.map((fx) => {
                const isSelected = selectedIds.includes(fx.id)
                const isPreviewing = previewingId === fx.id

                return (
                  <div
                    key={fx.id}
                    data-testid={`fx-picker-card-${fx.name}`}
                    onClick={(e) => togglePreview(fx, e)}
                    className={`bg-neutral-900/80 border rounded-xl p-3 flex flex-col justify-between gap-3 cursor-pointer relative transition-all ${
                      isPreviewing
                        ? 'border-amber-500 shadow-md shadow-amber-950/40'
                        : isSelected
                        ? 'border-amber-500/50 bg-amber-950/10'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        data-testid={`fx-picker-checkbox-${fx.name}`}
                        onClick={(e) => toggleSelect(fx.id, e)}
                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500 text-black'
                            : 'border-neutral-600 bg-neutral-950/50 hover:border-amber-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="text-[10px] font-bold text-purple-400 px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-500/20">
                        {fx.intensity}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-serif text-sm font-medium text-neutral-200 truncate">
                        {fx.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-medium">{fx.duration}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        {fx.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] uppercase font-bold text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="text-amber-400">
                        {isPreviewing ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-[#141414]">
          <button
            onClick={handleCommit}
            disabled={selectedIds.length === 0}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black font-semibold rounded-lg text-sm transition-colors"
          >
            Add Selected ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  )
}
