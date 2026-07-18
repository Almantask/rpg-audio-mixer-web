import { useEffect, useState } from 'react'
import { Pause, Pencil, Play, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SoundscapeCategory } from '@/types/library'
import { useCampaignData } from '@/context/CampaignDataContext'
import { audioPreview } from '@/lib/audioPreview'
import { EMPTY_INTENSITY_LEVEL_HINT } from '@/lib/soundscapeStorage'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { SwipeToDelete } from '@/components/shared/SwipeToDelete'

const INTENSITY_LEVELS = ['I', 'II', 'III'] as const
type IntensityLevel = (typeof INTENSITY_LEVELS)[number]

interface SoundscapeCategoryCardProps {
  category: SoundscapeCategory
  onDelete: () => void
}

function firstTrackIdAtLevel(
  category: SoundscapeCategory,
  level: IntensityLevel,
): string | undefined {
  return category.levels?.[level]?.[0]
}

export function SoundscapeCategoryCard({ category, onDelete }: SoundscapeCategoryCardProps) {
  const navigate = useNavigate()
  const { data } = useCampaignData()
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)

  const levels = category.levels ?? { I: [], II: [], III: [] }
  const countsText = `I: ${levels.I?.length ?? 0} · II: ${levels.II?.length ?? 0} · III: ${levels.III?.length ?? 0}`
  const legacyPreviewLevel =
    INTENSITY_LEVELS.find((level) => (levels[level]?.length ?? 0) > 0) ?? 'I'
  const levelTrackIdsKey = INTENSITY_LEVELS.map((level) => (levels[level] ?? []).join(',')).join('|')

  useEffect(() => {
    return audioPreview.subscribe((trackId, _trackName, isPlaying) => {
      const levelTrackIds = new Set(levelTrackIdsKey.split('|').flatMap((part) => (part ? part.split(',') : [])))
      if (trackId && levelTrackIds.has(trackId) && isPlaying) {
        setPlayingTrackId(trackId)
        return
      }
      setPlayingTrackId((current) => (current === null ? current : null))
    })
  }, [levelTrackIdsKey])

  const handleCardClick = () => {
    navigate(`/library/soundscapes/${category.id}/compose`)
  }

  const handlePreviewLevel = (event: React.MouseEvent, level: IntensityLevel) => {
    event.stopPropagation()
    const trackId = firstTrackIdAtLevel(category, level)
    if (!trackId) return
    const track = data.soundscapeTracks?.find((item) => item.id === trackId)
    if (!track) return

    if (playingTrackId === trackId) {
      audioPreview.pause()
      return
    }
    audioPreview.play(trackId, track.audioUrl, track.name)
  }

  const isPlaying = playingTrackId !== null

  return (
    <SwipeToDelete onSwipeDelete={onDelete}>
      <Card
        data-sc-card={category.name}
        className={cn(
          'group relative z-0 cursor-pointer overflow-visible border border-parchment/10 bg-charcoal-elevated transition-all duration-300 hover:z-20 hover:-translate-y-0.5 hover:border-gold/50',
          isPlaying && 'z-20 border-gold ring-1 ring-gold/30',
        )}
        onClick={handleCardClick}
      >
        <CardContent className="overflow-visible p-0">
          <div
            className="relative flex min-h-[11.5rem] w-full flex-col items-center justify-center overflow-visible rounded-t-xl bg-gradient-to-br from-gold/20 via-charcoal to-charcoal"
            data-sc-card-thumb={category.name}
          >
            <div className="absolute inset-0 z-10 rounded-t-xl bg-gradient-to-t from-charcoal via-transparent to-transparent" />

            <div
              data-sc-card-preview-state={category.name}
              data-state={isPlaying ? 'playing' : 'idle'}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 overflow-visible bg-charcoal/35 px-3 py-3"
            >
              <div className="flex min-h-5 items-center justify-center">
                {isPlaying ? (
                  <span className="animate-pulse rounded-md bg-gold/90 px-2 py-0.5 text-[10px] font-bold text-charcoal">
                    ● PLAYING
                  </span>
                ) : null}
              </div>

              <div
                className="flex w-full max-w-[14rem] items-center justify-center gap-2"
                role="group"
                aria-label={`${category.name} intensity previews`}
              >
                {INTENSITY_LEVELS.map((level) => {
                  const trackId = firstTrackIdAtLevel(category, level)
                  const hasTracks = Boolean(trackId)
                  const levelPlaying = Boolean(trackId && playingTrackId === trackId)
                  const isLegacyPreviewTarget = level === legacyPreviewLevel
                  const emptyLevelHint = EMPTY_INTENSITY_LEVEL_HINT

                  const previewButton = (
                    <button
                      type="button"
                      data-sc-preview={isLegacyPreviewTarget ? category.name : undefined}
                      data-sc-preview-level={`${category.name}-${level}`}
                      disabled={!hasTracks}
                      onClick={(event) => handlePreviewLevel(event, level)}
                      className={cn(
                        'flex h-12 min-w-12 w-full flex-col items-center justify-center rounded-full border transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
                        hasTracks
                          ? 'border-gold/45 bg-gold text-charcoal hover:scale-105 hover:bg-gold-bright'
                          : 'pointer-events-none cursor-not-allowed border-white/10 bg-white/5 text-muted/50',
                        levelPlaying && 'ring-2 ring-gold-bright',
                      )}
                      aria-label={
                        !hasTracks
                          ? emptyLevelHint
                          : levelPlaying
                            ? `Pause ${category.name} level ${level}`
                            : `Preview ${category.name} level ${level}`
                      }
                      aria-pressed={levelPlaying}
                    >
                      {levelPlaying ? (
                        <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
                      ) : (
                        <span className="flex items-center gap-0.5 text-xs font-bold tracking-wide">
                          {hasTracks ? <Play className="h-3 w-3 fill-current" aria-hidden="true" /> : null}
                          {level}
                        </span>
                      )}
                    </button>
                  )

                  if (hasTracks) {
                    return (
                      <div key={level} className="flex-1">
                        {previewButton}
                      </div>
                    )
                  }

                  return (
                    <div key={level} className="group/empty relative z-30 flex-1">
                      {previewButton}
                      <span
                        role="tooltip"
                        className={cn(
                          'pointer-events-none absolute bottom-full z-50 mb-2 w-max max-w-[13.5rem] rounded-md border border-parchment/15 bg-ink-overlay px-2.5 py-2 text-center text-[11px] leading-snug text-parchment opacity-0 shadow-lg transition-opacity',
                          'group-hover/empty:opacity-100 group-focus-within/empty:opacity-100',
                          level === 'I' && 'left-0',
                          level === 'II' && 'left-1/2 -translate-x-1/2',
                          level === 'III' && 'right-0',
                        )}
                      >
                        {emptyLevelHint}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-parchment/70">
                Preview by intensity
              </p>
            </div>
          </div>

          <div className="px-3 py-2" data-sc-card-body={category.name}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  data-sc-card-title={category.name}
                  className="truncate font-serif text-base font-bold text-parchment transition-colors group-hover:text-gold"
                >
                  {category.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted" data-sc-card-meta>
                  {countsText}
                </p>
              </div>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  data-sc-edit={category.name}
                  onClick={(event) => {
                    event.stopPropagation()
                    navigate(`/library/soundscapes/${category.id}/compose`)
                  }}
                  className="rounded bg-white/5 p-1.5 text-muted hover:bg-white/10 hover:text-parchment"
                  aria-label="Edit Composition"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  data-sc-delete={category.name}
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete()
                  }}
                  className="rounded bg-white/5 p-1.5 text-muted hover:bg-red-500/20 hover:text-red-400"
                  aria-label="Delete Composition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </SwipeToDelete>
  )
}
