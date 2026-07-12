import { GripVertical, Plus, Trash2 } from 'lucide-react'
import type { FxTrack } from '@/types/library'
import type { SceneSoundboardEntry } from '@/types/scene'
import { getHotkeyLabel } from '@/lib/sceneStorage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const MAX_TILES = 24

interface SoundboardTabProps {
  entries: Array<SceneSoundboardEntry & { track: FxTrack }>
  onRemove: (entryId: string) => void
  onAddSound: () => void
}

export function SoundboardTab({ entries, onRemove, onAddSound }: SoundboardTabProps) {
  const atCap = entries.length >= MAX_TILES
  const isEmpty = entries.length === 0

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
              defaultValue={85}
              className="flex-1"
              data-soundboard-master-slider
              aria-label="Soundboard Master volume"
            />
            <span className="text-sm text-muted">85%</span>
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" data-soundboard-grid>
        {entries.map((entry, index) => {
          const hotkey = getHotkeyLabel(index)
          return (
            <Card
              key={entry.id}
              data-soundboard-tile={entry.track.name}
              data-soundboard-tile-state={entry.track.name}
              data-state="idle"
              className="border-white/10"
            >
              <CardContent className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <GripVertical className="h-4 w-4 text-muted" aria-label="Drag handle" data-drag-handle />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${entry.track.name}`}
                    data-soundboard-delete={entry.track.name}
                    onClick={() => onRemove(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mb-2 text-center text-2xl" aria-hidden="true">
                  ♪
                </div>
                <p className="truncate text-center text-sm text-white">{entry.track.name}</p>
                {hotkey ? (
                  <p className="text-center text-xs text-muted" data-soundboard-hotkey={entry.track.name}>
                    {hotkey}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          )
        })}

        {!atCap ? (
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
