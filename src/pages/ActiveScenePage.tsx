import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  Lock,
  Unlock,
  Square,
  Plus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Trash2,
  Search,
  Check,
  Dices,
  Save,
  GripVertical,
  X,
  Music,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export const ActiveScenePage: React.FC = () => {
  const { campaignId, sessionId, sceneId } = useParams<{
    campaignId?: string
    sessionId?: string
    sceneId: string
  }>()

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'soundboard' ? 'soundboard' : 'soundscapes'

  const {
    campaigns,
    sessions,
    scenes,
    soundscapeCategories,
    fxTracks,
    soundboardItems,
    addFxToSoundboard,
    removeFxFromSoundboard,
    soundscapeItems,
    addSoundscapeToScene,
    removeSoundscapeFromScene,
    updateSoundscapeItem,
    sessionLock,
    toggleSessionLock,
    playingCategoryIds,
    toggleCategoryPlay,
    activeFxIds,
    triggerFx,
    stopFx,
    stopAllAudio,
    isDucked,
    showToast,
    recordScenePlayed,
  } = useApp()

  const campaign = campaignId ? campaigns.find((c) => c.id === campaignId) : null
  const session = sessionId ? sessions.find((s) => s.id === sessionId) : null
  const scene = scenes.find((sc) => sc.id === sceneId) || scenes[0]

  // Track scene played in session
  useEffect(() => {
    if (session && scene) {
      recordScenePlayed(session.id, scene.id)
    }
  }, [session?.id, scene?.id])

  // Modals
  const [isAddSoundscapeOpen, setIsAddSoundscapeOpen] = useState(false)
  const [isAddFxOpen, setIsAddFxOpen] = useState(false)

  // Picker selection states
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([])
  const [pickerCatSearch, setPickerCatSearch] = useState('')
  const [previewCatId, setPreviewCatId] = useState<string | null>(null)

  const [selectedFxIds, setSelectedFxIds] = useState<string[]>([])
  const [pickerFxSearch, setPickerFxSearch] = useState('')
  const [previewFxId, setPreviewFxId] = useState<string | null>(null)

  if (!scene) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="font-serif text-2xl text-red-400">Scene not found</h2>
        <Link to="/scenes" className="text-amber-400 underline">
          Return to Scenes
        </Link>
      </div>
    )
  }

  const setTab = (tab: 'soundscapes' | 'soundboard') => {
    setSearchParams({ tab })
  }

  // Active scene items
  const sceneSoundscapes = soundscapeItems.filter((sc) => sc.sceneId === scene.id)
  const sceneSoundboard = soundboardItems.filter((sb) => sb.sceneId === scene.id)

  // Commit soundscapes picker (modal stays open per platform-design PW-26)
  const handleCommitSoundscapes = () => {
    const count = selectedCatIds.length
    if (count === 0) return
    selectedCatIds.forEach((catId) => addSoundscapeToScene(scene.id, catId))
    setSelectedCatIds([])
    showToast(`${count} ${count === 1 ? 'category' : 'categories'} added`)
  }

  // Commit FX picker (modal stays open per platform-design PW-26)
  const handleCommitFx = () => {
    const count = selectedFxIds.length
    if (count === 0) return
    selectedFxIds.forEach((fxId) => addFxToSoundboard(scene.id, fxId))
    setSelectedFxIds([])
    showToast(`${count} ${count === 1 ? 'effect' : 'effects'} added`)
  }

  // Save State (persists mixer state only per PW-40)
  const handleSaveState = () => {
    showToast('Scene mixer state saved')
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Trail */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
        {session && campaign ? (
          <>
            <Link to="/campaigns" className="hover:underline">
              CAMPAIGN
            </Link>
            <span>&gt;</span>
            <Link to={`/campaigns/${campaign.id}/sessions`} className="hover:underline text-gray-300">
              {campaign.name}
            </Link>
            <span>&gt;</span>
            <Link
              to={`/campaigns/${campaign.id}/sessions/${session.id}/scenes`}
              className="hover:underline text-gray-300"
            >
              {session.title}
            </Link>
            <span>&gt;</span>
          </>
        ) : (
          <>
            <Link to="/scenes" className="hover:underline">
              SCENES
            </Link>
            <span>&gt;</span>
          </>
        )}
        <span className="text-gray-100">{scene.name}</span>
      </div>

      {/* Main Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-yellow-900/30">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-serif text-3xl font-bold text-amber-300">{scene.name}</h1>
            {isDucked && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded animate-pulse">
                Ducking Soundscapes (40%)
              </span>
            )}
          </div>
          {scene.description && <p className="text-sm text-gray-400 mt-1">{scene.description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick D20 Audio Trigger */}
          <button
            onClick={() => {
              const randomFx = fxTracks[Math.floor(Math.random() * fxTracks.length)]
              if (randomFx) triggerFx(randomFx.id)
            }}
            className="px-3 py-2 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/40 rounded-lg text-xs font-bold flex items-center space-x-1.5"
            title="Roll D20 FX Trigger"
          >
            <Dices size={16} />
            <span>Roll D20</span>
          </button>

          {/* Session Lock toggle */}
          <button
            onClick={toggleSessionLock}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
              sessionLock
                ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
            }`}
          >
            {sessionLock ? <Lock size={14} /> : <Unlock size={14} />}
            <span>{sessionLock ? 'Locked' : 'Lock Session'}</span>
          </button>

          {/* Stop All Audio */}
          <button
            onClick={stopAllAudio}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow"
          >
            <Square size={14} className="fill-current" />
            <span>Stop All</span>
          </button>
        </div>
      </div>

      {/* Tabs Header: Soundscapes vs Soundboard (PW-08 / F-72) */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTab('soundscapes')}
            className={`px-6 py-3 font-serif text-lg font-bold transition border-b-2 ${
              activeTab === 'soundscapes'
                ? 'text-amber-400 border-amber-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Soundscapes
          </button>
          <button
            onClick={() => setTab('soundboard')}
            className={`px-6 py-3 font-serif text-lg font-bold transition border-b-2 ${
              activeTab === 'soundboard'
                ? 'text-purple-400 border-purple-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Soundboard
          </button>
        </div>

        {/* Tab specific actions */}
        {activeTab === 'soundscapes' ? (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveState}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center space-x-1"
            >
              <Save size={14} />
              <span>Save State</span>
            </button>

            {!sessionLock && (
              <button
                onClick={() => setIsAddSoundscapeOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-lg shadow flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>ADD SOUNDSCAPE</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            {!sessionLock && (
              <button
                onClick={() => setIsAddFxOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Sound</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: Soundscapes Mixer */}
      {activeTab === 'soundscapes' && (
        <div className="space-y-4">
          {sceneSoundscapes.length === 0 ? (
            <div className="bg-[#141414] border border-dashed border-gray-800 rounded-xl p-12 text-center space-y-4">
              <Music size={48} className="mx-auto text-gray-600" />
              <h2 className="font-serif text-xl font-bold text-gray-300">No soundscapes on scene</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Add soundscape categories from your library to start mixing background audio.
              </p>
              {!sessionLock && (
                <button
                  onClick={() => setIsAddSoundscapeOpen(true)}
                  className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold"
                >
                  ADD SOUNDSCAPE
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sceneSoundscapes.map((scItem) => {
                const category = soundscapeCategories.find((c) => c.id === scItem.categoryId)
                if (!category) return null

                const isPlaying = playingCategoryIds.includes(category.id)

                return (
                  <div
                    key={scItem.id}
                    className={`bg-[#171717] border rounded-xl p-6 space-y-6 shadow-lg transition ${
                      isPlaying ? 'border-amber-500 bg-amber-950/10' : 'border-yellow-900/30'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleCategoryPlay(category.id)}
                          className={`p-3 rounded-full transition shadow ${
                            isPlaying
                              ? 'bg-amber-500 text-gray-950'
                              : 'bg-gray-800 text-amber-400 hover:bg-gray-700'
                          }`}
                        >
                          {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
                        </button>
                        <div>
                          <h3 className="font-serif text-xl font-bold text-amber-200">
                            {category.name}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {isPlaying ? 'Playing • Active' : 'Stopped'}
                          </span>
                        </div>
                      </div>

                      {!sessionLock && (
                        <button
                          onClick={() => removeSoundscapeFromScene(scene.id, category.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 rounded"
                          title="Remove from scene"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Volume Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                        <span className="flex items-center space-x-1">
                          {scItem.isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} />}
                          <span>Category Volume</span>
                        </span>
                        <span className="font-mono text-amber-400">{scItem.isMuted ? 'Muted' : `${scItem.volume}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scItem.isMuted ? 0 : scItem.volume}
                        onChange={(e) =>
                          updateSoundscapeItem(scene.id, category.id, {
                            volume: Number(e.target.value),
                            isMuted: false,
                          })
                        }
                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Intensity Level Selector (Level 1, Level 2, Level 3) */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Intensity Level
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {([1, 2, 3] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() =>
                              updateSoundscapeItem(scene.id, category.id, { intensityLevel: lvl })
                            }
                            className={`py-2 text-xs font-bold rounded-lg border transition ${
                              scItem.intensityLevel === lvl
                                ? 'bg-amber-500 text-gray-950 border-amber-400 shadow'
                                : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-white'
                            }`}
                          >
                            Level {lvl === 1 ? 'I' : lvl === 2 ? 'II' : 'III'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Soundboard Tiles Grid */}
      {activeTab === 'soundboard' && (
        <div className="space-y-4">
          {sceneSoundboard.length === 0 ? (
            <div className="bg-[#141414] border border-dashed border-gray-800 rounded-xl p-12 text-center space-y-4">
              <Sparkles size={48} className="mx-auto text-gray-600" />
              <h2 className="font-serif text-xl font-bold text-gray-300">Soundboard empty</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Add sound effects from your library to trigger instant audio cues.
              </p>
              {!sessionLock && (
                <button
                  onClick={() => setIsAddFxOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold"
                >
                  Add Sound
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sceneSoundboard.map((sbItem) => {
                const fx = fxTracks.find((f) => f.id === sbItem.fxTrackId)
                if (!fx) return null

                const activeCount = activeFxIds.filter((id) => id === fx.id).length
                const isPlaying = activeCount > 0

                return (
                  <div
                    key={sbItem.id}
                    className={`relative bg-[#171717] border rounded-xl p-4 flex flex-col justify-between space-y-3 transition shadow group ${
                      isPlaying
                        ? 'border-purple-500 glow-active bg-purple-950/30'
                        : 'border-purple-900/30 hover:border-purple-500/40'
                    }`}
                  >
                    {/* Top Row Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-1">
                        {!sessionLock && (
                          <GripVertical size={14} className="text-gray-600 cursor-grab" />
                        )}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-950/60 text-purple-300 rounded border border-purple-800/40">
                          {fx.category}
                        </span>
                      </div>

                      {!sessionLock && (
                        <button
                          onClick={() => removeFxFromSoundboard(sbItem.id)}
                          className="p-1 text-gray-500 hover:text-red-400 rounded"
                          title="Remove from board"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Tile Body Button (Retrigger / Overlap) */}
                    <button
                      onClick={() => triggerFx(fx.id)}
                      className="w-full text-left space-y-1 focus:outline-none cursor-pointer"
                    >
                      <div className="font-bold text-gray-100 text-sm group-hover:text-purple-300 line-clamp-2">
                        {sbItem.customName || fx.name}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center justify-between">
                        <span>{fx.durationSeconds}s</span>
                        {activeCount > 0 && (
                          <span className="text-purple-400 font-bold font-mono">
                            ▶ x{activeCount}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Dedicated Stop Button (PW-35: stops all instances of that effect at once) */}
                    {isPlaying && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          stopFx(fx.id)
                        }}
                        className="w-full py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 rounded text-xs font-bold flex items-center justify-center space-x-1"
                      >
                        <Square size={12} className="fill-current" />
                        <span>Stop All ({activeCount})</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD SOUNDSCAPE Modal */}
      {isAddSoundscapeOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-amber-300">ADD SOUNDSCAPE</h2>
                <p className="text-xs text-gray-400">Multi-select categories to add to active scene</p>
              </div>
              <button onClick={() => setIsAddSoundscapeOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                value={pickerCatSearch}
                onChange={(e) => setPickerCatSearch(e.target.value)}
                placeholder="Filter categories..."
                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {soundscapeCategories
                .filter((c) => !sceneSoundscapes.some((sc) => sc.categoryId === c.id))
                .filter((c) => c.name.toLowerCase().includes(pickerCatSearch.toLowerCase()))
                .map((cat) => {
                  const isChecked = selectedCatIds.includes(cat.id)
                  const isPreviewing = previewCatId === cat.id

                  return (
                    <div
                      key={cat.id}
                      className={`p-3 bg-[#121212] border rounded-lg flex items-center space-x-3 transition ${
                        isChecked ? 'border-amber-500 bg-amber-950/20' : 'border-gray-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCatIds((prev) =>
                            prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                          )
                        }
                        className={`w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                          isChecked
                            ? 'bg-amber-500 border-amber-400 text-gray-950'
                            : 'border-gray-600 bg-gray-800'
                        }`}
                      >
                        {isChecked && <Check size={14} className="stroke-[3]" />}
                      </button>

                      <div className="flex-1 flex items-center justify-between text-left">
                        <div>
                          <div className="font-semibold text-sm text-gray-200">{cat.name}</div>
                          {cat.description && (
                            <div className="text-xs text-gray-400">{cat.description}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewCatId(isPreviewing ? null : cat.id)}
                          className={`p-1.5 rounded-full ${
                            isPreviewing ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-amber-400'
                          }`}
                        >
                          {isPreviewing ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <button
                onClick={() => setIsAddSoundscapeOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                disabled={selectedCatIds.length === 0}
                onClick={handleCommitSoundscapes}
                className={`px-5 py-2 rounded-lg text-sm font-bold shadow ${
                  selectedCatIds.length > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-gray-950'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Selected ({selectedCatIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sound (FX) Modal */}
      {isAddFxOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-purple-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-purple-300">Add Sound to Soundboard</h2>
                <p className="text-xs text-gray-400">Multi-select sound effects to add to board</p>
              </div>
              <button onClick={() => setIsAddFxOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                value={pickerFxSearch}
                onChange={(e) => setPickerFxSearch(e.target.value)}
                placeholder="Filter sound effects..."
                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {fxTracks
                .filter((f) => !sceneSoundboard.some((sb) => sb.fxTrackId === f.id))
                .filter((f) => f.name.toLowerCase().includes(pickerFxSearch.toLowerCase()))
                .map((fx) => {
                  const isChecked = selectedFxIds.includes(fx.id)
                  const isPreviewing = previewFxId === fx.id

                  return (
                    <div
                      key={fx.id}
                      className={`p-3 bg-[#121212] border rounded-lg flex items-center space-x-3 transition ${
                        isChecked ? 'border-purple-500 bg-purple-950/20' : 'border-gray-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFxIds((prev) =>
                            prev.includes(fx.id) ? prev.filter((id) => id !== fx.id) : [...prev, fx.id]
                          )
                        }
                        className={`w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                          isChecked
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'border-gray-600 bg-gray-800'
                        }`}
                      >
                        {isChecked && <Check size={14} className="stroke-[3]" />}
                      </button>

                      <div className="flex-1 flex items-center justify-between text-left">
                        <div>
                          <div className="font-semibold text-sm text-gray-200">{fx.name}</div>
                          <div className="text-xs text-gray-500">
                            {fx.category} • {fx.durationSeconds}s
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewFxId(isPreviewing ? null : fx.id)}
                          className={`p-1.5 rounded-full ${
                            isPreviewing ? 'bg-purple-600 text-white' : 'bg-gray-800 text-purple-400'
                          }`}
                        >
                          {isPreviewing ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <button
                onClick={() => setIsAddFxOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                disabled={selectedFxIds.length === 0}
                onClick={handleCommitFx}
                className={`px-5 py-2 rounded-lg text-sm font-bold shadow ${
                  selectedFxIds.length > 0
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Selected ({selectedFxIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
