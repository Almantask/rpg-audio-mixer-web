import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Dice5,
  Trash2,
  Plus,
  GripVertical,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { audioEngine } from '../services/audioEngine'
import { SoundscapesPickerModal } from '../components/modals/SoundscapesPickerModal'
import { FXPickerModal } from '../components/modals/FXPickerModal'

export const ActiveScenePage: React.FC = () => {
  const { sceneId, campaignId, sessionId } = useParams<{
    sceneId?: string
    campaignId?: string
    sessionId?: string
  }>()

  const navigate = useNavigate()
  const {
    scenes,
    campaigns,
    sessions,
    soundscapeCategories,
    soundscapeTracks,
    fxTracks,
    mixerState,
    setMasterVolume,
    setSoundboardMasterVolume,
    toggleMute,
    toggleSessionLock,
    playCategoryTrack,
    pauseCategoryTrack,
    rerollCategoryTrack,
    setCategoryIntensity,
    setCategoryVolume,
    removeCategoryFromScene,
    triggerFXTile,
    stopFXTile,
    removeFXFromScene,
    playSceneAudio,
    stopAllAudio,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'soundscapes' | 'soundboard'>('soundscapes')
  const [isAddSoundscapeOpen, setIsAddSoundscapeOpen] = useState(false)
  const [isAddFXOpen, setIsAddFXOpen] = useState(false)

  const targetSceneId = sceneId || ''
  const scene = scenes.find((s) => s.id === targetSceneId)
  const campaign = campaignId ? campaigns.find((c) => c.id === campaignId) : null
  const session = sessionId ? sessions.find((s) => s.id === sessionId) : null

  useEffect(() => {
    if (scene) {
      // Mark scene as last played
      scene.lastPlayedAt = new Date().toISOString()
    }
  }, [scene])

  if (!scene) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Scene not found.</p>
        <button
          onClick={() => navigate('/scenes')}
          className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold"
        >
          Return to Scenes
        </button>
      </div>
    )
  }

  const { isSessionLocked, isMuted, masterVolume, soundboardMasterVolume, playingCategories } =
    mixerState

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Header Context & Breadcrumbs */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {session && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-500 text-black">
                  <Sparkles size={12} /> ACTIVE SCENE
                </span>
              )}
              <div className="text-xs uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1.5">
                {session && campaign ? (
                  <>
                    <Link to="/campaigns" className="hover:text-yellow-500">
                      CAMPAIGN
                    </Link>
                    <span>&gt;</span>
                    <Link
                      to={`/campaigns/${campaign.id}/sessions`}
                      className="hover:text-yellow-500"
                    >
                      {campaign.name}
                    </Link>
                    <span>&gt;</span>
                    <Link
                      to={`/campaigns/${campaign.id}/sessions/${session.id}/scenes`}
                      className="hover:text-yellow-500"
                    >
                      SESSION {session.sessionNumber}
                    </Link>
                  </>
                ) : (
                  <Link to="/scenes" className="hover:text-yellow-500">
                    SCENES
                  </Link>
                )}
              </div>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold text-yellow-500">
              {scene.name}
            </h1>
          </div>

          {/* Action Header Buttons: Stop All & Session Lock */}
          <div className="flex items-center gap-3">
            <button
              onClick={stopAllAudio}
              className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600 hover:text-white text-xs font-bold transition-all"
            >
              Stop All
            </button>

            <button
              onClick={toggleSessionLock}
              className={`p-2.5 rounded-lg border transition-all ${
                isSessionLocked
                  ? 'bg-yellow-500 text-black border-yellow-500'
                  : 'bg-[#161616] text-gray-400 border-yellow-900/30 hover:text-yellow-500'
              }`}
              title={isSessionLocked ? 'Session Locked' : 'Session Unlocked'}
            >
              {isSessionLocked ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Strip */}
      <div className="flex gap-8 border-b border-yellow-900/30 font-serif text-lg">
        <button
          onClick={() => setActiveTab('soundscapes')}
          className={`pb-3 font-bold transition-all relative ${
            activeTab === 'soundscapes'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Soundscapes
        </button>
        <button
          onClick={() => setActiveTab('soundboard')}
          className={`pb-3 font-bold transition-all relative ${
            activeTab === 'soundboard'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Soundboard
        </button>
      </div>

      {/* Tab 1: Soundscapes Tab */}
      {activeTab === 'soundscapes' && (
        <div className="space-y-6">
          {/* Master Volume Bar */}
          <div className="p-4 rounded-xl bg-[#161616] border border-yellow-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => playSceneAudio(scene.id)}
                className="px-5 py-2.5 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 flex items-center gap-2"
              >
                <Play size={16} fill="currentColor" /> Play Scene
              </button>

              <button
                onClick={toggleMute}
                className="p-2.5 rounded-lg bg-black/40 border border-yellow-900/20 text-yellow-500 hover:bg-white/5"
                title={isMuted ? 'Unmute Soundscapes' : 'Mute Soundscapes'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-4 w-full sm:flex-1 max-w-md">
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider shrink-0">
                MASTER VOLUME
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-full accent-yellow-500 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-400 w-10 text-right">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Soundscape Category Cards List */}
          <div className="space-y-4">
            {scene.soundscapeCategories.map((scConfig) => {
              const category = soundscapeCategories.find((c) => c.id === scConfig.categoryId)
              if (!category) return null

              const isPlaying = audioEngine.isCategoryPlaying(category.id)
              const playingTrackId = playingCategories[category.id]?.trackId
              const playingTrack = soundscapeTracks.find((t) => t.id === playingTrackId)

              const totalTrackCount =
                (category.levels.I?.length || 0) +
                (category.levels.II?.length || 0) +
                (category.levels.III?.length || 0)

              const currentLevelPool = category.levels[scConfig.intensity] || []
              const hasTracksOnLevel = currentLevelPool.length > 0

              return (
                <div
                  key={category.id}
                  className={`p-5 rounded-xl border bg-[#161616] space-y-4 transition-all relative ${
                    isPlaying
                      ? 'border-yellow-500 ring-2 ring-yellow-500/50 bg-yellow-500/5'
                      : 'border-yellow-900/30'
                  }`}
                >
                  {/* Category Card Header */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {!isSessionLocked && (
                        <GripVertical size={18} className="text-gray-600 cursor-grab" />
                      )}
                      <div>
                        <h3 className="font-serif text-lg font-bold text-yellow-500 uppercase">
                          {category.name} ({totalTrackCount} TRACKS)
                        </h3>
                        {playingTrack && (
                          <p className="text-xs text-gray-300 italic">
                            Playing: {playingTrack.title}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* d20 Re-roll */}
                      <button
                        onClick={() => rerollCategoryTrack(scene.id, category.id)}
                        disabled={!hasTracksOnLevel}
                        className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black border border-yellow-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Re-roll random track from current level"
                      >
                        <Dice5 size={18} />
                      </button>

                      {/* Play / Pause */}
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            pauseCategoryTrack(category.id)
                          } else {
                            playCategoryTrack(scene.id, category.id)
                          }
                        }}
                        disabled={!hasTracksOnLevel}
                        className="p-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                      </button>

                      {/* Delete Category from Scene */}
                      {!isSessionLocked && (
                        <button
                          onClick={() => removeCategoryFromScene(scene.id, category.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                          title="Remove from Scene"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Playback progress bar */}
                  {isPlaying && (
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full w-1/2 animate-pulse" />
                    </div>
                  )}

                  {/* Intensity Toggles & Volume Slider */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-yellow-900/20 items-center">
                    {/* Intensity Level Toggles */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
                        INTENSITY
                      </span>
                      {(['I', 'II', 'III'] as const).map((lvl) => {
                        const levelHasTracks = (category.levels[lvl]?.length || 0) > 0
                        const isSelected = scConfig.intensity === lvl

                        return (
                          <button
                            key={lvl}
                            onClick={() =>
                              setCategoryIntensity(scene.id, category.id, lvl)
                            }
                            disabled={!levelHasTracks}
                            className={`px-3 py-1 text-xs font-serif font-bold rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-yellow-500 text-black border-yellow-500'
                                : levelHasTracks
                                ? 'bg-black/40 text-gray-300 border-yellow-900/30 hover:border-yellow-500/50'
                                : 'bg-black/20 text-gray-600 border-gray-800 cursor-not-allowed opacity-40'
                            }`}
                          >
                            {lvl}
                          </button>
                        )
                      })}
                    </div>

                    {/* Per-Category Volume Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
                        VOLUME
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={scConfig.volume}
                        onChange={(e) =>
                          setCategoryVolume(scene.id, category.id, parseFloat(e.target.value))
                        }
                        className="w-full accent-yellow-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {/* + ADD SOUNDSCAPE Button */}
            {!isSessionLocked && (
              <button
                onClick={() => setIsAddSoundscapeOpen(true)}
                className="w-full p-4 rounded-xl bg-yellow-500 text-black font-bold text-base hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                <span>+ ADD SOUNDSCAPE</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Soundboard Tab */}
      {activeTab === 'soundboard' && (
        <div className="space-y-6">
          {/* Soundboard Master Volume Bar */}
          <div className="p-4 rounded-xl bg-[#161616] border border-yellow-900/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Volume2 size={20} className="text-purple-400" />
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                SOUNDBOARD MASTER
              </span>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-md">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={soundboardMasterVolume}
                onChange={(e) => setSoundboardMasterVolume(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-400 w-10 text-right">
                {Math.round(soundboardMasterVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Soundboard Grid (2-4 columns) */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-purple-400">Soundboard</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {scene.soundboardTiles.map((tile) => {
                const fx = fxTracks.find((f) => f.id === tile.fxTrackId)
                if (!fx) return null

                return (
                  <div
                    key={tile.id}
                    onClick={() => triggerFXTile(fx.id)}
                    className="p-4 rounded-xl border border-purple-900/40 bg-[#161616] hover:border-purple-500/80 cursor-pointer transition-all flex flex-col justify-between min-h-[110px] group relative"
                  >
                    <div className="flex items-center justify-between">
                      {!isSessionLocked && (
                        <GripVertical size={16} className="text-gray-600 cursor-grab" />
                      )}
                      <span className="text-xs font-mono font-bold text-purple-400">
                        {tile.hotkey ? `Num ${tile.hotkey}` : ''}
                      </span>
                      {!isSessionLocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFXFromScene(scene.id, tile.id)
                          }}
                          className="p-1 text-gray-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="my-2">
                      <h4 className="font-serif font-bold text-gray-100 text-base group-hover:text-purple-300">
                        {fx.title}
                      </h4>
                      <p className="text-[11px] text-gray-400">0:0{fx.durationSeconds ?? 3}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-purple-400 font-semibold">
                      <span>Trigger FX</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          stopFXTile(fx.id)
                        }}
                        className="p-1 hover:text-red-400"
                        title="Stop effect instances"
                      >
                        <Square size={12} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Add Sound Tile */}
              {!isSessionLocked && scene.soundboardTiles.length < 24 && (
                <button
                  onClick={() => setIsAddFXOpen(true)}
                  className="min-h-[110px] p-4 border-2 border-dashed border-purple-900/40 rounded-xl bg-purple-950/10 hover:bg-purple-950/20 hover:border-purple-500/60 transition-all flex flex-col items-center justify-center gap-2 text-purple-400 font-serif font-bold text-sm"
                >
                  <Plus size={24} />
                  <span>+ Add Sound</span>
                </button>
              )}
            </div>

            {scene.soundboardTiles.length >= 24 && (
              <p className="text-xs text-purple-400 italic mt-2">
                Board full — remove an effect to add more.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Soundscapes Picker Modal */}
      <SoundscapesPickerModal
        isOpen={isAddSoundscapeOpen}
        onClose={() => setIsAddSoundscapeOpen(false)}
        sceneId={scene.id}
      />

      {/* FX Picker Modal */}
      <FXPickerModal
        isOpen={isAddFXOpen}
        onClose={() => setIsAddFXOpen(false)}
        sceneId={scene.id}
      />
    </div>
  )
}
