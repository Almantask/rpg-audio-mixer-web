import { useEffect, useState } from 'react'
import { Pause, Play, Trash2 } from 'lucide-react'
import type { SoundscapeTrack } from '@/types/library'
import { formatFxDuration } from '@/lib/sceneStorage'
import { audioPreview } from '@/lib/audioPreview'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SoundscapeTrackCardProps {
  track: SoundscapeTrack
  onDelete?: () => void
}

function sourceCue(track: SoundscapeTrack): string {
  if (track.type === 'youtube-playlist') {
    return 'Playlist'
  }
  if (track.type === 'youtube') {
    return 'YouTube'
  }
  return 'Local'
}

function metaLine(track: SoundscapeTrack): string {
  const cue = sourceCue(track)
  const duration = formatFxDuration(track.durationSeconds)

  if (track.type === 'youtube-playlist') {
    const count = track.playlistVideos?.length ?? 0
    return `${cue} · ${count} videos`
  }

  if (track.type === 'youtube') {
    return `${cue} · ${duration}`
  }

  const format = track.format?.trim()
  return format ? `${cue} · ${duration} · ${format}` : `${cue} · ${duration}`
}

export function SoundscapeTrackCard({ track, onDelete }: SoundscapeTrackCardProps) {
  const [playing, setPlaying] = useState(false)
  const cue = sourceCue(track)

  useEffect(() => {
    return audioPreview.subscribe((trackId, _trackName, isPlaying) => {
      setPlaying(trackId === track.id && isPlaying)
    })
  }, [track.id])

  const handlePreview = () => {
    if (playing) {
      audioPreview.pause()
      return
    }
    audioPreview.play(track.id, track.audioUrl, track.name)
  }

  return (
    <Card
      data-testid="soundscape-track-card"
      data-track-card={track.name}
      data-track-card-preview-state={playing ? 'playing' : 'idle'}
      className={cn(
        'group min-w-0 overflow-hidden border-parchment/10 transition-all duration-200 hover:-translate-y-0.5',
        playing && 'border-gold ring-1 ring-gold/30',
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="shrink-0"
            onClick={handlePreview}
            aria-label={playing ? `Pause preview ${track.name}` : `Preview ${track.name}`}
            aria-pressed={playing}
            data-track-preview={track.name}
          >
            <span
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full transition-colors',
                playing
                  ? 'bg-gold text-charcoal ring-2 ring-gold/50'
                  : 'bg-gold/90 text-charcoal hover:bg-gold',
              )}
              aria-hidden="true"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className="truncate font-semibold text-parchment"
                  data-track-card-title={track.name}
                  title={track.name}
                >
                  {track.name}
                </p>
                <p className="mt-0.5 text-sm text-muted" data-track-card-meta>
                  {metaLine(track)}
                </p>
                <span className="sr-only" data-track-source-cue={cue.toLowerCase()}>
                  {cue} source
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted hover:bg-red-500/20 hover:text-red-400"
                aria-label={`Trash ${track.name}`}
                data-track-trash={track.name}
                onClick={() => onDelete?.()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SoundscapeTrackCardSkeleton() {
  return (
    <Card aria-label="Loading soundscape track" data-testid="track-skeleton" role="status">
      <CardContent className="space-y-3 p-3">
        <div className="flex gap-3">
          <div className="h-11 w-11 animate-pulse rounded-full bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
