import React, { useState } from 'react'
import { Play, Pause, Square, Lock, Unlock, Plus, Volume2, Sparkles, Check, X, Search } from 'lucide-react'
import type { Scene, SoundscapeCategory, FxTrack, Campaign, Session } from '../types'

interface ActiveSceneProps {
  scene: Scene
  soundscapeCategories: SoundscapeCategory[]
  fxTracks: FxTrack[]
  campaign?: Campaign
  session?: Session
  onAddSoundscapeToScene: (categoryId: string) => void
  onAddFxToBoard: (fxId: string) => void
  onRemoveSoundscapeFromScene: (categoryId: string) => void
  onRemoveFxFromBoard: (fxId: string) => void
}

export const ActiveScene: React.FC<ActiveSceneProps> = ({
  scene,
  soundscapeCategories,
  fxTracks,
  campaign,
  session,
  onAddSoundscapeToScene,
  onAddFxToBoard,
  onRemoveSoundscapeFromScene,
  onRemoveFxFromBoard,
}) => {
  const [activeTab, setActiveTab] = useState<'Soundscapes' | 'Soundboard'>('Soundscapes')
  const [sessionLock, setSessionLock] = useState(false)
  const [isMasterPlaying, setIsMasterPlaying] = useState(false)
  const [masterVolume, setMasterVolume] = useState(80)

  // Track active soundscapes & FX on this scene
  const sceneSoundscapes = soundscapeCategories.filter((sc) => scene.soundscapeCategoryIds.includes(sc.id) && !sc.deletedAt)
  const sceneFx = fxTracks.filter((fx) => scene.soundboardFxIds.includes(fx.id) && !fx.deletedAt)

  // Modal pickers state
  const [isSoundscapePickerOpen, setIsSoundscapePickerOpen] = useState(false)
  const [isFxPickerOpen, setIsFxPickerOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Category intensity/volume state
  const [categoryLevels, setCategoryLevels] = useState<Record<string, 'Level I' | 'Level II' | 'Level III'>>({})
  const [playingFxIds, setPlayingFxIds] = useState<Record<string, boolean>>({})

  const toggleFxPlay = (fxId: string) => {
    setPlayingFxIds((prev) => ({ ...prev, [fxId]: !prev[fxId] }))
  }

  const handleStopAll = () => {
    setIsMasterPlaying(false)
    setPlayingFxIds({})
  }

  // Available pickers filtering
  const availableSoundscapes = soundscapeCategories.filter(
    (sc) =>
      !sc.deletedAt &&
      sc.name.toLowerCase().includes(pickerSearch.toLowerCase())
  )

  const availableFx = fxTracks.filter(
    (fx) =>
      !fx.deletedAt &&
      fx.name.toLowerCase().includes(pickerSearch.toLowerCase())
  )

  const handleCommitSoundscapeSelection = () => {
    selectedIds.forEach((id) => onAddSoundscapeToScene(id))
    setSelectedIds([])
    setIsSoundscapePickerOpen(false)
  }

  const handleCommitFxSelection = () => {
    selectedIds.forEach((id) => onAddFxToBoard(id))
    setSelectedIds([])
    setIsFxPickerOpen(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {campaign && session ? (
            <div className="text-xs uppercase tracking-wider font-semibold text-amber-400">
              CAMPAIGN &gt; {campaign.name.toUpperCase()} &gt; {session.name.toUpperCase()}
            </div>
          ) : (
            <div className="text-xs uppercase tracking-wider font-semibold text-amber-400">GLOBAL SCENE</div>
          )}
          <h1 className="text-3xl font-serif font-bold text-gray-100">{scene.name}</h1>
          {scene.description && <p className="text-gray-400 text-sm mt-1">{scene.description}</p>}
        </div>

        {/* Master Controls & Session Lock */}
        <div className="flex items-center gap-3 bg-[#121212] border border-amber-900/30 p-2.5 rounded-xl">
          <button
            onClick={() => setIsMasterPlaying(!isMasterPlaying)}
            className={`p-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition ${
              isMasterPlaying ? 'bg-amber-500 text-black' : 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50'
            }`}
          >
            {isMasterPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isMasterPlaying ? 'Pause All' : 'Play All'}</span>
          </button>

          <button
            onClick={handleStopAll}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold flex items-center gap-1 transition"
          >
            <Square className="w-4 h-4 fill-current" /> Stop All
          </button>

          <div className="flex items-center gap-2 px-2 border-l border-amber-900/30">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-20 accent-amber-400"
            />
          </div>

          <button
            onClick={() => setSessionLock(!sessionLock)}
            className={`p-2 rounded-lg transition ${
              sessionLock ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-amber-400 hover:bg-white/5'
            }`}
            title={sessionLock ? 'Unlock Session' : 'Lock Session'}
          >
            {sessionLock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-amber-900/30">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('Soundscapes')}
            className={`px-5 py-2.5 font-serif font-bold text-base border-b-2 transition ${
              activeTab === 'Soundscapes' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Soundscapes
          </button>
          <button
            onClick={() => setActiveTab('Soundboard')}
            className={`px-5 py-2.5 font-serif font-bold text-base border-b-2 transition ${
              activeTab === 'Soundboard' ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Soundboard
          </button>
        </div>

        {!sessionLock && (
          <div>
            {activeTab === 'Soundscapes' ? (
              <button
                onClick={() => {
                  setPickerSearch('')
                  setSelectedIds([])
                  setIsSoundscapePickerOpen(true)
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> ADD SOUNDSCAPE
              </button>
            ) : (
              <button
                onClick={() => {
                  setPickerSearch('')
                  setSelectedIds([])
                  setIsFxPickerOpen(true)
                }}
                className="px-3.5 py-1.5 bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Sound
              </button>
            )}
          </div>
        )}
      </div>

      {/* Soundscapes Tab Content */}
      {activeTab === 'Soundscapes' && (
        <div className="space-y-4">
          {sceneSoundscapes.length === 0 ? (
            <div className="bg-[#121212] border border-amber-900/20 rounded-xl p-12 text-center space-y-3">
              <Volume2 className="w-12 h-12 text-amber-500/40 mx-auto" />
              <h3 className="text-xl font-serif font-semibold text-gray-200">No soundscapes added</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Tap Add Soundscape to select ambient audio categories for this scene.
              </p>
              {!sessionLock && (
                <button
                  type="button"
                  onClick={() => {
                    setPickerSearch('')
                    setSelectedIds([])
                    setIsSoundscapePickerOpen(true)
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Soundscape
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sceneSoundscapes.map((sc) => {
                const currentLevel = categoryLevels[sc.id] || 'Level I'

                return (
                  <div key={sc.id} className="bg-[#121212] border border-amber-900/30 rounded-xl p-5 space-y-4 relative">
                    {!sessionLock && (
                      <button
                        onClick={() => onRemoveSoundscapeFromScene(sc.id)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 p-1"
                        title="Remove category from scene"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <div>
                      <h3 className="text-lg font-serif font-bold text-amber-400">{sc.name}</h3>
                      <p className="text-xs text-gray-400">{sc.description}</p>
                    </div>

                    {/* Intensity Level Controls */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-gray-400 uppercase">Intensity Level</div>
                      <div className="grid grid-cols-3 gap-1 bg-[#0D0D0D] p-1 rounded-lg border border-amber-900/20">
                        {(['Level I', 'Level II', 'Level III'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setCategoryLevels((prev) => ({ ...prev, [sc.id]: lvl }))}
                            className={`py-1 text-xs font-semibold rounded transition ${
                              currentLevel === lvl ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}

              {!sessionLock && (
                <button
                  type="button"
                  onClick={() => {
                    setPickerSearch('')
                    setSelectedIds([])
                    setIsSoundscapePickerOpen(true)
                  }}
                  className="border-2 border-dashed border-amber-900/30 hover:border-amber-500/40 rounded-xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer transition min-h-[160px]"
                >
                  <Plus className="w-8 h-8 text-amber-500/60" />
                  <span className="font-serif font-semibold text-amber-400 text-sm">Add Soundscape</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Soundboard Tab Content */}
      {activeTab === 'Soundboard' && (
        <div className="space-y-4">
          {sceneFx.length === 0 ? (
            <div className="bg-[#121212] border border-purple-900/20 rounded-xl p-12 text-center space-y-3">
              <Sparkles className="w-12 h-12 text-purple-500/40 mx-auto" />
              <h3 className="text-xl font-serif font-semibold text-gray-200">Soundboard is empty</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Tap Add Sound to populate your soundboard with instant audio triggers.
              </p>
              {!sessionLock && (
                <button
                  type="button"
                  onClick={() => {
                    setPickerSearch('')
                    setSelectedIds([])
                    setIsFxPickerOpen(true)
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded-lg text-sm transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Sound
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sceneFx.map((fx) => {
                const isPlaying = playingFxIds[fx.id]

                return (
                  <div
                    key={fx.id}
                    className={`
                      p-4 rounded-xl border flex flex-col justify-between h-32 transition cursor-pointer relative group
                      ${
                        isPlaying
                          ? 'bg-purple-900/40 border-purple-400 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400'
                          : 'bg-[#121212] border-purple-900/30 hover:border-purple-500/50'
                      }
                    `}
                    onClick={() => toggleFxPlay(fx.id)}
                  >
                    {!sessionLock && (
                      <button
                        title="Remove effect from soundboard"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveFxFromBoard(fx.id)
                        }}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-400 p-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                        {fx.category || 'FX'}
                      </span>
                      <h4 className="font-serif font-bold text-gray-100 text-sm line-clamp-2">{fx.name}</h4>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-gray-500">{fx.durationSeconds}s</span>
                      <div className={`p-1.5 rounded-full ${isPlaying ? 'bg-purple-400 text-black' : 'bg-purple-500/20 text-purple-400'}`}>
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </div>
                    </div>
                  </div>
                )
              })}

              {!sessionLock && (
                <button
                  type="button"
                  onClick={() => {
                    setPickerSearch('')
                    setSelectedIds([])
                    setIsFxPickerOpen(true)
                  }}
                  className="border-2 border-dashed border-purple-900/30 hover:border-purple-500/40 rounded-xl p-4 flex flex-col items-center justify-center space-y-1 cursor-pointer transition h-32"
                >
                  <Plus className="w-6 h-6 text-purple-500/60" />
                  <span className="font-serif font-semibold text-purple-400 text-xs">Add Sound</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Soundscape Picker Modal */}
      {isSoundscapePickerOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-amber-400">Add Soundscape Category</h2>
              <button onClick={() => setIsSoundscapePickerOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Filter soundscapes..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Picker Items */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {availableSoundscapes.map((sc) => {
                const isSelected = selectedIds.includes(sc.id)
                const isAlreadyInScene = scene.soundscapeCategoryIds.includes(sc.id)

                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      if (isAlreadyInScene) return
                      setSelectedIds((prev) =>
                        isSelected ? prev.filter((id) => id !== sc.id) : [...prev, sc.id]
                      )
                    }}
                    className={`
                      p-3 rounded-lg border flex items-center justify-between cursor-pointer transition
                      ${
                        isAlreadyInScene
                          ? 'bg-[#0D0D0D] border-gray-800 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-500/10 border-amber-400'
                          : 'bg-[#0D0D0D] border-amber-900/20 hover:border-amber-500/40'
                      }
                    `}
                  >
                    <div>
                      <div className="font-serif font-semibold text-gray-200">{sc.name}</div>
                      <div className="text-xs text-gray-400">{sc.description}</div>
                    </div>
                    {isAlreadyInScene ? (
                      <span className="text-xs text-gray-500 font-semibold">Added</span>
                    ) : (
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-amber-400 border-amber-400 text-black' : 'border-gray-600'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-900/20">
              <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
              <div className="flex gap-2">
                <button onClick={() => setIsSoundscapePickerOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm">
                  Close
                </button>
                <button
                  disabled={selectedIds.length === 0}
                  onClick={handleCommitSoundscapeSelection}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-lg"
                >
                  Add Selected ({selectedIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FX Picker Modal */}
      {isFxPickerOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-purple-500/30 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-purple-400">Add Effect to Soundboard</h2>
              <button onClick={() => setIsFxPickerOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Filter effects..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-purple-900/40 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Picker Items */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {availableFx.map((fx) => {
                const isSelected = selectedIds.includes(fx.id)
                const isAlreadyInBoard = scene.soundboardFxIds.includes(fx.id)

                return (
                  <div
                    key={fx.id}
                    onClick={() => {
                      if (isAlreadyInBoard) return
                      setSelectedIds((prev) =>
                        isSelected ? prev.filter((id) => id !== fx.id) : [...prev, fx.id]
                      )
                    }}
                    className={`
                      p-3 rounded-lg border flex items-center justify-between cursor-pointer transition
                      ${
                        isAlreadyInBoard
                          ? 'bg-[#0D0D0D] border-gray-800 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-purple-500/10 border-purple-400'
                          : 'bg-[#0D0D0D] border-purple-900/20 hover:border-purple-500/40'
                      }
                    `}
                  >
                    <div>
                      <div className="font-serif font-semibold text-gray-200">{fx.name}</div>
                      <div className="text-xs text-gray-400">{fx.category} · {fx.durationSeconds}s</div>
                    </div>
                    {isAlreadyInBoard ? (
                      <span className="text-xs text-gray-500 font-semibold">Added</span>
                    ) : (
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-400 border-purple-400 text-black' : 'border-gray-600'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
              <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
              <div className="flex gap-2">
                <button onClick={() => setIsFxPickerOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm">
                  Close
                </button>
                <button
                  disabled={selectedIds.length === 0}
                  onClick={handleCommitFxSelection}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold text-sm rounded-lg"
                >
                  Add Selected ({selectedIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
