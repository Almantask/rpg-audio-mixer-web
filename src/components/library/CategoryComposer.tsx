import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TrackPickerModal } from '@/components/library/TrackPickerModal'
import { db } from '@/lib/storage/db'
import {
  addTrackToLevel,
  getIntensityLevels,
  removeTrackFromLevel,
} from '@/lib/storage/soundscapeCategoryRepository'
import { getTrack, listTracks } from '@/lib/storage/trackRepository'
import type { IntensityLevelNumber } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

const LEVEL_LABELS: Record<IntensityLevelNumber, string> = {
  1: 'Level I',
  2: 'Level II',
  3: 'Level III',
}

interface CategoryComposerProps {
  categoryId: string
}

export function CategoryComposer({ categoryId }: CategoryComposerProps) {
  const navigate = useNavigate()
  const category = useLiveQuery(() => db.soundscapeCategories.get(categoryId), [categoryId])
  const levels = useLiveQuery(() => getIntensityLevels(categoryId), [categoryId])
  const tracks = useLiveQuery(() => listTracks(), [])

  const [expandedLevels, setExpandedLevels] = useState<Set<IntensityLevelNumber>>(new Set([1]))
  const [pickerLevel, setPickerLevel] = useState<IntensityLevelNumber | null>(null)

  if (!category || category.deletedAt) {
    return (
      <section>
        <p className="text-zinc-400">Category not found.</p>
        <Link className="text-gold underline" to="/library">
          ← Library
        </Link>
      </section>
    )
  }

  const toggleLevel = (level: IntensityLevelNumber) => {
    setExpandedLevels((current) => {
      const next = new Set(current)
      if (next.has(level)) {
        next.delete(level)
      } else {
        next.add(level)
      }
      return next
    })
  }

  const handleAddSelected = async (trackIds: string[]) => {
    if (!pickerLevel) return
    for (const trackId of trackIds) {
      await addTrackToLevel(categoryId, pickerLevel, trackId)
    }
    toast(`${trackIds.length} track${trackIds.length === 1 ? '' : 's'} added`)
  }

  const openPickerForLevel = (level: IntensityLevelNumber) => {
    setExpandedLevels((current) => new Set(current).add(level))
    setPickerLevel(level)
  }

  const handleRemoveTrack = async (level: IntensityLevelNumber, trackId: string) => {
    await removeTrackFromLevel(categoryId, level, trackId)
  }

  const handleSave = () => {
    toast('Composition saved')
  }

  const pickerLevelData = levels?.find((level) => level.level === pickerLevel)

  return (
    <section aria-labelledby="composer-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            className="text-sm text-gold"
            onClick={() => navigate('/library')}
            type="button"
          >
            ← Library
          </button>
          <h1 className="mt-2 font-serif text-2xl text-gold" id="composer-heading">
            {category.name}
          </h1>
          <p className="text-lg text-zinc-300">Category Composer</p>
          <p className="mt-1 text-zinc-400">
            Assign tracks to intensity levels for this category.
          </p>
        </div>
        <Button onClick={handleSave} type="button">
          Save Composition
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        {(levels ?? []).map((level) => {
          const isExpanded = expandedLevels.has(level.level)
          return (
            <div
              className="rounded-lg border border-zinc-800 bg-surface"
              data-expanded={isExpanded ? 'true' : 'false'}
              data-level={LEVEL_LABELS[level.level]}
              data-testid="intensity-level-row"
              key={level.id}
            >
              <button
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => toggleLevel(level.level)}
                type="button"
              >
                <span className="font-medium text-zinc-100">{LEVEL_LABELS[level.level]}</span>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  {!isExpanded ? (
                    <span>
                      {level.trackIds.length} track{level.trackIds.length === 1 ? '' : 's'}
                    </span>
                  ) : null}
                  {isExpanded ? (
                    <ChevronDown aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  )}
                </div>
              </button>

              {isExpanded ? (
                <div className="space-y-2 border-t border-zinc-800 px-4 py-3">
                  <Button
                    onClick={() => openPickerForLevel(level.level)}
                    type="button"
                    variant="outline"
                  >
                    Add track
                  </Button>
                  {level.trackIds.length === 0 ? null : (
                    <ul className="space-y-2">
                      {level.trackIds.map((trackId) => (
                        <LevelTrackRow
                          key={trackId}
                          onRemove={() => void handleRemoveTrack(level.level, trackId)}
                          trackId={trackId}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <TrackPickerModal
        attachedTrackIds={pickerLevelData?.trackIds ?? []}
        isLoading={tracks === undefined}
        levelLabel={pickerLevel ? LEVEL_LABELS[pickerLevel] : ''}
        onAddSelected={handleAddSelected}
        onOpenChange={(open) => {
          if (!open) setPickerLevel(null)
        }}
        open={pickerLevel !== null}
        tracks={tracks ?? []}
      />
    </section>
  )
}

function LevelTrackRow({ trackId, onRemove }: { trackId: string; onRemove: () => void }) {
  const track = useLiveQuery(() => getTrack(trackId), [trackId])
  if (!track) return null

  return (
    <li className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2">
      <div>
        <p className="text-zinc-100">{track.name}</p>
        <p className="text-xs text-zinc-500">
          {track.format} · {track.channel} · {track.duration}
        </p>
      </div>
      <Button
        aria-label={`Remove ${track.name}`}
        className={cn('text-zinc-400 hover:text-red-400')}
        onClick={onRemove}
        size="icon"
        type="button"
        variant="ghost"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </Button>
    </li>
  )
}
