import { Link } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { SoundscapeCategoryWithCounts } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

interface TopSoundscapeCardProps {
  category?: (SoundscapeCategoryWithCounts & { playCount: number }) | null
  isLoading?: boolean
  showEmpty?: boolean
  previewDisabled?: boolean
  isPreviewing?: boolean
  isPaused?: boolean
  progress?: number
  onTogglePreview?: () => void
}

export function TopSoundscapeCard({
  category,
  isLoading = false,
  showEmpty = false,
  previewDisabled = false,
  isPreviewing = false,
  isPaused = false,
  progress = 0,
  onTogglePreview,
}: TopSoundscapeCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-surface p-6" data-testid="top-soundscape-card">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="mt-4 h-4 w-1/3" />
        <Skeleton className="mt-6 h-10 w-10 rounded-full" />
      </div>
    )
  }

  if (showEmpty || !category) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-surface p-6" data-testid="top-soundscape-card">
        <p className="text-zinc-400">No soundscapes played yet</p>
        <Link className="mt-2 inline-block text-sm text-gold underline" to="/library">
          Library
        </Link>
      </div>
    )
  }

  const playing = isPreviewing && !isPaused

  return (
    <div className="rounded-lg border border-gold/30 bg-surface p-6" data-testid="top-soundscape-card">
      <h3 className="font-serif text-xl text-gold">{category.name}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline">SOUNDSCAPE</Badge>
        <Badge variant="outline">LOOPABLE</Badge>
      </div>
      <p className="mt-3 inline-block rounded-full border border-gold/50 px-3 py-1 text-xs text-gold">
        {category.playCount} PLAYS
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Button
          aria-label={`Preview ${category.name}`}
          className="rounded-full"
          data-testid="top-soundscape-preview-button"
          disabled={previewDisabled}
          onClick={onTogglePreview}
          size="icon"
          type="button"
        >
          {playing ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
        </Button>
        <div
          aria-label={`${category.name} preview progress`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress * 100)}
          className={cn('h-1 flex-1 overflow-hidden rounded-full bg-zinc-800', !playing && 'opacity-40')}
          data-testid="top-soundscape-progress"
          role="progressbar"
        >
          <div className="h-full bg-gold transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>
    </div>
  )
}
