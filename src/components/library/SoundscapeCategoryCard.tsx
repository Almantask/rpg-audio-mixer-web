import { Pencil, Play, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useSwipeRight } from '@/hooks/useSwipeRight'
import { getCategoryComposerPath } from '@/lib/storage/db'
import { formatIntensityBreakdown } from '@/lib/storage/soundscapeCategoryRepository'
import type { SoundscapeCategoryWithCounts } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

interface SoundscapeCategoryCardProps {
  category: SoundscapeCategoryWithCounts
  isPreviewing?: boolean
  onDelete: (category: SoundscapeCategoryWithCounts) => void
  onPreview: (category: SoundscapeCategoryWithCounts) => void
  onStopPreview: () => void
}

export function SoundscapeCategoryCard({
  category,
  isPreviewing = false,
  onDelete,
  onPreview,
  onStopPreview,
}: SoundscapeCategoryCardProps) {
  const navigate = useNavigate()
  const { swipeHandlers } = useSwipeRight(() => onDelete(category))

  const openComposer = () => {
    navigate(getCategoryComposerPath(category.id))
  }

  const handlePreview = () => {
    if (isPreviewing) {
      onStopPreview()
      return
    }
    onPreview(category)
  }

  return (
    <article
      className={cn(
        'rounded-lg border border-zinc-800 bg-surface p-4',
        isPreviewing ? 'border-gold ring-1 ring-gold/40' : undefined,
      )}
      data-category-name={category.name}
      data-testid="soundscape-category-card"
      {...swipeHandlers}
    >
      <div className="relative mb-3 flex h-20 items-center justify-center rounded-md bg-zinc-900">
        {isPreviewing ? (
          <span className="absolute left-2 top-2 text-xs font-medium text-gold">● PLAYING</span>
        ) : null}
        <span aria-hidden="true" className="text-2xl">
          🎵
        </span>
      </div>

      <button className="w-full text-left" onClick={openComposer} type="button">
        <h3 className="font-serif text-lg text-gold">{category.name}</h3>
        <p className="mt-1 text-sm text-zinc-400">{formatIntensityBreakdown(category)}</p>
      </button>

      <div className="mt-3 flex items-center gap-1">
        <Button
          aria-label={`Preview ${category.name}`}
          onClick={handlePreview}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Play aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Button
          aria-label={`Edit ${category.name}`}
          onClick={openComposer}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Button
          aria-label={`Delete ${category.name}`}
          className="text-zinc-400 hover:text-red-400"
          onClick={() => onDelete(category)}
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

export function AddSoundscapeCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 p-4 text-zinc-400 transition-colors hover:border-gold/40 hover:text-gold"
      data-testid="add-soundscape-card"
      onClick={onClick}
      type="button"
    >
      <span className="text-2xl">+</span>
      <span className="mt-2 text-sm">Add Soundscape</span>
    </button>
  )
}

export function SoundscapeGridSkeleton() {
  return (
    <div
      aria-label="Loading soundscape categories"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="h-44 animate-pulse rounded-lg bg-zinc-800" key={index} />
      ))}
    </div>
  )
}

export function SoundscapesEmptyState() {
  return (
    <div className="py-8 text-center" data-testid="soundscapes-empty-state">
      <div
        aria-hidden="true"
        className="mx-auto mb-4 h-20 w-20 rounded-full bg-zinc-800"
        data-testid="soundscapes-empty-illustration"
      />
      <p className="text-zinc-500">Create your first soundscape category to get started.</p>
    </div>
  )
}
