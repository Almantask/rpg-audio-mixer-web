import { Link } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { FxTrack } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

interface TopFxCardProps {
  track?: (FxTrack & { playCount: number }) | null
  isLoading?: boolean
  showEmpty?: boolean
  previewDisabled?: boolean
  isPreviewing?: boolean
  isPaused?: boolean
  progress?: number
  onTogglePreview?: () => void
}

export function TopFxCard({
  track,
  isLoading = false,
  showEmpty = false,
  previewDisabled = false,
  isPreviewing = false,
  isPaused = false,
  progress = 0,
  onTogglePreview,
}: TopFxCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-surface p-6" data-testid="top-fx-card">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="mt-4 h-4 w-1/3" />
        <Skeleton className="mt-6 h-10 w-10 rounded-full" />
      </div>
    )
  }

  if (showEmpty || !track) {
    return (
      <div className="rounded-lg border border-purple-500/30 bg-surface p-6" data-testid="top-fx-card">
        <p className="text-zinc-400">No sound effects played yet</p>
        <Link className="mt-2 inline-block text-sm text-purple-400 underline" to="/library">
          Library
        </Link>
      </div>
    )
  }

  const playing = isPreviewing && !isPaused

  return (
    <div className="rounded-lg border border-purple-500/30 bg-surface p-6" data-testid="top-fx-card">
      <h3 className="font-serif text-xl text-zinc-100">{track.name}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge className="border-purple-500 text-purple-300" variant="outline">
          FX
        </Badge>
        <Badge className="border-purple-500 text-purple-300" variant="outline">
          SUDDEN
        </Badge>
      </div>
      <p className="mt-3 inline-block rounded-full border border-purple-500/50 px-3 py-1 text-xs text-purple-300">
        {track.playCount} PLAYS
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Button
          aria-label={`Preview ${track.name}`}
          className="rounded-full border-purple-500 text-purple-300 hover:bg-purple-500/10"
          data-testid="top-fx-preview-button"
          disabled={previewDisabled}
          onClick={onTogglePreview}
          size="icon"
          type="button"
          variant="outline"
        >
          {playing ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
        </Button>
        <div
          aria-label={`${track.name} preview progress`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress * 100)}
          className={cn('h-1 flex-1 overflow-hidden rounded-full bg-zinc-800', !playing && 'opacity-40')}
          data-testid="top-fx-progress"
          role="progressbar"
        >
          <div
            className="h-full bg-purple-500 transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
