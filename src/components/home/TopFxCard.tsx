import { Link } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import type { FxTrack } from '@/types/library'
import { homePreview } from '@/lib/homePreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TopFxCardProps {
  track?: FxTrack
  playCount?: number
  previewBlocked?: boolean
  previewPlaying?: boolean
  previewProgress?: number
  onPreviewToggle?: () => void
  empty?: boolean
}

export function TopFxCard({
  track,
  playCount = 0,
  previewBlocked = false,
  previewPlaying = false,
  previewProgress = 0,
  onPreviewToggle,
  empty = false,
}: TopFxCardProps) {
  if (empty) {
    return (
      <section aria-label="Top FX" className="space-y-3">
        <h2 className="font-serif text-lg text-gold">Top FX</h2>
        <Card data-top-fx-card className="border-purple-500/40">
          <CardContent className="p-6">
            <p className="text-muted">No sound effects played yet</p>
            <Link
              to="/library?tab=sound-effects"
              className="mt-3 inline-block text-purple-400 underline"
              data-home-library-link="fx"
            >
              Library
            </Link>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!track) {
    return null
  }

  const sudden = track.baseIntensity === 'III'

  return (
    <section aria-label="Top FX" className="space-y-3">
      <h2 className="font-serif text-lg text-gold">Top FX</h2>
      <Card data-top-fx-card data-top-fx-name={track.name} className="border-purple-500/40">
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="truncate font-serif text-xl text-purple-300" title={track.name}>
              {track.name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded border border-purple-500/50 px-2 py-0.5 text-xs uppercase tracking-widest text-purple-300">
                FX
              </span>
              {sudden ? (
                <span className="rounded border border-purple-500/50 px-2 py-0.5 text-xs uppercase tracking-widest text-purple-300">
                  SUDDEN
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span
              className="rounded-full border border-purple-500/50 px-3 py-1 text-xs uppercase tracking-widest text-purple-300"
              data-home-play-count="fx"
            >
              {playCount} PLAYS
            </span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-11 w-11 rounded-full border-purple-500 text-purple-300"
              data-home-preview-fx
              data-home-preview
              aria-label={`Preview ${track.name}`}
              disabled={previewBlocked}
              onClick={onPreviewToggle}
            >
              {previewPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
          <div
            className="h-1 overflow-hidden rounded bg-white/10"
            data-home-preview-progress="fx"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(previewProgress * 100)}
            aria-label={`Preview progress for ${track.name}`}
          >
            <div
              className={cn(
                'h-full bg-purple-500 transition-all',
                previewPlaying ? 'opacity-100' : 'opacity-30',
              )}
              style={{ width: `${Math.round(previewProgress * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export function toggleTopFxPreview(track: FxTrack) {
  homePreview.toggleFx(track.id, track.audioUrl, track.name)
}
