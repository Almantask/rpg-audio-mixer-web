import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Trash2, Play, Pause } from 'lucide-react'
import { db } from '../storage/db'
import { sceneAudioManager } from '../audio/sceneAudioManager'
import type { Scene, FXTrack } from '../types'
import { FXPickerModal } from '../components/soundboard/FXPickerModal'

export const ActiveScenePage: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>()

  const [scene, setScene] = useState<Scene | null>(null)
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'soundboard'>('soundscapes')
  const [isFXPickerOpen, setIsFXPickerOpen] = useState(false)
  const [playingTileId, setPlayingTileId] = useState<string | null>(null)

  const reloadScene = () => {
    if (!sceneId) return
    const sc = db.getSceneById(sceneId)
    setScene(sc ? { ...sc } : null)
  }

  useEffect(() => {
    reloadScene()
    const handleUpdate = () => reloadScene()
    window.addEventListener('arcanum_db_updated', handleUpdate)
    return () => window.removeEventListener('arcanum_db_updated', handleUpdate)
  }, [sceneId])

  if (!scene) {
    return <div className="text-center py-12 text-neutral-400">Scene not found.</div>
  }

  const allFXTracks = db.getFXTracks()
  const sceneFXTracks = scene.effectIds
    .map((id) => allFXTracks.find((f) => f.id === id))
    .filter((f): f is FXTrack => Boolean(f))

  const handleCommitFX = (selectedFX: FXTrack[]) => {
    const newEffectIds = [...scene.effectIds, ...selectedFX.map((f) => f.id)]
    db.updateScene(scene.id, { effectIds: newEffectIds })
    reloadScene()
  }

  const handleRemoveFX = (fxId: string) => {
    const updatedIds = scene.effectIds.filter((id) => id !== fxId)
    db.updateScene(scene.id, { effectIds: updatedIds })
    reloadScene()
  }

  const handleRemoveSoundscape = (catName: string) => {
    const updatedCats = scene.soundscapeCategories.filter((c) => c !== catName)
    db.updateScene(scene.id, { soundscapeCategories: updatedCats })
    reloadScene()
  }

  const handleTileClick = (fx: FXTrack, tileId: string) => {
    if (playingTileId === tileId) {
      sceneAudioManager.stopTrack(tileId, fx.title, 'soundboard')
      setPlayingTileId(null)
    } else {
      sceneAudioManager.playTrack(tileId, fx.title, 'soundboard', fx.fileUrl)
      setPlayingTileId(tileId)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-neutral-100">{scene.name}</h1>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Active Scene
          </span>
        </div>
        {scene.description && (
          <p className="text-sm text-neutral-300">{scene.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800 flex gap-6">
        <button
          onClick={() => setActiveTab('soundscapes')}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'soundscapes'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Soundscapes
        </button>
        <button
          onClick={() => setActiveTab('soundboard')}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'soundboard'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Soundboard
        </button>
      </div>

      {/* Soundscapes Tab Content */}
      {activeTab === 'soundscapes' && (
        <div className="space-y-6">
          {scene.soundscapeCategories.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center space-y-4 max-w-md mx-auto">
              <p className="text-neutral-300 font-medium">This scene has no soundscape categories.</p>
              <button
                onClick={() => {
                  const cat = prompt('Enter soundscape category name:')
                  if (cat) {
                    db.updateScene(scene.id, {
                      soundscapeCategories: [...scene.soundscapeCategories, cat],
                    })
                    reloadScene()
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2.5 rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Soundscape
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scene.soundscapeCategories.map((cat) => (
                <div
                  key={cat}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
                  data-soundscape-playback-state={cat}
                >
                  <span className="font-bold text-neutral-100">{cat}</span>
                  <button
                    onClick={() => handleRemoveSoundscape(cat)}
                    aria-label={`Remove ${cat}`}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add Soundscape button at the end */}
              <button
                onClick={() => {
                  const cat = prompt('Enter soundscape category name:')
                  if (cat) {
                    db.updateScene(scene.id, {
                      soundscapeCategories: [...scene.soundscapeCategories, cat],
                    })
                    reloadScene()
                  }
                }}
                className="bg-neutral-900/40 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl p-4 flex items-center justify-center gap-2 text-neutral-400 hover:text-amber-400 font-bold"
              >
                <Plus className="w-4 h-4" /> Add Soundscape
              </button>
            </div>
          )}
        </div>
      )}

      {/* Soundboard Tab Content */}
      {activeTab === 'soundboard' && (
        <div className="space-y-6">
          {sceneFXTracks.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center space-y-4 max-w-md mx-auto">
              <p className="text-neutral-300 font-medium">The soundboard has no effects.</p>
              <button
                onClick={() => setIsFXPickerOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2.5 rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Sound
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sceneFXTracks.map((fx, index) => {
                const tileId = `tile-${fx.id}-${index}`
                const hotkey = `Num ${index + 1}`
                const isPlaying = playingTileId === tileId

                return (
                  <div
                    key={tileId}
                    onClick={() => handleTileClick(fx, tileId)}
                    className={`bg-neutral-900 border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all aspect-square relative group ${
                      isPlaying
                        ? 'border-amber-500 bg-amber-950/40 shadow-lg ring-2 ring-amber-500/50'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                    data-soundboard-tile={fx.title}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {hotkey}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFX(fx.id)
                        }}
                        aria-label={`Remove ${fx.title} effect`}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-center my-auto space-y-1">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 mx-auto flex items-center justify-center text-neutral-200 group-hover:text-amber-400 group-hover:bg-amber-500/20">
                        {isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </div>
                      <div className="font-bold text-neutral-100 text-xs line-clamp-2">
                        {fx.title}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Add Sound button at the end of the grid */}
              <button
                onClick={() => setIsFXPickerOpen(true)}
                className="bg-neutral-900/40 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-amber-400 font-bold aspect-square"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs">Add Sound</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* FX Picker Modal */}
      <FXPickerModal
        isOpen={isFXPickerOpen}
        existingEffectIds={scene.effectIds}
        onClose={() => setIsFXPickerOpen(false)}
        onCommit={handleCommitFX}
      />
    </div>
  )
}
