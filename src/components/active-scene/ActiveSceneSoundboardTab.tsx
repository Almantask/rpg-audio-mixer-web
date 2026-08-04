import React, { useState } from 'react'
import { Plus, Trash2, Volume2, Square } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Dialog } from '../common/Dialog'
import { Toast } from '../common/Toast'
import { audioEngine } from '../../utils/audioEngine'
import type { SoundboardItem } from '../../types'

interface Props {
  sceneId: string
}

export const ActiveSceneSoundboardTab: React.FC<Props> = ({ sceneId }) => {
  const {
    soundboardItems,
    fxTracks,
    sessionLock,
    masterSoundboardVolume,
    setMasterSoundboardVolume,
    addFXToSoundboard,
    removeFXFromSoundboard,
    incrementFXPlayCount,
  } = useApp()

  const [isAddSoundOpen, setIsAddSoundOpen] = useState(false)
  const [selectedFXIds, setSelectedFXIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const sceneItems = soundboardItems.filter((sb) => sb.sceneId === sceneId)
  const attachedFXTrackIds = new Set(sceneItems.map((sb) => sb.fxTrackId))

  // Available FX for picker (unattached)
  const availableFX = fxTracks.filter(
    (fx) =>
      !attachedFXTrackIds.has(fx.id) &&
      (fx.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        fx.tags.some((t) => t.toLowerCase().includes(search.trim().toLowerCase()))),
  )

  const handleTriggerFX = (item: SoundboardItem) => {
    const fx = fxTracks.find((f) => f.id === item.fxTrackId)
    if (!fx) return

    audioEngine.playFX(fx.id, fx.url, masterSoundboardVolume)
    incrementFXPlayCount(fx.id)
  }

  const handleStopFX = (e: React.MouseEvent, item: SoundboardItem) => {
    e.stopPropagation()
    audioEngine.stopFXTrack(item.fxTrackId)
  }

  const handleToggleFXSelect = (fxId: string) => {
    setSelectedFXIds((prev) =>
      prev.includes(fxId) ? prev.filter((id) => id !== fxId) : [...prev, fxId],
    )
  }

  const handleCommitAddSelected = () => {
    selectedFXIds.forEach((fxId) => addFXToSoundboard(sceneId, fxId))
    setToastMessage(`${selectedFXIds.length} effects added`)
    setSelectedFXIds([])
  }

  return (
    <div className="space-y-6">
      {/* Soundboard Master Volume */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-2 shadow-lg">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 uppercase">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span>Soundboard Master</span>
          </div>
          <span className="text-purple-400">{Math.round(masterSoundboardVolume * 100)}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterSoundboardVolume}
          onChange={(e) => setMasterSoundboardVolume(parseFloat(e.target.value))}
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* FX Grid */}
      <div className="space-y-3">
        <h3 className="font-serif text-sm font-semibold tracking-wider text-purple-400 uppercase">
          Soundboard
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sceneItems.map((item, idx) => {
            const fx = fxTracks.find((f) => f.id === item.fxTrackId)
            if (!fx) return null

            const isPlaying = audioEngine.isFXPlaying(fx.id)

            return (
              <div
                key={item.id}
                onClick={() => handleTriggerFX(item)}
                className={`relative rounded-xl border p-4 bg-neutral-900 cursor-pointer flex flex-col justify-between select-none shadow-lg transition min-h-[110px] ${
                  isPlaying
                    ? 'border-purple-400 ring-2 ring-purple-500/50 bg-purple-950/20'
                    : 'border-neutral-800 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">≡</span>

                  <div className="flex items-center space-x-1">
                    {isPlaying && (
                      <button
                        onClick={(e) => handleStopFX(e, item)}
                        className="p-1 text-purple-400 hover:text-white rounded"
                        aria-label={`Stop ${fx.name}`}
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}

                    {!sessionLock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          audioEngine.stopFXTrack(fx.id)
                          removeFXFromSoundboard(item.id)
                        }}
                        className="p-1 text-neutral-500 hover:text-red-400 rounded"
                        aria-label={`Remove ${fx.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-neutral-100 text-sm line-clamp-1">
                    {fx.name}
                  </h4>
                  {idx < 9 && <span className="text-[10px] text-neutral-500 font-mono">Num {idx + 1}</span>}
                </div>
              </div>
            )
          })}

          {/* Add Sound Tile */}
          {!sessionLock && (
            <button
              onClick={() => {
                setSelectedFXIds([])
                setIsAddSoundOpen(true)
              }}
              className="rounded-xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-neutral-900/40 hover:bg-neutral-900/80 p-4 flex flex-col items-center justify-center space-y-1 text-purple-400 font-bold text-sm transition group min-h-[110px]"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Add Sound</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Sound Picker Modal */}
      <Dialog
        isOpen={isAddSoundOpen}
        onClose={() => setIsAddSoundOpen(false)}
        title="Add Sound to Soundboard"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search effects..."
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-purple-400"
          />

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {availableFX.map((fx) => {
              const isChecked = selectedFXIds.includes(fx.id)
              return (
                <div
                  key={fx.id}
                  onClick={() => handleToggleFXSelect(fx.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                    isChecked
                      ? 'border-purple-400 bg-purple-950/30'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="accent-purple-500 w-4 h-4"
                    />
                    <span className="font-serif font-bold text-neutral-200">{fx.name}</span>
                  </div>
                  <span className="text-xs text-neutral-400 font-semibold">{fx.intensity}</span>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setIsAddSoundOpen(false)}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-800 text-neutral-300 font-medium"
            >
              Close
            </button>
            <button
              disabled={selectedFXIds.length === 0}
              onClick={handleCommitAddSelected}
              className="px-5 py-2 text-sm rounded-lg bg-purple-500 text-white font-bold disabled:opacity-50"
            >
              Add Selected ({selectedFXIds.length})
            </button>
          </div>
        </div>
      </Dialog>

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  )
}
