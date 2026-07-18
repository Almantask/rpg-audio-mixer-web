import { Link } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import type { FxTrack } from '@/types/library'
import { homePreview } from '@/lib/homePreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface TopFxCardProps {
  track?: FxTrack
  playCount?: number
  previewBlocked?: boolean
  previewPlaying?: boolean
  onPreviewToggle?: () => void
  empty?: boolean
  hideHeading?: boolean
}

export function TopFxCard({
  track,
  playCount = 0,
  previewBlocked = false,
  previewPlaying = false,
  onPreviewToggle,
  empty = false,
  hideHeading = false,
}: TopFxCardProps) {
  if (empty) {
    return (
      <section aria-label="Top FX" className="min-w-0 w-full space-y-3">
        {hideHeading ? null : <h2 className="font-serif text-lg text-gold">Top FX</h2>}
        <Card data-top-fx-card className="h-full min-h-[10rem] border-violet/40 bg-charcoal-elevated">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Top FX</p>
            <p className="mt-2 text-muted">No sound effects played yet</p>
            <Link
              to="/library?tab=sound-effects"
              className="mt-3 inline-block text-violet underline"
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
    <section aria-label="Top FX" className="min-w-0 w-full space-y-3">
      {hideHeading ? null : <h2 className="font-serif text-lg text-gold">Top FX</h2>}
      <Card
        data-top-fx-card
        data-top-fx-name={track.name}
        className="h-full min-h-[10rem] border-violet/40 bg-charcoal-elevated transition-transform duration-200 hover:-translate-y-0.5"
      >
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Top FX</p>
            <h3 className="truncate font-serif text-2xl tracking-wide text-violet" title={track.name}>
              {track.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-violet/50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-violet">
                FX
              </span>
              {sudden ? (
                <span className="rounded-md border border-violet/50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-violet">
                  SUDDEN
                </span>
              ) : null}
              <span
                className="rounded-md border border-violet/50 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-violet"
                data-home-play-count="fx"
              >
                {playCount} PLAYS
              </span>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            className="h-12 w-12 shrink-0 rounded-full bg-violet text-charcoal hover:bg-violet/90"
            data-home-preview-fx
            data-home-preview
            aria-label={`Preview ${track.name}`}
            disabled={previewBlocked}
            onClick={onPreviewToggle}
          >
            {previewPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}

export function toggleTopFxPreview(track: FxTrack) {
  homePreview.toggleFx(track.id, track.audioUrl, track.name)
}
