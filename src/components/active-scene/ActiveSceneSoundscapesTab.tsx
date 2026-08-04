import React, { useState } from 'react'
import { Plus, Trash2, Volume2, VolumeX, Dices, Play, Pause } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Dialog } from '../common/Dialog'
import { Toast } from '../common/Toast'
import { audioEngine } from '../../utils/audioEngine'
import type { IntensityLevel, SceneSoundscape, SoundscapeTrack } from '../../types'

interface Props {
  sceneId: string
}

export const ActiveSceneSoundscapesTab: React.FC<Props> = ({ sceneId }) => {
  const {
    sceneSoundscapes,
    categories,
    sessionLock,
    masterSoundscapeVolume,
    setMasterSoundscapeVolume,
    addSoundscapeToScene,
    removeSoundscapeFromScene,
    updateSceneSoundscape,
    incrementSoundscapePlayCount,
  } = useApp()

  const [isMuted, setIsMuted] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [activeTracks, setActiveTracks] = useState<Record<string, SoundscapeTrack>>({})
  const [playingCategories, setPlayingCategories] = useState<Record<string, boolean>>({})

  const attached = sceneSoundscapes
    .filter((ss) => ss.sceneId === sceneId)
    .sort((a, b) => a.order - b.order)

  const attachedCatIds = new Set(attached.map((ss) => ss.categoryId))

  const availableCategories = categories.filter(
    (c) =>
      !attachedCatIds.has(c.id) &&
      c.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const effectiveMasterVol = isMuted ? 0 : masterSoundscapeVolume

  const getRandomTrack = (catId: string, level: IntensityLevel): SoundscapeTrack | null => {
    const cat = categories.find((c) => c.id === catId)
    if (!cat) return null
    const pool = cat.tracksByLevel[level] || []
    if (pool.length === 0) return null
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }

  const handlePlayScene = () => {
    attached.forEach((ss) => {
      const currentTrack = activeTracks[ss.categoryId] || getRandomTrack(ss.categoryId, ss.intensity)
      if (currentTrack) {
        setActiveTracks((prev) => ({ ...prev, [ss.categoryId]: currentTrack }))
        audioEngine.playSoundscape(
          ss.categoryId,
          currentTrack.url,
          ss.volume,
          effectiveMasterVol,
          ss.intensity,
        )
        setPlayingCategories((prev) => ({ ...prev, [ss.categoryId]: true }))
        incrementSoundscapePlayCount(ss.categoryId)
      }
    })
  }

  const handleToggleCategoryPlay = (ss: SceneSoundscape) => {
    const isPlaying = playingCategories[ss.categoryId]
    if (isPlaying) {
      audioEngine.stopSoundscape(ss.categoryId)
      setPlayingCategories((prev) => ({ ...prev, [ss.categoryId]: false }))
    } else {
      const track = activeTracks[ss.categoryId] || getRandomTrack(ss.categoryId, ss.intensity)
      if (track) {
        setActiveTracks((prev) => ({ ...prev, [ss.categoryId]: track }))
        audioEngine.playSoundscape(
          ss.categoryId,
          track.url,
          ss.volume,
          effectiveMasterVol,
          ss.intensity,
        )
        setPlayingCategories((prev) => ({ ...prev, [ss.categoryId]: true }))
        incrementSoundscapePlayCount(ss.categoryId)
      }
    }
  }

  const handleRollTrack = (ss: SceneSoundscape) => {
    const newTrack = getRandomTrack(ss.categoryId, ss.intensity)
    if (newTrack) {
      setActiveTracks((prev) => ({ ...prev, [ss.categoryId]: newTrack }))
      if (playingCategories[ss.categoryId]) {
        audioEngine.playSoundscape(
          ss.categoryId,
          newTrack.url,
          ss.volume,
          effectiveMasterVol,
          ss.intensity,
        )
      }
    }
  }

  const handleIntensityChange = (ss: SceneSoundscape, level: IntensityLevel) => {
    updateSceneSoundscape(sceneId, ss.categoryId, { intensity: level })
    const newTrack = getRandomTrack(ss.categoryId, level)
    if (newTrack) {
      setActiveTracks((prev) => ({ ...prev, [ss.categoryId]: newTrack }))
      if (playingCategories[ss.categoryId]) {
        audioEngine.playSoundscape(
          ss.categoryId,
          newTrack.url,
          ss.volume,
          effectiveMasterVol,
          level,
        )
      }
    }
  }

  const handleVolumeChange = (ss: SceneSoundscape, vol: number) => {
    updateSceneSoundscape(sceneId, ss.categoryId, { volume: vol })
    audioEngine.updateSoundscapeVolume(ss.categoryId, vol, effectiveMasterVol)
  }

  const handleToggleCatSelect = (catId: string) => {
    setSelectedCatIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    )
  }

  const handleCommitAddSelected = () => {
    selectedCatIds.forEach((catId) => addSoundscapeToScene(sceneId, catId))
    setToastMessage(`${selectedCatIds.length} categories added`)
    setSelectedCatIds([])
  }

  return (
    <div className="space-y-6">
      {/* Master Volume Bar */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePlayScene}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center space-x-1.5 shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>Play Scene</span>
          </button>

          <div className="flex items-center space-x-3 text-xs font-semibold text-neutral-300 uppercase">
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="text-neutral-400 hover:text-amber-400 p-1"
              aria-label="Toggle mute"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>
            <span>Master Volume</span>
            <span className="text-amber-400">{Math.round(effectiveMasterVol * 100)}%</span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterSoundscapeVolume}
          onChange={(e) => setMasterSoundscapeVolume(parseFloat(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />
      </div>

      {/* Category Rows */}
      <div className="space-y-4">
        {attached.map((ss) => {
          const cat = categories.find((c) => c.id === ss.categoryId)
          if (!cat) return null

          const isPlaying = Boolean(playingCategories[ss.categoryId])
          const activeTrack = activeTracks[ss.categoryId]
          const totalTrackCount =
            cat.tracksByLevel.I.length + cat.tracksByLevel.II.length + cat.tracksByLevel.III.length

          return (
            <div
              key={ss.categoryId}
              className={`rounded-xl border p-5 bg-neutral-900 space-y-4 shadow-lg transition ${
                isPlaying ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-neutral-800'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-500 font-bold">≡</span>
                  <h3 className="font-serif font-bold text-lg text-neutral-100 uppercase tracking-wide">
                    {cat.name} ({totalTrackCount} TRACKS)
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRollTrack(ss)}
                    className="p-2 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-800 transition"
                    aria-label={`Roll track for ${cat.name}`}
                  >
                    <Dices className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleCategoryPlay(ss)}
                    className="p-2 rounded-full bg-amber-500 text-neutral-950 hover:bg-amber-400 transition"
                    aria-label={`Play or pause ${cat.name}`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  {!sessionLock && (
                    <button
                      onClick={() => {
                        audioEngine.stopSoundscape(ss.categoryId)
                        removeSoundscapeFromScene(sceneId, ss.categoryId)
                      }}
                      className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                      aria-label={`Remove ${cat.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active Track Title & Progress Bar */}
              <div className="space-y-1">
                <p className="text-sm font-serif italic text-amber-300/90">
                  {activeTrack ? activeTrack.title : 'No track loaded'}
                </p>
                <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-amber-500 transition-all duration-300 ${
                      isPlaying ? 'w-2/3 animate-pulse' : 'w-0'
                    }`}
                  />
                </div>
              </div>

              {/* Intensity & Volume Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-800/60">
                {/* Intensity Toggles */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    INTENSITY
                  </span>
                  <div className="flex space-x-2">
                    {(['I', 'II', 'III'] as IntensityLevel[]).map((level) => {
                      const hasTracks = (cat.tracksByLevel[level] || []).length > 0
                      const isActive = ss.intensity === level

                      return (
                        <button
                          key={level}
                          disabled={!hasTracks}
                          onClick={() => handleIntensityChange(ss, level)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                            isActive
                              ? 'border-amber-400 text-amber-400 bg-amber-950/40'
                              : hasTracks
                              ? 'border-neutral-700 text-neutral-300 hover:border-amber-500/40'
                              : 'border-neutral-800 text-neutral-600 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {level}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <span>VOLUME</span>
                    <span className="text-amber-400">{Math.round(ss.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={ss.volume}
                    onChange={(e) => handleVolumeChange(ss, parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Add Soundscape Button */}
        {!sessionLock && (
          <button
            onClick={() => {
              setSelectedCatIds([])
              setIsAddOpen(true)
            }}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition shadow-lg flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>+ ADD SOUNDSCAPE</span>
          </button>
        )}
      </div>

      {/* Add Soundscape Picker Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Soundscape to Scene"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search compositions..."
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
          />

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {availableCategories.map((cat) => {
              const isChecked = selectedCatIds.includes(cat.id)
              return (
                <div
                  key={cat.id}
                  onClick={() => handleToggleCatSelect(cat.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                    isChecked
                      ? 'border-amber-400 bg-amber-950/30'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className="font-serif font-bold text-neutral-200">{cat.name}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-800 text-neutral-300 font-medium"
            >
              Close
            </button>
            <button
              disabled={selectedCatIds.length === 0}
              onClick={handleCommitAddSelected}
              className="px-5 py-2 text-sm rounded-lg bg-amber-500 text-neutral-950 font-bold disabled:opacity-50"
            >
              Add Selected ({selectedCatIds.length})
            </button>
          </div>
        </div>
      </Dialog>

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  )
}
