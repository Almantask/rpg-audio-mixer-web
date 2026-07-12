import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pause, Play, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import type { CategoryPlaybackState } from '@/lib/audio'
import { getCategoryTrackCounts } from '@/lib/storage/sceneContentRepository'
import type { IntensityLevelNumber, SceneSoundscape } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

const LEVELS: IntensityLevelNumber[] = [1, 2, 3]
const LEVEL_LABELS: Record<IntensityLevelNumber, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
}

interface SoundscapeCategoryCardProps {
  item: SceneSoundscape
  playback?: CategoryPlaybackState
  sessionLocked: boolean
  canReorder: boolean
  onTogglePlayback: () => void
  onRoll: () => void
  onPause: () => void
  onIntensityChange: (level: IntensityLevelNumber) => void
  onVolumeChange: (volume: number) => void
  onRemove: () => void
}

function SoundscapeCategoryCardInner({
  item,
  playback,
  sessionLocked,
  canReorder,
  onTogglePlayback,
  onRoll,
  onPause,
  onIntensityChange,
  onVolumeChange,
  onRemove,
  dragHandleProps,
}: SoundscapeCategoryCardProps & {
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}) {
  const [trackCounts, setTrackCounts] = useState({ levelI: 0, levelII: 0, levelIII: 0, total: 0 })
  const isPlaying = playback?.status === 'playing'
  const hasLoadedTrack = Boolean(item.loadedTrackId || playback?.trackId)
  const playDisabled = !hasLoadedTrack

  useEffect(() => {
    void getCategoryTrackCounts(item.categoryId).then(setTrackCounts)
  }, [item.categoryId])

  const levelCounts: Record<IntensityLevelNumber, number> = {
    1: trackCounts.levelI,
    2: trackCounts.levelII,
    3: trackCounts.levelIII,
  }
  const poolCount = levelCounts[item.intensity]

  return (
    <article
      className={cn(
        'rounded-md border px-4 py-3 transition-shadow',
        isPlaying ? 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.35)]' : 'border-zinc-800',
      )}
      data-category-name={item.categoryName}
      data-playing={isPlaying ? 'true' : 'false'}
      data-testid="soundscape-category-card"
    >
      <div className="flex items-start gap-3">
        {canReorder ? (
          <button
            aria-label={`Drag ${item.categoryName}`}
            className="mt-1 cursor-grab text-zinc-500 active:cursor-grabbing"
            data-testid="category-drag-handle"
            type="button"
            {...dragHandleProps}
          >
            <GripVertical aria-hidden className="h-5 w-5" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gold">
                {item.categoryName} ({trackCounts.total} tracks)
              </p>
              <p className="mt-1 font-serif italic text-zinc-100" data-testid="category-track-name">
                {item.loadedTrackName ?? playback?.trackName ?? 'No track loaded'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                aria-label={`Roll random track for ${item.categoryName}`}
                data-testid="category-d20-button"
                disabled={poolCount === 0}
                onClick={onRoll}
                size="sm"
                type="button"
                variant="outline"
              >
                d20
              </Button>
              <Button
                aria-label={
                  isPlaying ? `Pause ${item.categoryName}` : `Play ${item.categoryName}`
                }
                aria-pressed={isPlaying}
                data-testid="category-play-button"
                disabled={playDisabled && !isPlaying}
                onClick={() => {
                  if (isPlaying) {
                    onPause()
                    return
                  }
                  onTogglePlayback()
                }}
                size="icon"
                type="button"
                variant="outline"
              >
                {isPlaying ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
              </Button>
              <Button
                aria-label={`Remove ${item.categoryName}`}
                disabled={sessionLocked}
                onClick={onRemove}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            aria-hidden={!isPlaying}
            aria-label={`${item.categoryName} playback progress`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round((playback?.progress ?? 0) * 100)}
            className="h-1 overflow-hidden rounded-full bg-zinc-800"
            data-testid="category-progress-bar"
            role="progressbar"
          >
            <div
              className={cn('h-full bg-gold transition-all', isPlaying ? 'animate-pulse' : '')}
              style={{ width: `${Math.round((playback?.progress ?? 0) * 100)}%` }}
            />
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Intensity</p>
            <div className="flex gap-2">
              {LEVELS.map((level) => {
                const disabled = levelCounts[level] === 0
                const selected = item.intensity === level
                return (
                  <button
                    aria-disabled={disabled}
                    aria-label={`Intensity Level ${LEVEL_LABELS[level]}`}
                    aria-pressed={selected}
                    className={cn(
                      'min-h-11 min-w-11 rounded border px-3 py-2 text-sm',
                      selected ? 'border-gold text-gold' : 'border-zinc-700 text-zinc-300',
                      disabled ? 'cursor-not-allowed opacity-40' : 'hover:border-gold/70',
                    )}
                    data-intensity-level={level}
                    data-unavailable={disabled ? 'true' : 'false'}
                    disabled={disabled}
                    key={level}
                    onClick={() => onIntensityChange(level)}
                    type="button"
                  >
                    {LEVEL_LABELS[level]}
                  </button>
                )
              })}
            </div>
          </div>

          <Slider
            aria-label={`${item.categoryName} volume`}
            aria-valuenow={item.volume}
            label="Volume"
            max={100}
            min={0}
            onChange={(event) => onVolumeChange(Number.parseInt(event.currentTarget.value, 10))}
            value={item.volume}
            valueLabel={`${item.volume}%`}
          />
        </div>
      </div>
    </article>
  )
}

function SortableSoundscapeCard(props: SoundscapeCategoryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.item.id,
    disabled: !props.canReorder,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SoundscapeCategoryCardInner
        {...props}
        dragHandleProps={props.canReorder ? listeners : undefined}
      />
    </div>
  )
}

interface SoundscapeCategoryListProps {
  items: SceneSoundscape[]
  sessionLocked: boolean
  getPlayback: (name: string) => CategoryPlaybackState | undefined
  onTogglePlayback: (item: SceneSoundscape) => void
  onRoll: (item: SceneSoundscape) => void
  onPause: (item: SceneSoundscape) => void
  onIntensityChange: (item: SceneSoundscape, level: IntensityLevelNumber) => void
  onVolumeChange: (item: SceneSoundscape, volume: number) => void
  onRemove: (item: SceneSoundscape) => void
  onReorder: (orderedIds: string[]) => void
}

export function SoundscapeCategoryList({
  items,
  sessionLocked,
  getPlayback,
  onTogglePlayback,
  onRoll,
  onPause,
  onIntensityChange,
  onVolumeChange,
  onRemove,
  onReorder,
}: SoundscapeCategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const canReorder = !sessionLocked && items.length > 1

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(items, oldIndex, newIndex)
    onReorder(next.map((item) => item.id))
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3" data-testid="soundscapes-list">
          {items.map((item) => (
            <SortableSoundscapeCard
              canReorder={canReorder}
              item={item}
              key={item.id}
              onIntensityChange={(level) => onIntensityChange(item, level)}
              onPause={() => onPause(item)}
              onRemove={() => onRemove(item)}
              onRoll={() => onRoll(item)}
              onTogglePlayback={() => onTogglePlayback(item)}
              onVolumeChange={(volume) => onVolumeChange(item, volume)}
              playback={getPlayback(item.categoryName)}
              sessionLocked={sessionLocked}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
