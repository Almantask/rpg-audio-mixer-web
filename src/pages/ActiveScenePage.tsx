import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Square, Lock, Unlock, Volume2, Plus, Play, Pause, Trash2, GripVertical } from 'lucide-react'
import { getDb, saveDb, type Scene, type FxTrack } from '../lib/storage/db'
import { playFxTrack, stopFxTrack, stopAllFx } from '../lib/audio/soundboardEngine'
import { AddFxPickerModal } from '../components/modals/AddFxPickerModal'

interface AssignedFx {
  itemOrder: number
  fx: FxTrack
}

export const ActiveScenePage: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>()
  const [scene, setScene] = useState<Scene | null>(null)
  const [activeTab, setActiveTab] = useState<'soundscapes' | 'soundboard'>('soundboard')
  const [isLocked, setIsLocked] = useState(false)
  const [masterVolume, setMasterVolume] = useState(0.85)
  const [assignedFxList, setAssignedFxList] = useState<AssignedFx[]>([])
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false)
  const [playingFxNames, setPlayingFxNames] = useState<string[]>([])

  const loadData = () => {
    if (!sceneId) return
    const db = getDb()
    const foundScene = db.scenes.find((s) => s.id === sceneId && !s.deletedAt)
    if (!foundScene) return
    setScene(foundScene)

    const items = db.soundboardItems
      .filter((item) => item.sceneId === sceneId)
      .sort((a, b) => a.order - b.order)

    const list: AssignedFx[] = []
    items.forEach((item) => {
      const fx = db.fxTracks.find((f) => f.id === item.fxTrackId && !f.deletedAt)
      if (fx) {
        list.push({ itemOrder: item.order, fx })
      }
    })
    setAssignedFxList(list)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData()
  }, [sceneId])

  if (!scene) {
    return (
      <div className="text-center py-12 text-neutral-400">
        Scene not found or deleted.
      </div>
    )
  }

  const handleTileClick = (fxName: string) => {
    playFxTrack(fxName, 'soundboard', masterVolume)
    if (!playingFxNames.includes(fxName)) {
      setPlayingFxNames((prev) => [...prev, fxName])
    }
  }

  const handleStopTileFx = (fxName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    stopFxTrack(fxName)
    setPlayingFxNames((prev) => prev.filter((name) => name !== fxName))
  }

  const handleStopAll = () => {
    stopAllFx()
    setPlayingFxNames([])
  }

  const handleRemoveFx = (fxId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLocked) return
    const db = getDb()
    db.soundboardItems = db.soundboardItems.filter(
      (item) => !(item.sceneId === sceneId && item.fxTrackId === fxId)
    )
    saveDb(db)
    loadData()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
            Active Scene
          </span>
          <h1 className="text-2xl font-serif font-bold text-neutral-100">{scene.name}</h1>
          {scene.description && (
            <p className="text-xs text-neutral-400 mt-0.5">{scene.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStopAll}
            aria-label="Stop All"
            className="px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop All</span>
          </button>

          <button
            onClick={() => setIsLocked(!isLocked)}
            aria-label="Session Lock"
            className={`p-2 rounded-lg border transition-colors ${
              isLocked
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('soundscapes')}
          className={`pb-3 font-serif font-medium text-sm transition-colors relative ${
            activeTab === 'soundscapes' ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Soundscapes
          {activeTab === 'soundscapes' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('soundboard')}
          className={`pb-3 font-serif font-medium text-sm transition-colors relative ${
            activeTab === 'soundboard' ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Soundboard
          {activeTab === 'soundboard' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'soundscapes' ? (
        <div className="bg-[#121212] border border-neutral-800 rounded-xl p-8 text-center space-y-4">
          <p className="text-sm text-neutral-400">
            No soundscapes added to this scene yet. Switch to Soundboard tab to play FX clips.
          </p>
          {!isLocked && (
            <button className="px-4 py-2 bg-amber-500/10 border border-amber-500/40 text-amber-400 font-semibold rounded-lg text-sm hover:bg-amber-500/20">
              Add Soundscape
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Soundboard Master */}
          <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
            <Volume2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-serif font-semibold text-neutral-300 shrink-0">
              Soundboard Master
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-semibold text-amber-400 shrink-0">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {/* Soundboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {assignedFxList.map((item, idx) => {
              const isPlaying = playingFxNames.includes(item.fx.name)
              const hotkeyLabel = idx < 9 ? `Num ${idx + 1}` : null

              return (
                <div
                  key={`${item.fx.id}-${idx}`}
                  data-testid={`soundboard-tile-${item.fx.name}`}
                  onClick={() => handleTileClick(item.fx.name)}
                  className={`bg-[#121212] border rounded-xl p-3 flex flex-col justify-between min-h-[100px] cursor-pointer relative transition-all ${
                    isPlaying
                      ? 'border-amber-400 bg-amber-950/20 shadow-lg shadow-amber-950/50 ring-1 ring-amber-400/50'
                      : 'border-neutral-800 hover:border-amber-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {!isLocked ? (
                      <GripVertical className="w-4 h-4 text-neutral-600 cursor-grab" />
                    ) : (
                      <span />
                    )}

                    {!isLocked && (
                      <button
                        onClick={(e) => handleRemoveFx(item.fx.id, e)}
                        aria-label={`Remove ${item.fx.name}`}
                        className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif text-sm font-semibold text-neutral-100 truncate">
                      {item.fx.name}
                    </h4>
                    {hotkeyLabel && (
                      <span className="text-[10px] text-neutral-500 font-mono font-medium">
                        {hotkeyLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] uppercase font-bold text-purple-400">
                      FX
                    </span>

                    {isPlaying ? (
                      <button
                        onClick={(e) => handleStopTileFx(item.fx.name, e)}
                        aria-label={`Pause ${item.fx.name}`}
                        className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-800 text-amber-400 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Add Sound Tile */}
            {!isLocked && (
              <button
                onClick={() => setIsAddPickerOpen(true)}
                data-testid="add-sound-tile"
                className="border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#121212]/50 hover:bg-[#121212] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-amber-400 font-serif font-medium transition-colors min-h-[100px]"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs">Add Sound</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Sound FX Picker Modal */}
      {isAddPickerOpen && (
        <AddFxPickerModal
          sceneId={scene.id}
          onClose={() => {
            setIsAddPickerOpen(false)
            loadData()
          }}
          onAdded={() => {
            loadData()
          }}
        />
      )}
    </div>
  )
}
