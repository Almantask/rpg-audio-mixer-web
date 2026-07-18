import { useEffect, useState } from 'react'
import { Pause, Play, Pencil, Trash2, X } from 'lucide-react'
import type { FxTrack } from '@/types/library'
import { formatFxDuration } from '@/lib/sceneStorage'
import { audioPreview } from '@/lib/audioPreview'
import {
  applyFxTagSuggestion,
  fxCompletedTags,
  fxTagInputFragment,
  parseFxTags,
} from '@/lib/parseFxTags'
import { cn } from '@/lib/utils'
import { FxTagList } from '@/components/library/FxTagList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FX_TAG_SUGGESTIONS = ['Combat', 'Impact', 'Creature', 'UI', 'Magic', 'Ambient', 'Other']

interface FxCardProps {
  track: FxTrack
  mode?: 'browse' | 'picker'
  checked?: boolean
  onCheck?: (checked: boolean) => void
  onUpdate?: (input: { name: string; tags: string[] }) => void
  onDelete?: () => void
}

export function FxCard({
  track,
  mode = 'browse',
  checked = false,
  onCheck,
  onUpdate,
  onDelete,
}: FxCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(track.name)
  const [tagInput, setTagInput] = useState(track.tags.join(', '))
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    return audioPreview.subscribe((trackId, _trackName, isPlaying) => {
      setPlaying(trackId === track.id && isPlaying)
    })
  }, [track.id])

  useEffect(() => {
    if (!editing) {
      setName(track.name)
      setTagInput(track.tags.join(', '))
    }
  }, [track.name, track.tags, editing])

  const handlePreview = () => {
    if (playing) {
      audioPreview.pause()
      return
    }
    audioPreview.play(track.id, track.audioUrl, track.name)
  }

  const handleCheckboxClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onCheck?.(!checked)
  }

  const openEdit = () => {
    setName(track.name)
    setTagInput(track.tags.join(', '))
    setEditing(true)
  }

  const saveEdit = () => {
    onUpdate?.({
      name: name.trim() || track.name,
      tags: parseFxTags(tagInput),
    })
    setEditing(false)
  }

  const cardAttrs =
    mode === 'picker' ? { 'data-fx-picker-item': track.name } : { 'data-fx-card': track.name }

  const previewStateAttr =
    mode === 'picker' ? 'data-fx-picker-preview-state' : 'data-fx-card-preview-state'

  const draftTags = parseFxTags(tagInput)
  const fragment = fxTagInputFragment(tagInput)
  const completedTags = fxCompletedTags(tagInput)
  const tagSuggestions = FX_TAG_SUGGESTIONS.filter(
    (tag) =>
      fragment.length > 0 &&
      tag.toLowerCase().includes(fragment.toLowerCase()) &&
      !completedTags.some((current) => current.toLowerCase() === tag.toLowerCase()),
  )

  const displayedTags = editing ? draftTags : track.tags

  return (
    <Card
      {...cardAttrs}
      className={cn(
        'group min-w-0 overflow-hidden transition-all duration-200 hover:-translate-y-0.5',
        playing ? 'border-violet ring-1 ring-violet/40' : 'border-parchment/10',
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="shrink-0"
            data-fx-card-thumb={mode === 'browse' ? track.name : undefined}
            onClick={handlePreview}
            aria-label={playing ? `Pause ${track.name}` : `Play ${track.name}`}
          >
            <span
              className="sr-only"
              {...{ [previewStateAttr]: track.name }}
              data-state={playing ? 'playing' : 'idle'}
            >
              {playing ? '● PLAYING' : '♪'}
            </span>
            <span
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full transition-colors',
                playing
                  ? 'bg-violet text-charcoal ring-2 ring-violet/50'
                  : 'bg-violet/90 text-charcoal hover:bg-violet',
              )}
              aria-hidden="true"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </span>
          </button>

          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            data-fx-card-body={mode === 'browse' ? track.name : undefined}
            data-fx-picker-body={mode === 'picker' ? track.name : undefined}
            onClick={handlePreview}
          >
            <p
              className="truncate font-semibold text-parchment"
              data-fx-card-title={mode === 'browse' ? track.name : undefined}
              title={track.name}
            >
              {track.name}
            </p>

            <p className="text-sm text-muted" data-fx-card-meta={mode === 'browse' ? true : undefined}>
              {formatFxDuration(track.durationSeconds)}
            </p>
          </button>

          {mode === 'picker' ? (
            <label className="mt-1 flex shrink-0 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onCheck?.(!checked)}
                onClick={handleCheckboxClick}
                data-fx-picker-check={track.id}
              />
              Select
            </label>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={`Edit ${track.name}`}
              data-fx-edit={track.name}
              onClick={() => {
                if (editing) {
                  setEditing(false)
                  return
                }
                openEdit()
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>

        <FxTagList tags={displayedTags} />

        {editing ? (
          <div className="mt-3 space-y-2 border-t border-white/10 pt-3" data-fx-inline-edit={track.name}>
            <div>
              <Label htmlFor={`fx-name-${track.id}`}>Name</Label>
              <Input
                id={`fx-name-${track.id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                data-fx-inline-name
              />
            </div>

            <div>
              <Label htmlFor={`fx-tags-${track.id}`}>Tags</Label>
              <div className="relative">
                <Input
                  id={`fx-tags-${track.id}`}
                  aria-label="FX tag"
                  placeholder="Combat, Creature, Magic"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  data-fx-tag-input
                />
                {tagSuggestions.length > 0 ? (
                  <ul className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-white/10 bg-charcoal-elevated">
                    {tagSuggestions.map((tag) => (
                      <li key={tag}>
                        <button
                          type="button"
                          role="option"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-white/5"
                          onClick={() => {
                            setTagInput(applyFxTagSuggestion(tagInput, tag))
                          }}
                        >
                          {tag}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted">Separate multiple tags with commas.</p>
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={saveEdit}>
                Save
              </Button>
              {onDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  data-fx-inline-delete={track.name}
                  onClick={onDelete}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function FxCardSkeleton() {
  return (
    <Card aria-label="Loading FX track" data-testid="fx-skeleton">
      <CardContent className="space-y-3 p-3">
        <div className="aspect-square animate-pulse rounded-md bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
      </CardContent>
    </Card>
  )
}

export function FxLibraryEmptyState() {
  return (
    <div className="col-span-full py-8 text-center" data-fx-library-empty>
      <p className="font-serif text-xl text-gold">No sound effects yet</p>
      <p className="mt-2 text-sm text-muted">
        Import your own tracks or download the free demo pack to get started.
      </p>
    </div>
  )
}

export function FxMiniPlayer() {
  const [trackId, setTrackId] = useState<string | null>(null)
  const [trackName, setTrackName] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [phase, setPhase] = useState<'enter' | 'exit'>('exit')

  useEffect(() => {
    return audioPreview.subscribe((id, name, isPlaying) => {
      setTrackId(id)
      setTrackName(name)
      setPlaying(isPlaying)
    })
  }, [])

  useEffect(() => {
    if (trackName) {
      setRendered(true)
      setPhase('enter')
      return
    }

    setPhase('exit')
    const timeout = window.setTimeout(() => setRendered(false), 180)
    return () => window.clearTimeout(timeout)
  }, [trackName])

  if (!rendered || !trackName) {
    return null
  }

  return (
    <div
      className={cn(
        'sticky bottom-0 mt-6 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-charcoal-elevated/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-[2px]',
        phase === 'enter' ? 'aa-mini-player-in' : 'aa-mini-player-out',
      )}
      data-mini-player
    >
      <span className="min-w-0 truncate" data-mini-player-track title={trackName}>
        {trackName}
      </span>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close mini player"
          data-mini-player-close
          onClick={() => audioPreview.stop()}
        >
          <X className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={playing ? 'Pause preview' : 'Play preview'}
          data-mini-player-pause={playing ? true : undefined}
          data-mini-player-play={playing ? undefined : true}
          onClick={() => {
            if (playing) {
              audioPreview.pause()
              return
            }
            if (trackId && trackName) {
              audioPreview.play(trackId, '', trackName)
            }
          }}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
