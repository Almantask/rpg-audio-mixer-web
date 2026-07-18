import { useEffect, useMemo, useState } from 'react'
import type { FxTrack } from '@/types/library'
import { filterFxTracks } from '@/lib/libraryStorage'
import { FxCard, FxCardSkeleton } from '@/components/library/FxCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FxPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tracks: FxTrack[]
  excludedTrackIds: string[]
  loading?: boolean
  onAddSelected: (trackIds: string[]) => void
}

export function FxPickerModal({
  open,
  onOpenChange,
  tracks,
  excludedTrackIds,
  loading = false,
  onAddSelected,
}: FxPickerModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setSelected([])
    }
  }, [open])

  const availableTracks = useMemo(() => {
    const excluded = new Set(excludedTrackIds)
    return filterFxTracks(
      tracks.filter((track) => !excluded.has(track.id)),
      { search, sort: 'recent' },
    )
  }, [tracks, excludedTrackIds, search])

  const toggleSelected = (trackId: string, checked: boolean) => {
    setSelected((current) => {
      if (checked) {
        return current.includes(trackId) ? current : [...current, trackId]
      }
      return current.filter((id) => id !== trackId)
    })
  }

  const handleAdd = () => {
    onAddSelected([...new Set(selected)])
    setSelected([])
  }

  const handleClose = () => {
    setSelected([])
    onOpenChange(false)
  }

  const clearFilters = () => {
    setSearch('')
  }

  const isEmptyLibrary = tracks.length === 0
  const isAllOnBoard = tracks.length > 0 && availableTracks.length === 0 && !search

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent
        aria-labelledby="fx-picker-title"
        className="max-h-[90vh] max-w-4xl overflow-y-auto"
        data-fx-picker-modal
      >
        <DialogHeader>
          <button
            type="button"
            className="mb-2 text-left text-sm text-gold hover:underline"
            data-fx-picker-back
            onClick={handleClose}
          >
            ← Back to Active Scene
          </button>
          <DialogTitle id="fx-picker-title">Sound Effects</DialogTitle>
          <p className="text-sm text-muted">Select effects for this scene&apos;s soundboard.</p>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-3" data-fx-picker-filters>
            <div>
              <Label htmlFor="fx-picker-search">Search</Label>
              <Input
                id="fx-picker-search"
                placeholder="Search effects…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                data-fx-picker-search
              />
            </div>
            <Button type="button" variant="ghost" data-fx-picker-clear-filters onClick={clearFilters}>
              Clear filters
            </Button>
          </aside>

          <div>
            {loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3" data-fx-picker-loading>
                <FxCardSkeleton />
                <FxCardSkeleton />
                <FxCardSkeleton />
              </div>
            ) : isEmptyLibrary ? (
              <p className="py-8 text-center text-muted" data-fx-picker-empty>
                Import or purchase tracks via Library — Sound Effects.
              </p>
            ) : isAllOnBoard ? (
              <p className="py-8 text-center text-muted" data-fx-picker-all-on-board>
                Every library FX is already on this soundboard.
              </p>
            ) : availableTracks.length === 0 ? (
              <div className="py-8 text-center text-muted" data-fx-picker-no-match>
                <p className="mb-4" data-fx-no-match>
                  No effects match your filters
                </p>
                <button type="button" className="mt-2 text-gold hover:underline" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3" data-fx-picker-grid>
                {availableTracks.map((track) => (
                  <FxCard
                    key={track.id}
                    track={track}
                    mode="picker"
                    checked={selected.includes(track.id)}
                    onCheck={(checked) => toggleSelected(track.id, checked)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {!isEmptyLibrary && !isAllOnBoard ? (
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={selected.length === 0}
              data-fx-picker-add-selected
              onClick={handleAdd}
            >
              Add Selected ({selected.length})
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
