import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react'
import { Dices, GripVertical, Pause, Play, Plus, Trash2, Volume2, VolumeX } from 'lucide-react'
import type { SceneSoundscapeSlot, SoundscapeIntensity } from '@/types/scene'
import type { SoundscapeCategory } from '@/types/library'
import { useCampaignData } from '@/context/CampaignDataContext'
import { useSceneAudio } from '@/context/SceneAudioContext'
import { reorderIdsForDragOver } from '@/lib/liveDragReorder'
import { EMPTY_INTENSITY_LEVEL_HINT } from '@/lib/soundscapeStorage'
import { cn } from '@/lib/utils'
import { useFlipReorderAnimation } from '@/hooks/useFlipReorderAnimation'
import { useHtml5CardDragPreview } from '@/hooks/useHtml5CardDragPreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'

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
  dragging: boolean
  onRemove: () => void
  onDragStart: (event: DragEvent<HTMLDivElement>) => void
  onDrag: (event: DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
}

function SoundscapeMasterControls({
  slotIds,
}: {
  slotIds: string[]
}) {
  const {
    playback,
    setSoundscapeMasterVolume,
    setSoundscapeMuted,
    playScene,
    stopAll,
    canPlaySoundscape,
  } = useSceneAudio()

  const hasIdleStartable = slotIds.some((slotId) => {
    const tile = playback.soundscapes[slotId]
    if (tile?.playing || tile?.paused) {
      return false
    }
    return canPlaySoundscape(slotId)
  })
  const anyPlaying = slotIds.some((slotId) => playback.soundscapes[slotId]?.playing)
  const showStopScene = anyPlaying && !hasIdleStartable

  return (
    <Card className="mb-6 border-white/10">
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
        {showStopScene ? (
          <Button
            type="button"
            variant="outline"
            aria-label="Stop Scene"
            data-stop-scene
            onClick={() => {
              stopAll()
            }}
          >
            Stop Scene
          </Button>
        ) : (
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
        )}
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
  dragging,
  onRemove,
  onDragStart,
  onDrag,
  onDragEnd,
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
    hasLoadedSoundscapeTrack,
    setFocusedSoundscapeSlot,
  } = useSceneAudio()

  const tile = getSoundscapeTileState(slot.id)
  const playing = tile?.playing ?? false
  const paused = tile?.paused ?? false
  const progress = playing ? (tile?.progress ?? 0) : 0
  const trackName = tile?.trackName
  const intensity = slot.intensity ?? 'II'
  const volume = slot.volume ?? 100

  // Play requires a loaded (or paused) track; d20 rolls from the intensity pool.
  const playDisabled = !hasLoadedSoundscapeTrack(slot.id)
  const d20Disabled = !canPlaySoundscape(slot.id)

  return (
    <Card
      data-soundscape-category={categoryName}
      data-flip-id={slot.id}
      className={cn(
        'min-w-0 overflow-hidden border-white/10 transition-shadow',
        playing && !dragging && 'border-gold/60 shadow-[0_0_16px_rgba(212,175,55,0.35)]',
        dragging && 'opacity-0',
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardContent className="p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Tooltip content="Drag to reorder">
              <div
                draggable={!locked}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                aria-label="Drag to reorder"
                data-drag-handle
                className={cn(
                  'mt-1 cursor-grab active:cursor-grabbing',
                  locked && 'cursor-not-allowed opacity-40',
                )}
              >
                <GripVertical className="h-4 w-4 text-muted" />
              </div>
            </Tooltip>
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
            <Tooltip content={`Roll random track for ${categoryName}`}>
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
            </Tooltip>
            {playing ? (
              <Tooltip content={`Pause ${categoryName}`}>
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
              </Tooltip>
            ) : (
              <Tooltip content={`Play ${categoryName}`}>
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
              </Tooltip>
            )}
            <Tooltip content={`Remove ${categoryName}`}>
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
            </Tooltip>
          </div>
        </div>

        <div
          className="mb-4 h-1 overflow-hidden rounded bg-white/10"
          data-soundscape-progress={categoryName}
          aria-hidden="true"
        >
          <div
            className={cn('h-full bg-gold', playing ? 'opacity-100' : 'opacity-30')}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">Intensity</p>
          <div className="flex gap-2" data-soundscape-intensity={categoryName} data-state={intensity}>
            {INTENSITIES.map((level) => {
              const trackCount = slot.category?.levels?.[level]?.length ?? 0
              const enabled = trackCount > 0
              const levelHint = enabled
                ? trackCount === 1
                  ? '1 track'
                  : `${trackCount} tracks`
                : EMPTY_INTENSITY_LEVEL_HINT
              return (
                <Tooltip
                  key={level}
                  content={levelHint}
                  align={level === 'I' ? 'start' : level === 'III' ? 'end' : 'center'}
                >
                  <button
                    type="button"
                    aria-pressed={intensity === level}
                    aria-label={enabled ? `Intensity ${level}, ${levelHint}` : levelHint}
                    disabled={!enabled}
                    data-soundscape-intensity-level={`${categoryName}-${level}`}
                    className={cn(
                      'min-h-[44px] min-w-[44px] rounded border px-3 py-2 text-sm',
                      intensity === level ? 'border-gold text-gold' : 'border-white/20 text-muted',
                      !enabled && 'pointer-events-none cursor-not-allowed opacity-40',
                    )}
                    onClick={() => updateSlotIntensity(slot.id, level)}
                  >
                    {level}
                  </button>
                </Tooltip>
              )
            })}
          </div>
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
  const draggingIdRef = useRef<string | null>(null)
  const { beginCardDragPreview, moveCardDragPreview, endCardDragPreview } =
    useHtml5CardDragPreview()

  const sortedSlots = useMemo(() => [...slots].sort((a, b) => a.order - b.order), [slots])
  const sortedIds = useMemo(() => sortedSlots.map((slot) => slot.id), [sortedSlots])
  const sortedIdsRef = useRef(sortedIds)
  sortedIdsRef.current = sortedIds

  const clearDragging = useCallback(() => {
    draggingIdRef.current = null
    setDraggingId(null)
    endCardDragPreview()
  }, [endCardDragPreview])

  const tryLiveReorder = useCallback(
    (sourceId: string, overId: string, event: DragEvent<HTMLDivElement>) => {
      const card = event.currentTarget
      const next = reorderIdsForDragOver(
        sortedIdsRef.current,
        sourceId,
        overId,
        { x: event.clientX, y: event.clientY },
        card.getBoundingClientRect(),
        'xy',
      )
      if (!next) {
        return
      }
      reorderSoundscapeSlots(sceneId, next)
    },
    [reorderSoundscapeSlots, sceneId],
  )

  const listRef = useRef<HTMLDivElement | null>(null)
  useFlipReorderAnimation(listRef, [sortedIds.join('|')], {
    durationMs: 180,
    skipIds: draggingId,
  })

  return (
    <div data-soundscapes-tab>
      <SoundscapeMasterControls slotIds={sortedIds} />

      {sortedSlots.length === 0 ? (
        <p className="mb-6 text-center text-muted" data-soundscape-empty>
          No soundscape categories yet. Add one to begin layering ambience.
        </p>
      ) : (
        <div
          ref={listRef}
          className="mb-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
          data-soundscape-category-list
        >
          {sortedSlots.map((slot) => (
            <SoundscapeCategoryCard
              key={slot.id}
              slot={slot}
              locked={locked}
              dragging={draggingId === slot.id}
              onRemove={() => onRemoveSlot(slot.id)}
              onDragStart={(event) => {
                if (locked) {
                  event.preventDefault()
                  return
                }
                draggingIdRef.current = slot.id
                setDraggingId(slot.id)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', slot.id)
                const card = event.currentTarget.closest('[data-flip-id]')
                if (card instanceof HTMLElement) {
                  beginCardDragPreview(event, card)
                }
              }}
              onDrag={moveCardDragPreview}
              onDragEnd={clearDragging}
              onDragOver={(event) => {
                if (locked) {
                  return
                }
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                const sourceId = draggingIdRef.current || event.dataTransfer.getData('text/plain')
                if (!sourceId || sourceId === slot.id) {
                  return
                }
                tryLiveReorder(sourceId, slot.id, event)
              }}
              onDrop={(event) => {
                if (locked) {
                  return
                }
                event.preventDefault()
                clearDragging()
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
