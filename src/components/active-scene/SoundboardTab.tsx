import { useCallback, useRef, useState, type DragEvent } from 'react'
import { GripVertical, Play, Plus, Square, Trash2 } from 'lucide-react'
import type { FxTrack } from '@/types/library'
import type { SceneSoundboardEntry } from '@/types/scene'
import { useCampaignData } from '@/context/CampaignDataContext'
import { useSceneAudio } from '@/context/SceneAudioContext'
import { reorderIdsForDragOver } from '@/lib/liveDragReorder'
import { getHotkeyLabel } from '@/lib/sceneStorage'
import { cn } from '@/lib/utils'
import { useFlipReorderAnimation } from '@/hooks/useFlipReorderAnimation'
import { useHtml5CardDragPreview } from '@/hooks/useHtml5CardDragPreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const MAX_TILES = 24

interface SoundboardTabProps {
  sceneId: string
  entries: Array<SceneSoundboardEntry & { track: FxTrack }>
  onRemove: (entryId: string) => void
  onAddSound: () => void
  locked?: boolean
}

interface SoundboardTileProps {
  entry: SceneSoundboardEntry & { track: FxTrack }
  hotkey?: string
  playing: boolean
  locked: boolean
  dragging: boolean
  onPlay: () => void
  onRemove: () => void
  onDragStart: (event: DragEvent<HTMLDivElement>) => void
  onDrag: (event: DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
}

function SoundboardTile({
  entry,
  hotkey,
  playing,
  locked,
  dragging,
  onPlay,
  onRemove,
  onDragStart,
  onDrag,
  onDragEnd,
  onDragOver,
  onDrop,
}: SoundboardTileProps) {
  return (
    <Card
      data-soundboard-tile={entry.track.name}
      data-flip-id={entry.id}
      data-soundboard-tile-state={entry.track.name}
      data-state={playing ? 'playing' : 'idle'}
      className={cn(
        'min-w-0 overflow-hidden border-white/10 transition-shadow',
        playing && !dragging && 'border-gold/60 shadow-[0_0_16px_rgba(212,175,55,0.35)]',
        dragging && 'opacity-0',
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div
            draggable={!locked}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
            aria-label="Drag handle"
            data-drag-handle
            className={cn(
              'cursor-grab active:cursor-grabbing',
              locked && 'cursor-not-allowed opacity-40',
            )}
          >
            <GripVertical className="h-4 w-4 text-muted" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${entry.track.name}`}
            data-soundboard-delete={entry.track.name}
            disabled={locked}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-2 flex w-full min-w-0 flex-col items-center overflow-hidden" role="presentation">
          <button
            type="button"
            className="mb-2 flex w-full min-w-0 flex-col items-center overflow-hidden"
            aria-label={`Play ${entry.track.name}`}
            onClick={onPlay}
          >
            <span className="mb-2 text-center text-2xl" aria-hidden="true">
              {playing ? (
                <span className="mx-auto block h-6 w-6 rounded-full bg-gold/20" />
              ) : (
                <Play className="mx-auto h-6 w-6 text-muted" />
              )}
            </span>
            <p
              className="w-full min-w-0 truncate text-center text-sm text-white"
              title={entry.track.name}
            >
              {entry.track.name}
            </p>
          </button>
        </div>
        {hotkey ? (
          <p className="text-center text-xs text-muted" data-soundboard-hotkey={entry.track.name}>
            {hotkey}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function SoundboardTab({ sceneId, entries, onRemove, onAddSound, locked = false }: SoundboardTabProps) {
  const { reorderSoundboardEntries } = useCampaignData()
  const {
    playback,
    triggerSoundboard,
    setSoundboardMasterVolume,
    isSoundboardPlaying,
    stopAll,
  } = useSceneAudio()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const draggingIdRef = useRef<string | null>(null)
  const entryIdsRef = useRef(entries.map((entry) => entry.id))
  entryIdsRef.current = entries.map((entry) => entry.id)
  const { beginCardDragPreview, moveCardDragPreview, endCardDragPreview } =
    useHtml5CardDragPreview()
  const gridRef = useRef<HTMLDivElement | null>(null)
  useFlipReorderAnimation(gridRef, [entries.map((entry) => entry.id).join('|')], {
    durationMs: 180,
    skipIds: draggingId,
  })

  const atCap = entries.length >= MAX_TILES
  const isEmpty = entries.length === 0

  const clearDragging = useCallback(() => {
    draggingIdRef.current = null
    setDraggingId(null)
    endCardDragPreview()
  }, [endCardDragPreview])

  const tryLiveReorder = useCallback(
    (sourceId: string, overId: string, event: DragEvent<HTMLDivElement>) => {
      const next = reorderIdsForDragOver(
        entryIdsRef.current,
        sourceId,
        overId,
        { x: event.clientX, y: event.clientY },
        event.currentTarget.getBoundingClientRect(),
        'xy',
      )
      if (!next) {
        return
      }
      reorderSoundboardEntries(sceneId, next)
    },
    [reorderSoundboardEntries, sceneId],
  )

  return (
    <div data-soundboard-tab>
      <Card className="mb-6 border-white/10">
        <CardContent className="p-4">
          <p className="mb-2 text-sm text-muted">Soundboard Master</p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              data-stop-all
              aria-label="Stop All"
              className="h-9 shrink-0 px-3"
              onClick={stopAll}
            >
              <Square className="mr-2 h-3.5 w-3.5" />
              Stop All
            </Button>
            <input
              type="range"
              min={0}
              max={100}
              value={playback.soundboardMasterVolume}
              className="flex-1"
              data-soundboard-master-slider
              aria-label="Soundboard Master volume"
              onChange={(event) => setSoundboardMasterVolume(Number(event.target.value))}
            />
            <span className="text-sm text-muted">{playback.soundboardMasterVolume}%</span>
          </div>
        </CardContent>
      </Card>

      <h3 className="mb-4 font-serif text-lg text-gold">Soundboard</h3>

      {atCap ? (
        <p className="mb-4 text-sm text-muted" data-soundboard-full-message>
          Board full — remove an effect to add more.
        </p>
      ) : null}

      {isEmpty ? (
        <p className="mb-4 text-center text-muted" data-soundboard-empty>
          No effects on the soundboard yet.
        </p>
      ) : null}

      <div
        ref={gridRef}
        className="grid min-w-0 grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        data-soundboard-grid
      >
        {entries.map((entry, index) => {
          const hotkey = getHotkeyLabel(index)
          const playing = isSoundboardPlaying(entry.fxTrackId)
          return (
            <SoundboardTile
              key={entry.id}
              entry={entry}
              hotkey={hotkey}
              playing={playing}
              locked={locked}
              dragging={draggingId === entry.id}
              onPlay={() => {
                void triggerSoundboard(entry)
              }}
              onRemove={() => onRemove(entry.id)}
              onDragStart={(event) => {
                if (locked) {
                  event.preventDefault()
                  return
                }
                draggingIdRef.current = entry.id
                setDraggingId(entry.id)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', entry.id)
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
                if (!sourceId || sourceId === entry.id) {
                  return
                }
                tryLiveReorder(sourceId, entry.id, event)
              }}
              onDrop={(event) => {
                if (locked) {
                  return
                }
                event.preventDefault()
                clearDragging()
              }}
            />
          )
        })}

        {!atCap ? (
          <button
            type="button"
            aria-label="Add Sound"
            data-soundboard-add="true"
            disabled={locked}
            className={cn(
              'flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-gold/40 p-4 text-gold hover:border-gold/70',
              locked && 'cursor-not-allowed opacity-40',
            )}
            onClick={onAddSound}
          >
            <Plus className="mb-2 h-6 w-6" />
            Add Sound
          </button>
        ) : null}
      </div>
    </div>
  )
}
