import { useCallback, useState, type DragEvent } from 'react'
import { GripVertical, Pause, Play, Plus, Trash2 } from 'lucide-react'
import type { FxTrack } from '@/types/library'
import type { SceneSoundboardEntry } from '@/types/scene'
import { useCampaignData } from '@/context/CampaignDataContext'
import { useSceneAudio } from '@/context/SceneAudioContext'
import { getHotkeyLabel } from '@/lib/sceneStorage'
import { cn } from '@/lib/utils'
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
  onPlay: () => void
  onStop: () => void
  onRemove: () => void
  onDragStart: (event: DragEvent<HTMLDivElement>) => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
}

function SoundboardTile({
  entry,
  hotkey,
  playing,
  locked,
  onPlay,
  onStop,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: SoundboardTileProps) {
  return (
    <Card
      data-soundboard-tile={entry.track.name}
      data-soundboard-tile-state={entry.track.name}
      data-state={playing ? 'playing' : 'idle'}
      className={cn(
        'min-w-0 overflow-hidden border-white/10 transition-shadow',
        playing && 'border-gold/60 shadow-[0_0_16px_rgba(212,175,55,0.35)]',
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div
            draggable={!locked}
            onDragStart={onDragStart}
            aria-label="Drag handle"
            data-drag-handle
            className={cn('cursor-grab', locked && 'cursor-not-allowed opacity-40')}
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
          {playing ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Stop ${entry.track.name}`}
              onClick={onStop}
            >
              <Pause className="h-4 w-4 text-gold" />
            </Button>
          ) : null}
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
  const { playback, triggerSoundboard, stopSoundboardFx, setSoundboardMasterVolume, isSoundboardPlaying } =
    useSceneAudio()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const atCap = entries.length >= MAX_TILES
  const isEmpty = entries.length === 0

  const reorderEntries = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) {
        return
      }
      const ids = entries.map((entry) => entry.id)
      const fromIndex = ids.indexOf(sourceId)
      const toIndex = ids.indexOf(targetId)
      if (fromIndex === -1 || toIndex === -1) {
        return
      }
      const next = [...ids]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      reorderSoundboardEntries(sceneId, next)
    },
    [entries, reorderSoundboardEntries, sceneId],
  )

  return (
    <div data-soundboard-tab>
      <Card className="mb-6 border-white/10">
        <CardContent className="p-4">
          <p className="mb-2 text-sm text-muted">Soundboard Master</p>
          <div className="flex items-center gap-3">
            <span aria-hidden="true">🔊</span>
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

      <div className="grid min-w-0 grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" data-soundboard-grid>
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
              onPlay={() => {
                void triggerSoundboard(entry)
              }}
              onStop={() => stopSoundboardFx(entry.fxTrackId)}
              onRemove={() => onRemove(entry.id)}
              onDragStart={(event) => {
                if (locked) {
                  event.preventDefault()
                  return
                }
                setDraggingId(entry.id)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', entry.id)
              }}
              onDragOver={(event) => {
                if (locked) {
                  return
                }
                event.preventDefault()
              }}
              onDrop={(event) => {
                if (locked) {
                  return
                }
                event.preventDefault()
                const sourceId = event.dataTransfer.getData('text/plain') || draggingId
                if (sourceId) {
                  reorderEntries(sourceId, entry.id)
                }
                setDraggingId(null)
              }}
            />
          )
        })}

        {!atCap && !locked ? (
          <button
            type="button"
            aria-label="Add Sound"
            data-soundboard-add="true"
            className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-gold/40 p-4 text-gold hover:border-gold/70"
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
