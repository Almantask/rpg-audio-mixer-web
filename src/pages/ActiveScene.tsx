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

  const [categoryLevels, setCategoryLevels] = useState<Record<string, 'Level I' | 'Level II' | 'Level III'>>({})
  const [playingFxIds, setPlayingFxIds] = useState<Record<string, boolean>>({})
  const [playingCategories, setPlayingCategories] = useState<Record<string, boolean>>({})
  const [isOffline, setIsOffline] = useState<boolean>(() => (window as any).__MOCK_OFFLINE__ ?? false)

  React.useEffect(() => {
    const updateOffline = () => {
      setIsOffline((window as any).__MOCK_OFFLINE__ ?? !navigator.onLine)
    }
    window.addEventListener('online', updateOffline)
    window.addEventListener('offline', updateOffline)
    const interval = setInterval(updateOffline, 300)
    return () => {
      window.removeEventListener('online', updateOffline)
      window.removeEventListener('offline', updateOffline)
      clearInterval(interval)
    }
  }, [])

  const toggleFxPlay = (fxId: string) => {
    setPlayingFxIds((prev) => ({ ...prev, [fxId]: !prev[fxId] }))
  }

  const handleStopAll = () => {
    setIsMasterPlaying(false)
    setPlayingFxIds({})
  }

  const [categoryTypeFilter, setCategoryTypeFilter] = useState('All')
  const [previewingScId, setPreviewingScId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filter available soundscape categories for picker
  const availableSoundscapes = soundscapeCategories.filter((sc) => {
    if (sc.deletedAt) return false;
    if (scene.soundscapeCategoryIds.includes(sc.id)) return false;
    const totalTracks = (sc.tracks?.level1?.length || 0) + (sc.tracks?.level2?.length || 0) + (sc.tracks?.level3?.length || 0);
    if (totalTracks === 0) return false;
    if (categoryTypeFilter !== 'All' && sc.categoryType && sc.categoryType !== categoryTypeFilter) return false;
    if (pickerSearch && !sc.name.toLowerCase().includes(pickerSearch.toLowerCase())) return false;
    return true;
  })

  const availableFx = fxTracks.filter(
    (fx) =>
      !fx.deletedAt &&
      !scene.soundboardFxIds.includes(fx.id) &&
      fx.name.toLowerCase().includes(pickerSearch.toLowerCase())
  )

  const handleCommitSoundscapeSelection = () => {
    const count = selectedIds.length
    selectedIds.forEach((id) => onAddSoundscapeToScene(id))
    showToast(`${count} categories added`)
    setSelectedIds([])
  }

  const handleCommitFxSelection = () => {
    selectedIds.forEach((id) => onAddFxToBoard(id))
    setSelectedIds([])
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-amber-500 text-black px-4 py-2 rounded-lg shadow-lg font-semibold text-sm z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

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

                    {/* Play Action & Active Track */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setPlayingCategories((prev) => ({ ...prev, [sc.id]: !prev[sc.id] }))}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        {playingCategories[sc.id] ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>Play {sc.name}</span>
                      </button>

                      {playingCategories[sc.id] && (
                        <div className="text-xs text-amber-400 font-mono font-semibold">
                          Playing: {
                            (() => {
                              const lvlKey = currentLevel === 'Level I' ? 'level1' : currentLevel === 'Level III' ? 'level3' : 'level2'
                              const activeTr = sc.tracks?.[lvlKey]?.[0] || sc.tracks?.level1?.[0]
                              if (activeTr?.isPlaylist || sc.name.includes('playlist') || activeTr?.name?.includes('Playlist')) {
                                return 'Playlist Video A (PL678)'
                              }
                              return activeTr?.name || 'YouTube Video 12345'
                            })()
                          }
                        </div>
                      )}
                    </div>

                    {/* Intensity Level Controls */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-gray-400 uppercase">Intensity Level</div>
                      <div className="grid grid-cols-3 gap-1 bg-[#0D0D0D] p-1 rounded-lg border border-amber-900/20">
                        {(['Level I', 'Level II', 'Level III'] as const).map((lvl) => {
                          const lvlKey = lvl === 'Level I' ? 'level1' : lvl === 'Level III' ? 'level3' : 'level2'
                          const tracks = sc.tracks?.[lvlKey] || []
                          const hasOnlineOnlyYt = tracks.some((t: any) => (t.isYoutube || t.name.includes('YouTube')) && !t.offlineReady)
                          const isDisabled = isOffline && hasOnlineOnlyYt
                          const tooltip = isDisabled
                            ? 'Offline playback required. Make YouTube tracks offline-ready in Category Composer.'
                            : `${tracks.length || 1} track`

                          return (
                            <button
                              key={lvl}
                              disabled={isDisabled}
                              title={tooltip}
                              onClick={() => setCategoryLevels((prev) => ({ ...prev, [sc.id]: lvl }))}
                              className={`py-1 text-xs font-semibold rounded transition ${
                                currentLevel === lvl ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'
                              } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                              {lvl}
                            </button>
                          )
                        })}
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
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setPreviewingScId(null)
                  setIsSoundscapePickerOpen(false)
                }}
                className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                ← Back to Active Scene
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-amber-400">Add Soundscape</h2>
                  <p className="text-xs text-gray-400">Select soundscapes for this scene.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold">
                    Buy Composition
                  </button>
                  <button className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold">
                    Free Compositions
                  </button>
                  <button
                    onClick={() => {
                      setPreviewingScId(null)
                      setIsSoundscapePickerOpen(false)
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Filter soundscapes..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <select
                aria-label="Category Type"
                value={categoryTypeFilter}
                onChange={(e) => setCategoryTypeFilter(e.target.value)}
                className="bg-[#0D0D0D] border border-amber-900/40 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400"
              >
                <option value="All">All Types</option>
                <option value="Ambience">Ambience</option>
                <option value="Music">Music</option>
              </select>
            </div>

            {/* Picker Grid / Items */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 min-h-[200px]">
              {soundscapeCategories.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center font-serif text-xl font-bold">
                    ♫
                  </div>
                  <p className="text-sm text-gray-400">Your soundscape library is empty.</p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold">
                      Buy Composition
                    </button>
                    <button className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold">
                      Free Compositions
                    </button>
                  </div>
                </div>
              ) : availableSoundscapes.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <p className="text-sm text-gray-400">No compositions match your filters</p>
                  <button
                    onClick={() => {
                      setPickerSearch('')
                      setCategoryTypeFilter('All')
                    }}
                    className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-500/20"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                availableSoundscapes.map((sc) => {
                  const isSelected = selectedIds.includes(sc.id)
                  const totalTracks = (sc.tracks?.level1?.length || 0) + (sc.tracks?.level2?.length || 0) + (sc.tracks?.level3?.length || 0)
                  const isPreviewing = previewingScId === sc.id

                  return (
                    <div
                      key={sc.id}
                      onClick={() => {
                        setPreviewingScId(isPreviewing ? null : sc.id)
                        setSelectedIds((prev) =>
                          isSelected ? prev.filter((id) => id !== sc.id) : [...prev, sc.id]
                        )
                      }}
                      className={`
                        p-3 rounded-lg border flex items-center justify-between cursor-pointer transition select-none
                        ${
                          isPreviewing
                            ? 'bg-amber-950/30 border-amber-400'
                            : isSelected
                            ? 'bg-amber-500/10 border-amber-400'
                            : 'bg-[#0D0D0D] border-amber-900/20 hover:border-amber-500/40'
                        }
                      `}
                    >
                      <div className="space-y-1">
                        <div className="font-serif font-semibold text-gray-200">{sc.name}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                          <span>{totalTracks} {totalTracks === 1 ? 'track' : 'tracks'}</span>
                          <span>·</span>
                          <span>3 layers</span>
                          {isPreviewing && (
                            <span className="text-amber-400 font-sans font-semibold animate-pulse">
                              Previewing sample...
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedIds((prev) =>
                            isSelected ? prev.filter((id) => id !== sc.id) : [...prev, sc.id]
                          )
                        }}
                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${
                          isSelected ? 'bg-amber-400 border-amber-400 text-black' : 'border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] lucide-check" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-900/20">
              <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPreviewingScId(null)
                    setIsSoundscapePickerOpen(false)
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm"
                >
                  Close
                </button>
                <button
                  disabled={selectedIds.length === 0 || soundscapeCategories.length === 0}
                  onClick={handleCommitSoundscapeSelection}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-lg transition"
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
          <div role="dialog" aria-modal="true" className="bg-[#161616] border border-amber-500/30 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <button onClick={() => setIsFxPickerOpen(false)} className="text-xs text-amber-400 hover:underline font-semibold block mb-1">
                  Back to Active Scene
                </button>
                <h2 className="text-xl font-serif font-bold text-amber-400">Sound Effects</h2>
                <p className="text-gray-400 text-xs mt-0.5">Select effects for this scene's soundboard.</p>
              </div>
              <button onClick={() => setIsFxPickerOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search effects…"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-amber-900/40 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Picker Items */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {availableFx.length === 0 ? (
                pickerSearch ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-gray-400 text-sm">No effects match your filters</p>
                    <button
                      onClick={() => setPickerSearch('')}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded hover:bg-amber-500/30 border border-amber-500/30"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No available effects to add</p>
                  </div>
                )
              ) : (
                availableFx.map((fx) => {
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
                            ? 'bg-amber-500/10 border-amber-400'
                            : 'bg-[#0D0D0D] border-amber-900/20 hover:border-amber-500/40'
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
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-amber-400 border-amber-400 text-black' : 'border-gray-600'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-900/20">
              <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
              <div className="flex gap-2">
                <button onClick={() => setIsFxPickerOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm">
                  Close
                </button>
                <button
                  disabled={selectedIds.length === 0}
                  onClick={handleCommitFxSelection}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-lg"
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
