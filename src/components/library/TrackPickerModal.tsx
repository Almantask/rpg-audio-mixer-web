import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LoadingSkeletonGroup } from '@/components/ui/skeleton'
import { startPreview, stopPreview } from '@/lib/audio/preview'
import { formatTrackMetadata, createTrack } from '@/lib/storage/trackRepository'
import type { Track } from '@/lib/storage/types'

interface TrackPickerModalProps {
  open: boolean
  levelLabel: string
  tracks: Track[]
  attachedTrackIds: string[]
  isLoading?: boolean
  onOpenChange: (open: boolean) => void
  onAddSelected: (trackIds: string[]) => Promise<void>
}

export function TrackPickerModal({
  open,
  levelLabel,
  tracks,
  attachedTrackIds,
  isLoading = false,
  onOpenChange,
  onAddSelected,
}: TrackPickerModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const availableTracks = useMemo(
    () => tracks.filter((track) => !attachedTrackIds.includes(track.id)),
    [tracks, attachedTrackIds],
  )

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return availableTracks
    return availableTracks.filter((track) => track.name.toLowerCase().includes(normalized))
  }, [availableTracks, search])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch('')
      setSelected([])
      setPreviewingId(null)
      stopPreview()
    }
    onOpenChange(nextOpen)
  }

  const toggleTrack = (trackId: string) => {
    setSelected((current) =>
      current.includes(trackId)
        ? current.filter((id) => id !== trackId)
        : [...current, trackId],
    )
  }

  const handlePreview = (track: Track) => {
    if (previewingId === track.id) {
      setPreviewingId(null)
      stopPreview()
      return
    }
    setPreviewingId(track.id)
    startPreview()
  }

  const handleAddSelected = async () => {
    await onAddSelected(selected)
    setSelected([])
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const track = await createTrack({
      name: file.name,
      fileName: file.name,
      format: file.name.split('.').pop()?.toUpperCase() ?? 'MP3',
    })
    setSelected((current) => [...current, track.id])
    event.target.value = ''
  }

  const noTracks = tracks.length === 0 && !isLoading
  const noMatches = filtered.length === 0 && search.trim().length > 0

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-2xl" data-testid="track-picker-modal">
        <DialogHeader>
          <button
            className="mb-2 text-left text-sm text-gold"
            onClick={() => handleOpenChange(false)}
            type="button"
          >
            ← Category Composer
          </button>
          <DialogTitle>Add track</DialogTitle>
          <p className="text-sm text-zinc-400">Add tracks to {levelLabel}.</p>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
            Import
          </Button>
          <input
            accept="audio/*"
            className="sr-only"
            onChange={(event) => void handleImport(event)}
            ref={fileInputRef}
            type="file"
          />
          <Input
            aria-label="Search tracks in picker"
            className="flex-1"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tracks…"
            value={search}
          />
        </div>

        {isLoading ? (
          <LoadingSkeletonGroup label="Loading tracks" />
        ) : noTracks ? (
          <p className="py-8 text-center text-zinc-400">
            No tracks in your library. Use Import to add audio files.
          </p>
        ) : noMatches ? (
          <div className="py-8 text-center">
            <p className="text-zinc-400">No tracks match your filters</p>
            <button
              className="mt-2 text-sm text-gold underline"
              onClick={() => setSearch('')}
              type="button"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2" data-testid="track-picker-grid">
            {filtered.map((track) => (
              <li
                className="rounded-md border border-zinc-800 p-3"
                data-previewing={previewingId === track.id ? 'true' : 'false'}
                data-track-name={track.name}
                key={track.id}
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={selected.includes(track.id)}
                    onChange={() => toggleTrack(track.id)}
                  />
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => handlePreview(track)}
                    type="button"
                  >
                    <p className="font-medium text-zinc-100">{track.name}</p>
                    <p className="text-xs text-zinc-500">{formatTrackMetadata(track)}</p>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!noTracks ? (
          <DialogFooter>
            <Button
              disabled={selected.length === 0}
              onClick={() => void handleAddSelected()}
              type="button"
            >
              Add Selected ({selected.length})
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
