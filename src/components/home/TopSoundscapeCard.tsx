import { Link } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'
import { homePreview } from '@/lib/homePreview'
import { resolveCategoryPreviewTrackId } from '@/lib/playStats'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TopSoundscapeCardProps {
  category?: SoundscapeCategory
  track?: SoundscapeTrack
  playCount?: number
  previewBlocked?: boolean
  previewPlaying?: boolean
  previewProgress?: number
  onPreviewToggle?: () => void
  empty?: boolean
}

export function TopSoundscapeCard({
  category,
  track,
  playCount = 0,
  previewBlocked = false,
  previewPlaying = false,
  previewProgress = 0,
  onPreviewToggle,
  empty = false,
}: TopSoundscapeCardProps) {
  if (empty) {
    return (
      <section aria-label="Top Soundscape" className="space-y-3">
        <h2 className="font-serif text-lg text-gold">Top Soundscape</h2>
        <Card data-top-soundscape-card className="border-gold/30">
          <CardContent className="p-6">
            <p className="text-muted">No soundscapes played yet</p>
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
    <section aria-label="Top Soundscape" className="space-y-3">
      <h2 className="font-serif text-lg text-gold">Top Soundscape</h2>
      <Card data-top-soundscape-card data-top-soundscape-name={category.name} className="border-gold/30">
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="font-serif text-xl text-gold">{category.name}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded border border-gold/40 px-2 py-0.5 text-xs uppercase tracking-widest text-gold">
                SOUNDSCAPE
              </span>
              <span className="rounded border border-gold/40 px-2 py-0.5 text-xs uppercase tracking-widest text-gold">
                LOOPABLE
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span
              className="rounded-full border border-gold/40 px-3 py-1 text-xs uppercase tracking-widest text-gold"
              data-home-play-count="soundscape"
            >
              {playCount} PLAYS
            </span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-11 w-11 rounded-full border-gold text-gold"
              data-home-preview-soundscape
              data-home-preview
              aria-label={`Preview ${previewName}`}
              disabled={previewBlocked || !track}
              onClick={onPreviewToggle}
            >
              {previewPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
          <div
            className="h-1 overflow-hidden rounded bg-white/10"
            data-home-preview-progress="soundscape"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(previewProgress * 100)}
            aria-label={`Preview progress for ${category.name}`}
          >
            <div
              className={cn('h-full bg-gold transition-all', previewPlaying ? 'opacity-100' : 'opacity-30')}
              style={{ width: `${Math.round(previewProgress * 100)}%` }}
            />
          </div>
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
