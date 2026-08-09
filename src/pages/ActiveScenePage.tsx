import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Volume2, Plus, Square, Trash2, GripVertical, Search, ArrowLeft } from 'lucide-react'
import { getData, setData } from '../services/store'
import { audioEngine } from '../services/audioEngine'
import type { SoundboardTile, FXTrack } from '../types'

export const ActiveScenePage: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>()
  const [storeData, setStoreData] = useState(getData())

  useEffect(() => {
    const handleUpdate = () => setStoreData(getData())
    window.addEventListener('arcanum_store_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_store_updated', handleUpdate)
  }, [])
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'soundboard'>('soundboard')
  const [soundboardMasterVol, setSoundboardMasterVol] = useState(85)

  // Picker modal state
  const [showFxPicker, setShowFxPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [checkedFxIds, setCheckedFxIds] = useState<string[]>([])
  const [previewFxId, setPreviewFxId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Playing tile states
  const [playingTileIds, setPlayingTileIds] = useState<string[]>([])

  const scene = storeData.scenes.find((s) => s.id === sceneId)
  const tiles = storeData.soundboardTiles
    .filter((t) => t.sceneId === sceneId)
    .sort((a, b) => a.position - b.position)

  if (!scene) {
    return <div className="text-zinc-400">Scene not found</div>
  }

  const existingFxIds = new Set(tiles.map((t) => t.fxTrackId))

  const addableFxTracks = storeData.fxTracks
    .filter((f) => !f.deletedAt && !existingFxIds.has(f.id))
    .filter((f) => {
      const q = pickerSearch.toLowerCase().trim()
      if (!q) return true
      return f.name.toLowerCase().includes(q) || f.tags?.some((t) => t.toLowerCase().includes(q))
    })

  const handleTileClick = (tile: SoundboardTile) => {
    const isPlaying = playingTileIds.includes(tile.id)
    if (!isPlaying) {
      setPlayingTileIds([...playingTileIds, tile.id])
    }
    audioEngine.playFX(tile.name, 'soundboard')
  }

  const handleTileStop = (tile: SoundboardTile, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlayingTileIds(playingTileIds.filter((id) => id !== tile.id))
    audioEngine.stopFX(tile.name, 'soundboard')
  }

  const handleDeleteTile = (tileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedTiles = storeData.soundboardTiles.filter((t) => t.id !== tileId)
    const updated = setData({ soundboardTiles: updatedTiles })
    setStoreData(updated)
  }

  const handlePreviewPickerCard = (fx: FXTrack) => {
    if (previewFxId === fx.id) {
      audioEngine.stopFX(fx.name, 'picker')
      setPreviewFxId(null)
    } else {
      if (previewFxId) {
        const current = storeData.fxTracks.find((f) => f.id === previewFxId)
        if (current) audioEngine.stopFX(current.name, 'picker')
      }
      setPreviewFxId(fx.id)
      audioEngine.playFX(fx.name, 'picker')
    }
  }

  const handleCommitFxSelection = () => {
    if (checkedFxIds.length === 0) return

    const newTiles: SoundboardTile[] = checkedFxIds.map((fxId, index) => {
      const fx = storeData.fxTracks.find((f) => f.id === fxId)
      const currentPos = tiles.length + index
      const hotkeyNum = currentPos < 9 ? `Num ${currentPos + 1}` : undefined

      return {
        id: `tile-${Date.now()}-${index}`,
        sceneId: scene.id,
        fxTrackId: fxId,
        name: fx?.name || 'Sound',
        hotkey: hotkeyNum,
        position: currentPos,
      }
    })

    const count = checkedFxIds.length
    const updated = setData({
      soundboardTiles: [...storeData.soundboardTiles, ...newTiles],
    })
    setStoreData(updated)
    setCheckedFxIds([])

    setToastMessage(`${count} effect${count > 1 ? 's' : ''} added`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleClosePicker = () => {
    if (previewFxId) {
      const current = storeData.fxTracks.find((f) => f.id === previewFxId)
      if (current) audioEngine.stopFX(current.name, 'picker')
      setPreviewFxId(null)
    }
    setShowFxPicker(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            Active Scene
          </span>
          <h1 className="text-3xl font-serif font-bold text-amber-400">{scene.name}</h1>
          {scene.description && <p className="text-zinc-400 text-sm mt-1">{scene.description}</p>}
        </div>
        <button
          onClick={() => audioEngine.stopAll()}
          className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-red-300 font-semibold text-xs rounded transition-colors"
        >
          Stop All
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('soundscapes')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'soundscapes'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Soundscapes
        </button>
        <button
          onClick={() => setActiveTab('soundboard')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'soundboard'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Soundboard
        </button>
      </div>

      {activeTab === 'soundboard' ? (
        <div className="space-y-6">
          {/* Soundboard Master */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Soundboard Master
              </span>
              <span>{soundboardMasterVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soundboardMasterVol}
              onChange={(e) => {
                const val = Number(e.target.value)
                setSoundboardMasterVol(val)
                audioEngine.setSoundboardMasterVolume(val)
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Soundboard Tile Grid */}
          <div className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-amber-400">Soundboard</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tiles.map((tile, idx) => {
                const isPlaying = playingTileIds.includes(tile.id)
                const hotkeyLabel = tile.hotkey || (idx < 9 ? `Num ${idx + 1}` : undefined)

                return (
                  <div
                    key={tile.id}
                    onClick={() => handleTileClick(tile)}
                    className={`p-4 rounded-lg border cursor-pointer relative flex flex-col justify-between min-h-[110px] transition-all ${
                      isPlaying
                        ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <GripVertical className="w-4 h-4 text-zinc-600" />
                      <div className="flex items-center gap-1">
                        {isPlaying && (
                          <button
                            onClick={(e) => handleTileStop(tile, e)}
                            aria-label={`Stop ${tile.name}`}
                            className="p-1 text-amber-400 hover:text-amber-300"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteTile(tile.id, e)}
                          aria-label={`Remove ${tile.name}`}
                          className="p-1 text-zinc-600 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="font-serif font-semibold text-sm text-zinc-100 line-clamp-1">
                        {tile.name}
                      </div>
                      {hotkeyLabel && (
                        <div className="text-[10px] text-amber-500/80 font-mono mt-1">
                          {hotkeyLabel}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Add Sound Tile */}
              <button
                onClick={() => setShowFxPicker(true)}
                className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-amber-400 transition-colors min-h-[110px]"
              >
                <Plus className="w-6 h-6" />
                <span className="font-medium text-xs">Add Sound</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 font-serif">
          Soundscape categories for this scene.
        </div>
      )}

      {/* Sound Effects Picker Modal */}
      {showFxPicker && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 relative">
            {toastMessage && (
              <div className="absolute top-3 right-6 bg-amber-500 text-zinc-950 px-3 py-1.5 rounded text-xs font-semibold shadow">
                {toastMessage}
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={handleClosePicker}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 mb-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Active Scene
              </button>
              <h2 className="text-xl font-serif font-semibold text-amber-400">Sound Effects</h2>
              <p className="text-xs text-zinc-400">Select effects for this scene's soundboard.</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search effects…"
                className="w-full bg-zinc-800 border border-zinc-700 rounded pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-[220px]">
              {addableFxTracks.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-zinc-500 text-sm font-serif">
                    {pickerSearch ? (
                      <>
                        No effects match your filters
                        <button
                          onClick={() => setPickerSearch('')}
                          className="block text-xs text-amber-400 hover:underline mx-auto mt-2"
                        >
                          Clear filters
                        </button>
                      </>
                    ) : (
                      'No addable effects'
                    )}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
                  {addableFxTracks.map((fx) => {
                    const isChecked = checkedFxIds.includes(fx.id)
                    const isPreviewing = previewFxId === fx.id

                    return (
                      <div
                        key={fx.id}
                        onClick={() => handlePreviewPickerCard(fx)}
                        className={`p-3 bg-zinc-800/60 border rounded cursor-pointer relative flex flex-col justify-between transition-colors ${
                          isPreviewing
                            ? 'border-amber-400 ring-1 ring-amber-400/50'
                            : 'border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (checkedFxIds.includes(fx.id)) {
                                setCheckedFxIds(checkedFxIds.filter((id) => id !== fx.id))
                              } else {
                                setCheckedFxIds([...checkedFxIds, fx.id])
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="accent-amber-400 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-[10px] text-zinc-500">{fx.duration}</span>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-zinc-100 line-clamp-1">
                            {fx.name}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {fx.tags?.map((t) => (
                              <span
                                key={t}
                                className="text-[9px] bg-purple-950/60 text-purple-300 border border-purple-800/40 px-1 py-0.5 rounded font-semibold uppercase"
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

            {/* Footer Commit Button */}
            <div className="pt-2 border-t border-zinc-800">
              <button
                disabled={checkedFxIds.length === 0}
                onClick={handleCommitFxSelection}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-semibold rounded text-sm transition-colors"
              >
                Add Selected ({checkedFxIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
