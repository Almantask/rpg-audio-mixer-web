import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PickerModal } from '@/components/shared/PickerModal'
import { StorefrontDialog } from '@/components/shared/StorefrontDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useSoundscapeCategories } from '@/hooks/useSoundscapeCategories'
import { startPreview, stopPreview } from '@/lib/audio/preview'
import {
  filterPickerCategories,
  getCategoryTrackStats,
} from '@/lib/library/soundscapePickerUtils'
import { seedDemoCategories } from '@/lib/storage/soundscapeCategoryRepository'
import type { SoundscapeCategoryWithCounts } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

interface SoundscapePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  excludedCategoryIds: string[]
  onAddSelected: (categories: SoundscapeCategoryWithCounts[]) => Promise<void>
}

export function SoundscapePickerModal({
  open,
  onOpenChange,
  excludedCategoryIds,
  onAddSelected,
}: SoundscapePickerModalProps) {
  const { categories, isLoading } = useSoundscapeCategories()
  const [search, setSearch] = useState('')
  const [categoryType, setCategoryType] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [storefrontOpen, setStorefrontOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const available = useMemo(
    () => categories.filter((category) => !excludedCategoryIds.includes(category.id)),
    [categories, excludedCategoryIds],
  )

  const filtered = useMemo(
    () =>
      filterPickerCategories(available, {
        search,
        categoryType,
      }),
    [available, search, categoryType],
  )

  const selectedCategories = useMemo(
    () =>
      selected
        .map((id) => categories.find((category) => category.id === id))
        .filter((category): category is SoundscapeCategoryWithCounts => Boolean(category)),
    [categories, selected],
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch('')
      setCategoryType('all')
      setSelected([])
      setPreviewingId(null)
      stopPreview()
    }
    onOpenChange(nextOpen)
  }

  const toggleCategory = (categoryId: string) => {
    setSelected((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    )
  }

  const handlePreview = (category: SoundscapeCategoryWithCounts) => {
    if (previewingId === category.id) {
      setPreviewingId(null)
      stopPreview()
      return
    }
    setPreviewingId(category.id)
    startPreview()
  }

  const handleAddSelected = async () => {
    if (selectedCategories.length === 0) return
    await onAddSelected(selectedCategories)
    toast(`${selectedCategories.length} categories added`)
    setSelected([])
  }

  const handleFreeCompositions = async () => {
    setDownloading(true)
    try {
      await seedDemoCategories()
    } finally {
      setDownloading(false)
    }
  }

  const showNoMatch = filtered.length === 0 && available.length > 0 && search.trim().length > 0
  const isEmptyLibrary = !isLoading && available.length === 0

  return (
    <>
      <PickerModal
        actionButtons={
          <>
            <Button onClick={() => setStorefrontOpen(true)} type="button">
              Buy Composition
            </Button>
            <Button disabled={downloading} onClick={() => void handleFreeCompositions()} type="button" variant="outline">
              Free Compositions
            </Button>
          </>
        }
        backLabel="Back to Active Scene"
        emptyState={
          isEmptyLibrary ? (
            <div className="py-8 text-center" data-testid="soundscape-picker-empty">
              <div aria-hidden="true" className="mx-auto mb-4 h-20 w-20 rounded-full bg-zinc-800" />
              <p className="text-zinc-500">Acquire compositions to add them to your scene.</p>
            </div>
          ) : undefined
        }
        filters={
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            Category Type
            <select
              aria-label="Category Type filter"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
              data-testid="picker-category-type-filter"
              onChange={(event) => setCategoryType(event.target.value)}
              value={categoryType}
            >
              <option value="all">All Types</option>
              <option value="Ambience">Ambience</option>
              <option value="Interior">Interior</option>
              <option value="Combat">Combat</option>
            </select>
          </label>
        }
        isLoading={isLoading}
        noMatchMessage="No compositions match your filters"
        onAddSelected={() => void handleAddSelected()}
        onClearFilters={() => setSearch('')}
        onOpenChange={handleOpenChange}
        onSearchChange={setSearch}
        open={open}
        searchPlaceholder="Search compositions…"
        searchValue={search}
        selectedCount={selected.length}
        showAddSelected={!isEmptyLibrary}
        showNoMatch={showNoMatch}
        subtitle="Select soundscapes for this scene."
        testId="soundscape-picker-modal"
        title="Add Soundscape"
      >
        <ul className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2">
          {filtered.map((category) => {
            const stats = getCategoryTrackStats(category)
            const isPreviewing = previewingId === category.id
            return (
              <li
                className={cn(
                  'rounded-md border border-zinc-800 p-3',
                  isPreviewing ? 'border-gold ring-1 ring-gold/40' : undefined,
                )}
                data-category-name={category.name}
                data-previewing={isPreviewing ? 'true' : 'false'}
                data-testid="soundscape-picker-card"
                key={category.id}
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    aria-label={`Select ${category.name}`}
                    checked={selected.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => handlePreview(category)}
                    type="button"
                  >
                    <p className="font-serif text-gold">{category.name}</p>
                    <p className="text-xs text-zinc-500">{stats.trackCount} tracks</p>
                    <p className="text-xs text-zinc-500">{stats.layerCount} layers</p>
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
      <StorefrontDialog onOpenChange={setStorefrontOpen} open={storefrontOpen} />
    </>
  )
}
