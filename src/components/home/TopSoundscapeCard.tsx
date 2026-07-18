import { Link } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'
import { homePreview } from '@/lib/homePreview'
import { resolveCategoryPreviewTrackId } from '@/lib/playStats'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface TopSoundscapeCardProps {
  category?: SoundscapeCategory
  track?: SoundscapeTrack
  playCount?: number
  previewBlocked?: boolean
  previewPlaying?: boolean
  onPreviewToggle?: () => void
  empty?: boolean
  hideHeading?: boolean
}

export function TopSoundscapeCard({
  category,
  track,
  playCount = 0,
  previewBlocked = false,
  previewPlaying = false,
  onPreviewToggle,
  empty = false,
  hideHeading = false,
}: TopSoundscapeCardProps) {
  if (empty) {
    return (
      <section aria-label="Top Soundscape" className="min-w-0 w-full space-y-3">
        {hideHeading ? null : <h2 className="font-serif text-lg text-gold">Top Soundscape</h2>}
        <Card data-top-soundscape-card className="h-full min-h-[10rem] border-gold/30 bg-charcoal-elevated">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Top soundscape
            </p>
            <p className="mt-2 text-muted">No soundscapes played yet</p>
            <Link
              to="/library?tab=soundscapes"
              className="mt-3 inline-block text-gold underline"
              data-home-library-link="soundscape"
            >
              Library
            </Link>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!category) {
    return null
  }

  const previewName = track?.name ?? category.name

  return (
    <section aria-label="Top Soundscape" className="min-w-0 w-full space-y-3">
      {hideHeading ? null : <h2 className="font-serif text-lg text-gold">Top Soundscape</h2>}
      <Card
        data-top-soundscape-card
        data-top-soundscape-name={category.name}
        className="h-full min-h-[10rem] border-gold/30 bg-charcoal-elevated transition-transform duration-200 hover:-translate-y-0.5"
      >
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Top soundscape
            </p>
            <h3 className="font-serif text-2xl tracking-wide text-gold">{category.name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-gold/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-gold">
                SOUNDSCAPE
              </span>
              <span className="rounded-md border border-gold/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-gold">
                LOOPABLE
              </span>
              <span
                className="rounded-md border border-gold/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-gold"
                data-home-play-count="soundscape"
              >
                {playCount} PLAYS
              </span>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            className="h-12 w-12 shrink-0 rounded-full bg-gold text-charcoal hover:bg-gold-bright"
            data-home-preview-soundscape
            data-home-preview
            aria-label={`Preview ${previewName}`}
            disabled={previewBlocked || !track}
            onClick={onPreviewToggle}
          >
            {previewPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}

export function toggleTopSoundscapePreview(
  category: SoundscapeCategory,
  track: SoundscapeTrack | undefined,
) {
  if (!track) {
    return
  }
  homePreview.toggleSoundscape(category.id, track.audioUrl, track.name)
}

export function resolveTopSoundscapeTrack(
  category: SoundscapeCategory,
  tracks: SoundscapeTrack[],
): SoundscapeTrack | undefined {
  const trackId = resolveCategoryPreviewTrackId(category)
  if (!trackId) {
    return undefined
  }
  return tracks.find((item) => item.id === trackId)
}
