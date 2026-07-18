import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, ShoppingCart } from 'lucide-react'
import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'
import {
  filterSoundscapeCategories,
  getCategorySampleTrack,
} from '@/lib/soundscapeStorage'
import { audioPreview } from '@/lib/audioPreview'
import { SoundscapePickerCard, SoundscapePickerCardSkeleton } from '@/components/active-scene/SoundscapePickerCard'
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

interface SoundscapePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: SoundscapeCategory[]
  tracks: SoundscapeTrack[]
  excludedCategoryIds: string[]
  loading?: boolean
  onAddSelected: (categoryIds: string[]) => void
}

const SC_TYPES: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'All Types' },
  { value: 'AMBIENCE', label: 'Ambience' },
  { value: 'WEATHER', label: 'Weather' },
  { value: 'INTERIOR', label: 'Interior' },
  { value: 'DUNGEON', label: 'Dungeon' },
  { value: 'NATURE', label: 'Nature' },
  { value: 'TOWN', label: 'Town' },
  { value: 'COMBAT', label: 'Combat' },
  { value: 'OTHER', label: 'Other' },
]

export function SoundscapePickerModal({
  open,
  onOpenChange,
  categories,
  tracks,
  excludedCategoryIds,
  loading = false,
  onAddSelected,
}: SoundscapePickerModalProps) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('ALL')
  const [sort, setSort] = useState<'recent' | 'name'>('recent')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setSelected([])
    }
  }, [open])

  const availableCategories = useMemo(() => {
    const excluded = new Set(excludedCategoryIds)
    return filterSoundscapeCategories(
      categories.filter((category) => !excluded.has(category.id)),
      { search, type, sort },
    )
  }, [categories, excludedCategoryIds, search, type, sort])

  const toggleSelected = (categoryId: string, checked: boolean) => {
    setSelected((current) => {
      if (checked) {
        return current.includes(categoryId) ? current : [...current, categoryId]
      }
      return current.filter((id) => id !== categoryId)
    })
  }

  const handlePreview = (category: SoundscapeCategory) => {
    const sampleTrack = getCategorySampleTrack(category, tracks)
    if (!sampleTrack) {
      return
    }
    const previewId = `sc-${category.id}-${sampleTrack.id}`
    if (audioPreview.getCurrentTrackId() === previewId && audioPreview.isPlaying()) {
      audioPreview.pause()
      return
    }
    audioPreview.play(previewId, sampleTrack.audioUrl, category.name)
  }

  const handleAdd = () => {
    onAddSelected([...selected])
    setSelected([])
  }

  const handleClose = () => {
    audioPreview.stop()
    setSelected([])
    onOpenChange(false)
  }

  const clearFilters = () => {
    setSearch('')
    setType('ALL')
    setSort('recent')
  }

  const activeCategories = categories.filter((category) => !category.deletedAt)
  const isEmptyLibrary = activeCategories.length === 0
  const isAllOnScene =
    activeCategories.length > 0 &&
    availableCategories.length === 0 &&
    !search &&
    type === 'ALL' &&
    excludedCategoryIds.length > 0

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent
        aria-labelledby="soundscape-picker-title"
        className="max-h-[90vh] max-w-4xl overflow-y-auto"
        data-soundscape-picker-modal
      >
        <DialogHeader>
          <button
            type="button"
            className="mb-2 text-left text-sm text-gold hover:underline"
            data-sc-picker-back
            onClick={handleClose}
          >
            ← Back to Active Scene
          </button>
          <DialogTitle id="soundscape-picker-title">Add Soundscape</DialogTitle>
          <p className="text-sm text-muted">Select soundscapes for this scene.</p>
        </DialogHeader>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" className="gap-2 text-gold" data-buy-composition>
            <ShoppingCart className="h-4 w-4" />
            Buy Composition
          </Button>
          <Button type="button" variant="ghost" className="gap-2" data-free-compositions>
            <ExternalLink className="h-4 w-4" />
            Free Compositions
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-3" data-sc-picker-filters>
            <div>
              <Label htmlFor="sc-picker-search">Search</Label>
              <Input
                id="sc-picker-search"
                placeholder="Search compositions…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                data-sc-picker-search
                data-picker-search
              />
            </div>
            <div>
              <Label htmlFor="sc-picker-type">Category Type</Label>
              <select
                id="sc-picker-type"
                className="h-10 w-full rounded-md border border-white/10 bg-charcoal px-3 text-sm"
                value={type}
                onChange={(event) => setType(event.target.value)}
                data-sc-picker-filter-type
              >
                {SC_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="sc-picker-sort">Sort Order</Label>
              <select
                id="sc-picker-sort"
                className="h-10 w-full rounded-md border border-white/10 bg-charcoal px-3 text-sm"
                value={sort}
                onChange={(event) => setSort(event.target.value as 'recent' | 'name')}
                data-sc-picker-filter-sort
              >
                <option value="recent">Recently Added</option>
                <option value="name">Name</option>
              </select>
            </div>
            <Button type="button" variant="ghost" data-sc-picker-clear-filters onClick={clearFilters}>
              Clear filters
            </Button>
          </aside>

          <div>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3" data-sc-picker-loading>
                <SoundscapePickerCardSkeleton />
                <SoundscapePickerCardSkeleton />
                <SoundscapePickerCardSkeleton />
              </div>
            ) : isEmptyLibrary ? (
              <div className="py-12 text-center" data-sc-picker-empty>
                <p className="mb-4 text-muted" data-empty-illustration>
                  No soundscape categories yet.
                </p>
              </div>
            ) : isAllOnScene ? (
              <p className="py-8 text-center text-muted" data-sc-picker-all-on-scene>
                All library categories are already on this scene.
              </p>
            ) : availableCategories.length === 0 ? (
              <div className="py-8 text-center text-muted" data-sc-picker-no-match>
                <p>No compositions match your filters</p>
                <button type="button" className="mt-2 text-gold hover:underline" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3" data-sc-picker-grid>
                {availableCategories.map((category) => (
                  <SoundscapePickerCard
                    key={category.id}
                    category={category}
                    checked={selected.includes(category.id)}
                    onCheck={(checked) => toggleSelected(category.id, checked)}
                    onPreview={() => handlePreview(category)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {!isEmptyLibrary && !isAllOnScene ? (
          <DialogFooter>
            <Button
              type="button"
              disabled={selected.length === 0}
              data-picker-commit
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
