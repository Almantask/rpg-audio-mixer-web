import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react'
import { Dices, GripVertical, Pause, Play, Plus, Trash2, Volume2, VolumeX } from 'lucide-react'
import type { SceneSoundscapeSlot, SoundscapeIntensity } from '@/types/scene'
import type { SoundscapeCategory } from '@/types/library'
import { useCampaignData } from '@/context/CampaignDataContext'
import { useSceneAudio } from '@/context/SceneAudioContext'
import { cn } from '@/lib/utils'
import { useFlipReorderAnimation } from '@/hooks/useFlipReorderAnimation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SoundscapesTabProps {
  sceneId: string
  slots: Array<SceneSoundscapeSlot & { category?: SoundscapeCategory }>
  onRemoveSlot: (slotId: string) => void
  onAddSoundscape: () => void
  locked?: boolean
}

const INTENSITIES: SoundscapeIntensity[] = ['I', 'II', 'III']

interface SoundscapeCategoryCardProps {
  slot: SceneSoundscapeSlot & { category?: SoundscapeCategory }
  locked: boolean
  onRemove: () => void
  onDragStart: (event: DragEvent<HTMLDivElement>) => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
}

function SoundscapeMasterControls() {
  const {
    playback,
    setSoundscapeMasterVolume,
    setSoundscapeMuted,
    playScene,
  } = useSceneAudio()

  return (
    <Card className="mb-6 border-white/10">
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
        <Button
          type="button"
          variant="outline"
          aria-label="Play Scene"
          data-play-scene
          onClick={() => {
            void playScene()
          }}
        >
          Play Scene
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={playback.soundscapeMuted ? 'Unmute soundscapes' : 'Mute soundscapes'}
          data-soundscape-mute
          onClick={() => setSoundscapeMuted(!playback.soundscapeMuted)}
        >
          {playback.soundscapeMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-gold">Master Volume</span>
          <input
            type="range"
            min={0}
            max={100}
            value={playback.soundscapeMasterVolume}
            className="flex-1"
            data-soundscape-master-slider
            aria-label="Soundscape master volume"
            onChange={(event) => setSoundscapeMasterVolume(Number(event.target.value))}
          />
          <span className="text-sm text-muted">{playback.soundscapeMasterVolume}%</span>
        </div>
      </CardContent>
    </Card>
  )
}

function SoundscapeCategoryCard({
  slot,
  locked,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: SoundscapeCategoryCardProps) {
  const categoryName = slot.category?.name ?? slot.categoryId
  const {
    getSoundscapeTileState,
    playSoundscape,
    pauseSoundscape,
    rollSoundscapeRandom,
    updateSlotVolume,
    updateSlotIntensity,
    canPlaySoundscape,
    setFocusedSoundscapeSlot,
  } = useSceneAudio()

  const tile = getSoundscapeTileState(slot.id)
  const playing = tile?.playing ?? false
  const paused = tile?.paused ?? false
  const progress = playing ? (tile?.progress ?? 0) : 0
  const trackName = tile?.trackName
  const intensity = slot.intensity ?? 'II'
  const volume = slot.volume ?? 100

  const intensityHasTracks = (level: SoundscapeIntensity) => {
    const pool = slot.category?.levels?.[level] ?? []
    return pool.length > 0
  }

  const playDisabled = !canPlaySoundscape(slot.id)
  const d20Disabled = !canPlaySoundscape(slot.id)

  return (
    <Card
      data-soundscape-category={categoryName}
      data-flip-id={slot.id}
      className={cn(
        'border-white/10 transition-shadow',
        playing && 'border-gold/60 shadow-[0_0_16px_rgba(212,175,55,0.35)]',
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardContent className="p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <div
              draggable={!locked}
              onDragStart={onDragStart}
              aria-label="Drag handle"
              data-drag-handle
              className={cn('mt-1 cursor-grab', locked && 'cursor-not-allowed opacity-40')}
            >
              <GripVertical className="h-4 w-4 text-muted" />
            </div>
            <div>
              <p className="font-serif uppercase tracking-wide text-gold">
                {categoryName} ({slot.category?.trackCount ?? 0} tracks)
              </p>
              <p
                className="text-sm italic text-white"
                data-soundscape-track-title={categoryName}
              >
                {trackName ?? 'No track loaded'}
              </p>
              <p
                className="text-sm text-muted"
                data-soundscape-playback-state={categoryName}
                data-state={playing ? 'playing' : paused ? 'paused' : 'idle'}
              >
                {playing ? 'Playing' : paused ? 'Paused' : 'Idle'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Roll random track for ${categoryName}`}
              data-soundscape-d20={categoryName}
              disabled={d20Disabled}
              onClick={() => {
                setFocusedSoundscapeSlot(slot.id)
                void rollSoundscapeRandom(slot.id)
              }}
            >
              <Dices className="h-4 w-4" />
            </Button>
            {playing ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Pause ${categoryName}`}
                data-soundscape-pause={categoryName}
                onClick={() => pauseSoundscape(slot.id)}
              >
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Play ${categoryName}`}
                data-soundscape-play={categoryName}
                disabled={playDisabled}
                onClick={() => {
                  setFocusedSoundscapeSlot(slot.id)
                  void playSoundscape(slot.id)
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ${categoryName}`}
              data-soundscape-delete={categoryName}
              disabled={locked}
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className="mb-4 h-1 overflow-hidden rounded bg-white/10"
          data-soundscape-progress={categoryName}
          aria-hidden="true"
        >
          <div
            className={cn('h-full bg-gold transition-all', playing ? 'opacity-100' : 'opacity-30')}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">Intensity</p>
          <div className="flex gap-2">
            {INTENSITIES.map((level) => {
              const enabled = intensityHasTracks(level)
              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={intensity === level}
                  disabled={!enabled}
                  className={cn(
                    'min-h-[44px] min-w-[44px] rounded border px-3 py-2 text-sm',
                    intensity === level ? 'border-gold text-gold' : 'border-white/20 text-muted',
                    !enabled && 'cursor-not-allowed opacity-40',
                  )}
                  onClick={() => updateSlotIntensity(slot.id, level)}
                >
                  {level}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-sm text-muted" data-soundscape-intensity={categoryName}>
            {intensity}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">Volume</p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              className="flex-1"
              aria-label={`${categoryName} volume`}
              onChange={(event) => updateSlotVolume(slot.id, Number(event.target.value))}
            />
            <span className="text-sm text-muted" data-soundscape-volume={categoryName}>
              {volume}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SoundscapesTab({
  sceneId,
  slots,
  onRemoveSlot,
  onAddSoundscape,
  locked = false,
}: SoundscapesTabProps) {
  const { reorderSoundscapeSlots } = useCampaignData()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const reorderSlots = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) {
        return
      }
      const ids = slots.map((slot) => slot.id)
      const fromIndex = ids.indexOf(sourceId)
      const toIndex = ids.indexOf(targetId)
      if (fromIndex === -1 || toIndex === -1) {
        return
      }
      const next = [...ids]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      reorderSoundscapeSlots(sceneId, next)
    },
    [reorderSoundscapeSlots, sceneId, slots],
  )

  const sortedSlots = useMemo(() => [...slots].sort((a, b) => a.order - b.order), [slots])
  const listRef = useRef<HTMLDivElement | null>(null)
  useFlipReorderAnimation(
    listRef,
    [sortedSlots.map((slot) => slot.id).join('|')],
    { durationMs: 180 },
  )

  return (
    <div data-soundscapes-tab>
      <SoundscapeMasterControls />

      {sortedSlots.length === 0 ? (
        <p className="mb-6 text-center text-muted" data-soundscape-empty>
          No soundscape categories yet. Add one to begin layering ambience.
        </p>
      ) : (
        <div ref={listRef} className="mb-6 space-y-4" data-soundscape-category-list>
          {sortedSlots.map((slot) => (
            <SoundscapeCategoryCard
              key={slot.id}
              slot={slot}
              locked={locked}
              onRemove={() => onRemoveSlot(slot.id)}
              onDragStart={(event) => {
                if (locked) {
                  event.preventDefault()
                  return
                }
                setDraggingId(slot.id)
                setDragOverId(null)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', slot.id)
              }}
              onDragOver={(event) => {
                if (locked) {
                  return
                }
                event.preventDefault()
                const sourceId = event.dataTransfer.getData('text/plain') || draggingId
                if (!sourceId || sourceId === slot.id) {
                  return
                }
                if (dragOverId === slot.id) {
                  return
                }
                setDragOverId(slot.id)
                reorderSlots(sourceId, slot.id)
              }}
              onDrop={(event) => {
                if (locked) {
                  return
                }
                event.preventDefault()
                setDraggingId(null)
                setDragOverId(null)
              }}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        aria-label="Add Soundscape"
        data-soundscape-add
        disabled={locked}
        className={cn(
          'flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-gold/40 p-6 text-gold hover:border-gold/70',
          locked && 'cursor-not-allowed opacity-40',
        )}
        onClick={onAddSoundscape}
      >
        <Plus className="mb-2 h-6 w-6" />
        Add Soundscape
      </button>
    </div>
  )
}
