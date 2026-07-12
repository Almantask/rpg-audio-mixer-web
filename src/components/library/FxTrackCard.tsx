import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatFxMetadata } from '@/lib/storage/fxTrackRepository'
import type { FxTrack } from '@/lib/storage/types'
import { PREDEFINED_FX_TAGS } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

interface FxTrackCardProps {
  track: FxTrack
  isPreviewing?: boolean
  onPreview: (track: FxTrack) => void
  onStopPreview: () => void
  onSave: (trackId: string, input: { name: string; tags: string[] }) => Promise<void>
  onDelete: (track: FxTrack) => Promise<void>
}

export function FxTrackCard({
  track,
  isPreviewing = false,
  onPreview,
  onStopPreview,
  onSave,
  onDelete,
}: FxTrackCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(track.name)
  const [tags, setTags] = useState(track.tags.join(', '))

  const handlePreviewClick = () => {
    if (isPreviewing) {
      onStopPreview()
      return
    }
    onPreview(track)
  }

  const handleSave = async () => {
    const nextTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    await onSave(track.id, { name: name.trim() || track.name, tags: nextTags })
    setEditing(false)
  }

  const togglePredefinedTag = (tag: string) => {
    const current = tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const next = current.includes(tag)
      ? current.filter((item) => item !== tag)
      : [...current, tag]
    setTags(next.join(', '))
  }

  if (editing) {
    return (
      <article
        className="rounded-lg border border-gold/40 bg-surface p-4"
        data-effect-name={track.name}
        data-testid="fx-track-card"
      >
        <label className="block text-sm text-zinc-400">
          Name
          <Input className="mt-1" onChange={(event) => setName(event.target.value)} value={name} />
        </label>
        <label className="mt-3 block text-sm text-zinc-400">
          Tags
          <Input className="mt-1" onChange={(event) => setTags(event.target.value)} value={tags} />
        </label>
        <div className="mt-2 flex flex-wrap gap-1">
          {PREDEFINED_FX_TAGS.map((tag) => (
            <button
              className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300"
              key={tag}
              onClick={() => togglePredefinedTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => void handleSave()} size="sm" type="button">
            Save
          </Button>
          <Button
            onClick={() => void onDelete(track)}
            size="sm"
            type="button"
            variant="destructive"
          >
            Delete
          </Button>
          <Button onClick={() => setEditing(false)} size="sm" type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'rounded-lg border border-zinc-800 bg-surface p-4',
        isPreviewing ? 'border-gold ring-1 ring-gold/40' : undefined,
      )}
      data-effect-name={track.name}
      data-testid="fx-track-card"
    >
      <button
        aria-label={`Preview ${track.name} thumbnail`}
        className="relative mb-3 flex h-20 w-full items-center justify-center rounded-md bg-zinc-900"
        data-testid="fx-track-thumbnail"
        onClick={handlePreviewClick}
        type="button"
      >
        {isPreviewing ? (
          <span className="absolute left-2 top-2 text-xs font-medium text-gold">● PLAYING</span>
        ) : null}
        <span aria-hidden="true" className="text-2xl">
          🔊
        </span>
      </button>

      <button className="w-full text-left" data-testid="fx-track-body" onClick={handlePreviewClick} type="button">
        <h3 className="font-medium text-zinc-100">{track.name}</h3>
        <p className="mt-1 text-sm text-zinc-400">{formatFxMetadata(track)}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {track.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </button>

      <div className="mt-3">
        <Button
          aria-label={`Edit ${track.name}`}
          onClick={() => setEditing(true)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Button
          aria-label={`Delete ${track.name}`}
          className="text-zinc-400 hover:text-red-400"
          onClick={() => setEditing(true)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </article>
  )
}

export function FxGridSkeleton() {
  return (
    <div
      aria-label="Loading FX tracks"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="fx-grid-skeleton"
      role="status"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="h-44 animate-pulse rounded-lg bg-zinc-800" key={index} />
      ))}
    </div>
  )
}

export function FxEmptyState() {
  return (
    <div className="py-8 text-center" data-testid="fx-empty-state">
      <div
        aria-hidden="true"
        className="mx-auto mb-4 h-20 w-20 rounded-full bg-zinc-800"
        data-testid="fx-empty-illustration"
      />
      <p className="text-zinc-500">Import or download FX tracks to build your library.</p>
    </div>
  )
}
