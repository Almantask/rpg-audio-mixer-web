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
  rectSortingStrategy,
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pause, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatEffectHotkey } from '@/lib/storage/sceneContentRepository'
import type { SceneEffect } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

interface SoundboardEffectTileProps {
  effect: SceneEffect
  playing: boolean
  sessionLocked: boolean
  canReorder: boolean
  onTrigger: () => void
  onStop: () => void
  onRemove: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}

function SoundboardEffectTileInner({
  effect,
  playing,
  sessionLocked,
  canReorder,
  onTrigger,
  onStop,
  onRemove,
  dragHandleProps,
}: SoundboardEffectTileProps) {
  const hotkey = formatEffectHotkey(effect.sortOrder)

  return (
    <article
      className={cn(
        'relative flex min-h-28 flex-col rounded-md border px-3 py-3 transition-shadow',
        playing ? 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.35)]' : 'border-zinc-800',
      )}
      data-effect-name={effect.name}
      data-playing={playing ? 'true' : 'false'}
      data-testid="soundboard-effect-tile"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        {canReorder ? (
          <button
            aria-label={`Drag ${effect.name}`}
            className="cursor-grab text-zinc-500 active:cursor-grabbing"
            data-testid="effect-drag-handle"
            type="button"
            {...dragHandleProps}
          >
            <GripVertical aria-hidden className="h-4 w-4" />
          </button>
        ) : (
          <span className="w-4" />
        )}
        <Button
          aria-label={`Remove ${effect.name}`}
          className="ml-auto"
          disabled={sessionLocked}
          onClick={onRemove}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 aria-hidden className="h-4 w-4" />
        </Button>
      </div>

      <button
        aria-label={playing ? `Retrigger ${effect.name}` : `Play ${effect.name}`}
        className="flex flex-1 flex-col items-center justify-center gap-2 text-center"
        data-testid="effect-tile-body"
        onClick={onTrigger}
        type="button"
      >
        <span className="text-zinc-100">{effect.name}</span>
        {hotkey ? (
          <span className="text-xs text-zinc-500" data-testid="effect-hotkey">
            {hotkey}
          </span>
        ) : null}
        {playing ? (
          <Pause aria-hidden className="h-4 w-4 text-gold" data-testid="effect-pause-icon" />
        ) : (
          <Play aria-hidden className="h-4 w-4 text-zinc-500" data-testid="effect-play-icon" />
        )}
      </button>

      {playing ? (
        <Button
          aria-label={`Stop all ${effect.name} instances`}
          className="absolute right-2 top-2"
          onClick={(event) => {
            event.stopPropagation()
            onStop()
          }}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Pause aria-hidden className="h-4 w-4" />
        </Button>
      ) : null}
    </article>
  )
}

function SortableEffectTile(props: SoundboardEffectTileProps & { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
    disabled: !props.canReorder,
  })

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes}>
      <SoundboardEffectTileInner {...props} dragHandleProps={props.canReorder ? listeners : undefined} />
    </div>
  )
}

interface SoundboardGridProps {
  effects: SceneEffect[]
  sessionLocked: boolean
  isEffectPlaying: (name: string) => boolean
  onTrigger: (effect: SceneEffect) => void
  onStop: (name: string) => void
  onRemove: (effect: SceneEffect) => void
  onReorder: (orderedIds: string[]) => void
}

export function SoundboardGrid({
  effects,
  sessionLocked,
  isEffectPlaying,
  onTrigger,
  onStop,
  onRemove,
  onReorder,
}: SoundboardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const canReorder = !sessionLocked && effects.length > 1

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = effects.findIndex((item) => item.id === active.id)
    const newIndex = effects.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(effects, oldIndex, newIndex)
    onReorder(next.map((item) => item.id))
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
      <SortableContext items={effects.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="soundboard-grid">
          {effects.map((effect) => (
            <SortableEffectTile
              canReorder={canReorder}
              effect={effect}
              id={effect.id}
              key={effect.id}
              onRemove={() => onRemove(effect)}
              onStop={() => onStop(effect.name)}
              onTrigger={() => onTrigger(effect)}
              playing={isEffectPlaying(effect.name)}
              sessionLocked={sessionLocked}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
