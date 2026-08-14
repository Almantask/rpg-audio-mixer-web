import { useState, useEffect } from 'react'
import { ArrowLeft, Search, Check, Play, Pause } from 'lucide-react'
import { useFxTracks } from '../../lib/useStorage'
import { storage } from '../../lib/storage'
import { sceneAudioManager } from '../../lib/audio/sceneAudioManager'
import { subscribeAudioState } from '../../lib/audio/audioState'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { toast } from '../ui/toast'
import type { FxTrack } from '../../lib/types'

interface FxPickerModalProps {
  open: boolean
  sceneId: string
  onClose: () => void
  onCommitted: () => void
}

export function FxPickerModal({ open, sceneId, onClose, onCommitted }: FxPickerModalProps) {
  const { fxTracks } = useFxTracks()
  const scene = storage.getSceneById(sceneId)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null)

  useEffect(() => {
    return subscribeAudioState((state) => {
      if (!state.isPlaying || state.source !== 'picker') {
        setPreviewTrackId(null)
      }
    })
  }, [])

  if (!open || !scene) return null

  // Filter out tracks already on this scene's soundboard
  const existingFxTrackIds = (scene.soundboardEffects || []).map((e) => e.fxTrackId)
  const availableTracks = fxTracks.filter((t) => !existingFxTrackIds.includes(t.id))

  // Filter by search query
  const filteredTracks = availableTracks.filter((track) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    const nameMatch = track.name.toLowerCase().includes(q)
    const tagMatch = track.tags?.some((t) => t.toLowerCase().includes(q))
    return nameMatch || tagMatch
  })

  const handleToggleSelect = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIds.includes(trackId)) {
      setSelectedIds(selectedIds.filter((id) => id !== trackId))
    } else {
      setSelectedIds([...selectedIds, trackId])
    }
  }

  const handlePreview = (track: FxTrack) => {
    if (previewTrackId === track.id) {
      sceneAudioManager.stopBySource('picker')
      setPreviewTrackId(null)
    } else {
      sceneAudioManager.playFx(track.id, track.name, track.url, {
        source: 'picker',
        durationSeconds: track.durationSeconds || 4,
        defaultVolume: track.defaultVolume ?? 1,
      })
      setPreviewTrackId(track.id)
    }
  }

  const handleCommit = () => {
    if (selectedIds.length === 0) return

    for (const trackId of selectedIds) {
      storage.addFxToSoundboard(sceneId, trackId)
    }

    const count = selectedIds.length
    toast.show(`${count} ${count === 1 ? 'effect' : 'effects'} added`)

    setSelectedIds([])
    onCommitted()
  }

  const handleClose = () => {
    sceneAudioManager.stopBySource('picker')
    setPreviewTrackId(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0D0D] p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col space-y-3 pb-4 border-b border-zinc-800">
        <button
          onClick={handleClose}
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 w-fit cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Active Scene
        </button>
        <div>
          <h2 className="font-serif text-3xl font-bold text-amber-300">Sound Effects</h2>
          <p className="text-zinc-400 text-sm">Select effects for this scene's soundboard.</p>
        </div>

        {/* Search Bar */}
        <div className="relative pt-2">
          <Search className="absolute left-3 top-4.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search effects…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-800"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto py-6">
        {fxTracks.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <h4 className="font-serif text-lg font-bold text-zinc-300">No effects in library</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Import or download sound effects via Library — Sound Effects.
            </p>
          </div>
        ) : availableTracks.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-semibold text-zinc-400">
              All effects in your library are already on this soundboard.
            </p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-zinc-400">No effects match your filters</p>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredTracks.map((track) => {
              const isChecked = selectedIds.includes(track.id)
              const isPlaying = previewTrackId === track.id

              return (
                <Card
                  key={track.id}
                  data-fx-id={track.id}
                  onClick={() => handlePreview(track)}
                  className={`p-3 cursor-pointer relative flex flex-col justify-between transition-all border ${
                    isPlaying
                      ? 'border-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.3)] bg-amber-950/20'
                      : isChecked
                        ? 'border-amber-500/60 bg-zinc-900'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  {/* Top: Checkbox & Preview indicator */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => handleToggleSelect(track.id, e)}
                      className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-amber-400 bg-amber-400 text-black'
                          : 'border-zinc-600 bg-zinc-900 hover:border-zinc-400'
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>

                    <div className="text-zinc-400 hover:text-amber-300 p-1">
                      {isPlaying ? (
                        <Pause className="h-4 w-4 text-amber-400 fill-current animate-pulse" />
                      ) : (
                        <Play className="h-4 w-4 text-zinc-500 hover:text-zinc-200" />
                      )}
                    </div>
                  </div>

                  {/* Mid: Title & Duration */}
                  <div className="my-2 space-y-1">
                    <div className="font-serif font-bold text-sm text-zinc-100 line-clamp-1">
                      {track.name}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {track.duration} · <span className="font-serif font-bold">{track.intensity}</span>
                    </div>
                  </div>

                  {/* Bottom: Tags */}
                  <div className="flex flex-wrap gap-1">
                    {track.tags?.slice(0, 2).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0 uppercase">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Sticky Footer: Add Selected (N) */}
      <div className="pt-4 border-t border-zinc-800 flex justify-end">
        <Button
          variant="gold"
          size="lg"
          disabled={selectedIds.length === 0}
          onClick={handleCommit}
          className="w-full sm:w-auto min-w-[200px]"
        >
          Add Selected ({selectedIds.length})
        </Button>
      </div>
    </div>
  )
}
