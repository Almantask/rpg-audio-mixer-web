import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getSceneById,
  updateScene,
  addEffectToSceneSoundboard,
  removeEffectFromSceneSoundboard,
  touchScenePlayed,
} from '../services/sceneService'
import { searchFXTracks } from '../services/libraryService'
import { audioEngine } from '../services/audioEngine'
import type { Scene, SceneSoundboardEffect } from '../types/scene'
import { Volume2, Lock, Unlock, Square, Plus, Trash2, GripVertical, X, Search, Music, Sparkles } from 'lucide-react'

export const ActiveScenePage: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>()
  const [scene, setScene] = useState<Scene | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'soundboard'>('soundboard')

  // Audio State & Lock
  const [masterVol, setMasterVol] = useState<number>(85)
  const [isLocked, setIsLocked] = useState<boolean>(false)

  // Soundboard FX playing instances count tracker
  const [playingFxIds, setPlayingFxIds] = useState<Record<string, boolean>>({})

  // Add Sound Modal (FX Picker)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [selectedIntensity, setSelectedIntensity] = useState<string>('')
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const refreshScene = () => {
    if (!sceneId) return
    const sc = getSceneById(sceneId)
    if (sc) {
      setScene(sc)
      setIsLocked(sc.isLocked || false)
      if (sc.soundboardMasterVolume !== undefined) {
        setMasterVol(Math.round(sc.soundboardMasterVolume * 100))
        audioEngine.setSoundboardMasterVolume(sc.soundboardMasterVolume)
      }
      touchScenePlayed(sc.id)
    }
  }

  useEffect(() => {
    refreshScene()
    return () => {
      audioEngine.stopAll()
    }
  }, [sceneId])

  if (!scene) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center space-y-4">
        <h1 className="text-2xl font-serif text-amber-400">Scene not found</h1>
        <Link to="/scenes" className="text-amber-500 hover:underline text-sm">
          Return to Scenes
        </Link>
      </div>
    )
  }

  const soundboardFx = scene.soundboardEffects || []
  const isBoardFull = soundboardFx.length >= 24

  const handleMasterVolChange = (val: number) => {
    setMasterVol(val)
    const norm = val / 100
    audioEngine.setSoundboardMasterVolume(norm)
    updateScene(scene.id, { soundboardMasterVolume: norm })
  }

  const toggleLock = () => {
    const nextLock = !isLocked
    setIsLocked(nextLock)
    updateScene(scene.id, { isLocked: nextLock })
  }

  const handleStopAll = () => {
    audioEngine.stopAll()
    setPlayingFxIds({})
  }

  const handleTileClick = async (tile: SceneSoundboardEffect) => {
    // Retrigger behavior: start a new instance
    setPlayingFxIds((prev) => ({ ...prev, [tile.effectId]: true }))
    await audioEngine.playFX({
      id: tile.effectId,
      name: tile.name,
      audioUrl: '/assets/audio/soundboard/thunder.ogg',
      source: 'soundboard',
    })
  }

  const handleTileStop = (tile: SceneSoundboardEffect, e: React.MouseEvent) => {
    e.stopPropagation()
    audioEngine.stopFXTrack(tile.effectId)
    setPlayingFxIds((prev) => ({ ...prev, [tile.effectId]: false }))
  }

  const handleRemoveTile = (tileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLocked) return
    removeEffectFromSceneSoundboard(scene.id, tileId)
    refreshScene()
  }

  // Picker modal helpers
  const availableFXTracks = searchFXTracks(pickerSearch, selectedIntensity).filter(
    (track) => !soundboardFx.some((tile) => tile.effectId === track.id)
  )

  const toggleTrackSelect = (trackId: string) => {
    if (selectedTrackIds.includes(trackId)) {
      setSelectedTrackIds(selectedTrackIds.filter((id) => id !== trackId))
    } else {
      setSelectedTrackIds([...selectedTrackIds, trackId])
    }
  }

  const handleCommitPicker = () => {
    if (selectedTrackIds.length === 0) return
    let count = 0
    selectedTrackIds.forEach((id) => {
      const track = searchFXTracks().find((t) => t.id === id)
      if (track) {
        addEffectToSceneSoundboard(scene.id, {
          effectId: track.id,
          name: track.name,
          intensity: track.intensity,
          tags: track.tags,
        })
        count++
      }
    })
    setSelectedTrackIds([])
    refreshScene()
    setToastMessage(`${count} effect${count === 1 ? '' : 's'} added`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400">ACTIVE SCENE</span>
          <h1 className="font-serif text-3xl font-bold text-stone-100">{scene.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStopAll}
            className="px-4 py-2 rounded-lg bg-red-950/80 border border-red-900/80 text-red-300 hover:bg-red-900 font-semibold text-xs flex items-center gap-1.5 shadow"
          >
            <Square className="w-3.5 h-3.5 fill-red-300" />
            <span>Stop All</span>
          </button>

          <button
            type="button"
            onClick={toggleLock}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isLocked
                ? 'bg-amber-950/90 border-amber-500 text-amber-300'
                : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
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
          onClick={() => setActiveTab('soundboard')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'soundboard'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Soundboard
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'soundscapes' ? (
        <div className="text-center py-12 bg-stone-900/30 rounded-xl border border-dashed border-stone-800 space-y-2">
          <Music className="w-10 h-10 text-stone-600 mx-auto" />
          <h2 className="font-serif text-lg text-amber-400 font-semibold">Soundscapes Tab</h2>
          <p className="text-stone-400 text-sm">Switch to Soundboard tab to trigger one-shot effects.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-amber-950 border border-amber-500 text-amber-200 text-xs font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Soundboard Master Volume Control */}
          <div className="bg-[#121212] border border-amber-900/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-300">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Soundboard Master</span>
              </div>
              <span className="text-amber-400 font-mono">{masterVol}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={masterVol}
              onChange={(e) => handleMasterVolChange(Number(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Soundboard Grid Section */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-amber-400">Soundboard</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {soundboardFx.map((tile) => {
                const isPlaying = Boolean(playingFxIds[tile.effectId])
                return (
                  <div
                    key={tile.id}
                    onClick={() => handleTileClick(tile)}
                    className={`min-h-[100px] rounded-xl border p-3 cursor-pointer transition-all flex flex-col justify-between relative group select-none ${
                      isPlaying
                        ? 'bg-amber-950/40 border-amber-400 text-amber-200 shadow-lg shadow-amber-950/60 ring-2 ring-amber-400/40'
                        : 'bg-[#121212] border-stone-800 hover:border-amber-900/50 text-stone-200'
                    }`}
                  >
                    {/* Tile Top Bar: Drag handle & delete */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        aria-label="Reorder tile"
                        disabled={isLocked}
                        className="text-stone-600 group-hover:text-stone-400 disabled:opacity-30 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {isPlaying && (
                          <button
                            type="button"
                            aria-label={`Stop effect ${tile.name}`}
                            onClick={(e) => handleTileStop(tile, e)}
                            className="p-1 rounded bg-amber-900/80 text-amber-200 hover:bg-amber-800"
                          >
                            <Square className="w-3.5 h-3.5 fill-amber-200" />
                          </button>
                        )}
                        {!isLocked && (
                          <button
                            type="button"
                            aria-label={`Remove effect ${tile.name}`}
                            onClick={(e) => handleRemoveTile(tile.id, e)}
                            className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-stone-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tile Content */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-sm font-bold line-clamp-1">{tile.name}</h3>
                      {tile.hotkey && (
                        <span className="text-[10px] text-stone-500 font-mono">Num {tile.hotkey}</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Add Sound Tile / Board Full Message */}
              {!isLocked && (
                isBoardFull ? (
                  <div className="col-span-full py-3 px-4 rounded-xl border border-dashed border-amber-900/40 bg-stone-900/30 text-center text-xs text-stone-400">
                    Board full — remove an effect to add more.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="min-h-[100px] rounded-xl border-2 border-dashed border-amber-900/40 hover:border-amber-600/60 bg-stone-900/20 hover:bg-stone-900/40 text-amber-400 flex flex-col items-center justify-center gap-1.5 font-medium text-xs transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Sound</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* FX Picker Modal (Add Sound) */}
      {isPickerOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="picker-title" className="bg-[#141414] border border-amber-900/40 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-shrink-0">
              <h2 id="picker-title" className="font-serif text-xl font-bold text-amber-400">Add Sound</h2>
              <button type="button" onClick={() => setIsPickerOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter controls */}
            <div className="space-y-3 flex-shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Filter effects…"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-9 pr-3 py-1.5 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">Intensity:</span>
                {['', 'I', 'II', 'III'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedIntensity(level)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                      selectedIntensity === level
                        ? 'bg-amber-950 border-amber-500 text-amber-300'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    {level === '' ? 'All' : `Level ${level}`}
                  </button>
                ))}
              </div>
            </div>

            {/* FX Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {availableFXTracks.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs italic">
                  No effects match your filters.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableFXTracks.map((track) => {
                    const isSelected = selectedTrackIds.includes(track.id)
                    return (
                      <div
                        key={track.id}
                        onClick={() => toggleTrackSelect(track.id)}
                        className={`p-3 rounded-lg border cursor-pointer flex flex-col justify-between transition-colors ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500 text-stone-100'
                            : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-serif text-xs font-bold line-clamp-1">{track.name}</h4>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                          />
                        </div>
                        <span className="text-[10px] text-amber-400/90 font-mono mt-2">Level {track.intensity}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 text-xs font-medium hover:bg-stone-800"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleCommitPicker}
                disabled={selectedTrackIds.length === 0}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Selected ({selectedTrackIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
