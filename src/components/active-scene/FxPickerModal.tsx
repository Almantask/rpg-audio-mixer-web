import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PickerModal } from '@/components/shared/PickerModal'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useFxTracks } from '@/hooks/useFxTracks'
import { startPreview, stopPreview } from '@/lib/audio/preview'
import { filterFxTracks, formatFxMetadata } from '@/lib/storage/fxTrackRepository'
import type { FxTrack, FxType, IntensityLevelNumber } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

interface FxPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  excludedFxTrackIds: string[]
  onAddSelected: (tracks: FxTrack[]) => Promise<void>
}

const FX_TYPES: FxType[] = ['IMPACT', 'COMBAT', 'CREATURE', 'UI', 'MAGIC', 'AMBIENCE']

export function FxPickerModal({
  open,
  onOpenChange,
  excludedFxTrackIds,
  onAddSelected,
}: FxPickerModalProps) {
  const { tracks, isLoading } = useFxTracks()
  const [search, setSearch] = useState('')
  const [fxType, setFxType] = useState<FxType | 'all'>('all')
  const [maxBaseIntensity, setMaxBaseIntensity] = useState<IntensityLevelNumber>(3)
  const [sortOrder, setSortOrder] = useState<'recently-added' | 'name-asc'>('recently-added')
  const [selected, setSelected] = useState<string[]>([])
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  const available = useMemo(
    () => tracks.filter((track) => !excludedFxTrackIds.includes(track.id)),
    [tracks, excludedFxTrackIds],
  )

  const filtered = useMemo(
    () =>
      filterFxTracks(available, {
        search,
        fxType,
        maxBaseIntensity,
        sortOrder,
      }),
    [available, search, fxType, maxBaseIntensity, sortOrder],
  )

  const selectedTracks = useMemo(
    () =>
      selected
        .map((id) => tracks.find((track) => track.id === id))
        .filter((track): track is FxTrack => Boolean(track)),
    [tracks, selected],
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch('')
      setFxType('all')
      setMaxBaseIntensity(3)
      setSortOrder('recently-added')
      setSelected([])
      setPreviewingId(null)
      stopPreview()
    }
    onOpenChange(nextOpen)
  }

  const toggleTrack = (trackId: string) => {
    setSelected((current) =>
      current.includes(trackId) ? current.filter((id) => id !== trackId) : [...current, trackId],
    )
  }

  const handlePreview = (track: FxTrack) => {
    if (previewingId === track.id) {
      setPreviewingId(null)
      stopPreview()
      return
    }
    setPreviewingId(track.id)
    startPreview()
  }

  const handleAddSelected = async () => {
    if (selectedTracks.length === 0) return
    await onAddSelected(selectedTracks)
    toast(`${selectedTracks.length} effects added`)
    setSelected([])
  }

  const showNoMatch = filtered.length === 0 && available.length > 0 && (search.trim().length > 0 || fxType !== 'all')
  const isEmptyLibrary = !isLoading && tracks.length === 0
  const allOnBoard = !isLoading && tracks.length > 0 && available.length === 0

  const emptyState =
    isEmptyLibrary || allOnBoard ? (
      <div className="py-8 text-center" data-testid="fx-picker-empty">
        {isEmptyLibrary ? (
          <p className="text-zinc-500">
            Import or purchase tracks via Library — Sound Effects.
          </p>
        ) : (
          <p className="text-zinc-500">All library effects are already on this soundboard.</p>
        )}
      </div>
    ) : undefined

  return (
    <PickerModal
      backLabel="Back to Active Scene"
      emptyState={emptyState}
      filters={
        <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
          <label className="flex items-center gap-2">
            FX Types
            <select
              aria-label="FX Types filter"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
              data-testid="picker-fx-type-filter"
              onChange={(event) => setFxType(event.target.value as FxType | 'all')}
              value={fxType}
            >
              <option value="all">All Types</option>
              {FX_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Base Intensity
            <select
              aria-label="Base Intensity filter"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
              data-testid="picker-base-intensity-filter"
              onChange={(event) =>
                setMaxBaseIntensity(Number.parseInt(event.target.value, 10) as IntensityLevelNumber)
              }
              value={maxBaseIntensity}
            >
              <option value={1}>I</option>
              <option value={2}>II</option>
              <option value={3}>III</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Sort Order
            <select
              aria-label="Sort Order filter"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
              data-testid="picker-sort-order-filter"
              onChange={(event) => setSortOrder(event.target.value as 'recently-added' | 'name-asc')}
              value={sortOrder}
            >
              <option value="recently-added">Recently Added</option>
              <option value="name-asc">Name A–Z</option>
            </select>
          </label>
        </div>
      }
      isLoading={isLoading}
      noMatchMessage="No effects match your filters"
      onAddSelected={() => void handleAddSelected()}
      onClearFilters={() => {
        setSearch('')
        setFxType('all')
        setMaxBaseIntensity(3)
      }}
      onOpenChange={handleOpenChange}
      onSearchChange={setSearch}
      open={open}
      searchPlaceholder="Search effects…"
      searchValue={search}
      selectedCount={selected.length}
      showAddSelected={!isEmptyLibrary && !allOnBoard && available.length > 0}
      showNoMatch={showNoMatch}
      subtitle="Select effects for this scene's soundboard."
      testId="fx-picker-modal"
      title="Sound Effects"
    >
      <ul className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2">
        {filtered.map((track) => {
          const isPreviewing = previewingId === track.id
          return (
            <li
              className={cn(
                'rounded-md border border-zinc-800 p-3',
                isPreviewing ? 'border-gold ring-1 ring-gold/40' : undefined,
              )}
              data-effect-name={track.name}
              data-previewing={isPreviewing ? 'true' : 'false'}
              data-testid="fx-picker-card"
              key={track.id}
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  aria-label={`Select ${track.name}`}
                  checked={selected.includes(track.id)}
                  onChange={() => toggleTrack(track.id)}
                />
                <button
                  className="min-w-0 flex-1 text-left"
                  data-testid="fx-picker-card-body"
                  onClick={() => handlePreview(track)}
                  type="button"
                >
                  <p className="font-medium text-zinc-100">{track.name}</p>
                  <p className="text-xs text-zinc-500">{formatFxMetadata(track)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline">{track.fxType}</Badge>
                    {track.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {isPreviewing ? (
                    <span className="text-xs font-medium text-gold">● PLAYING</span>
                  ) : null}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </PickerModal>
  )
}
