import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@/types/campaign'
import { formatSessionDate } from '@/lib/dateFormat'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SwipeToDelete } from '@/components/shared/SwipeToDelete'

interface SessionCardProps {
  session: Session
  campaignId: string
  showLastActive: boolean
  onEdit: () => void
  onDelete: () => void
  onOpen: () => void
}

export function SessionCard({
  session,
  campaignId,
  showLastActive,
  onEdit,
  onDelete,
  onOpen,
}: SessionCardProps) {
  const navigate = useNavigate()
  const sessionLabel = `Session ${session.number}`

  const handleOpen = () => {
    onOpen()
    navigate(`/campaigns/${campaignId}/sessions/${session.id}/scenes`)
  }

  return (
    <SwipeToDelete onSwipeDelete={onDelete}>
      <Card data-session-card={sessionLabel}>
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gold" data-session-number={sessionLabel}>
                {sessionLabel}
              </span>
              {showLastActive ? (
                <Badge data-last-active={sessionLabel}>Last Active</Badge>
              ) : null}
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Edit ${sessionLabel}`}
                data-edit-session={sessionLabel}
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit()
                }}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete ${sessionLabel}`}
                data-delete-session={sessionLabel}
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-start gap-3 text-left"
            data-session-body={sessionLabel}
            onClick={handleOpen}
          >
            <div
              aria-hidden="true"
              className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-charcoal"
            >
              {session.coverArtUrl ? (
                <img src={session.coverArtUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white" data-session-name={sessionLabel}>
                {session.name}
              </p>
              <p className="mt-1 text-sm text-muted" data-session-metadata={sessionLabel}>
                {formatSessionDate(session.date)} · {session.sceneCount} Scenes
              </p>
              {session.description ? (
                <p className="mt-2 line-clamp-2 text-sm italic text-muted">
                  {session.description}
                </p>
              ) : null}
            </div>
          </button>
        </CardContent>
      </Card>
    </SwipeToDelete>
  )
}

export function AddNewSessionCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Add New Session"
      data-testid="add-new-session-card"
      className="w-full rounded-lg border border-dashed border-gold/40 bg-transparent p-6 text-center transition-colors hover:border-gold/70"
      onClick={onClick}
    >
      <Plus className="mx-auto mb-2 h-6 w-6 text-gold" aria-hidden="true" />
      <span className="text-gold">Add New Session</span>
    </button>
  )
}

export function SessionsEmptyState() {
  return (
    <div className="col-span-full mb-4 text-center" data-testid="sessions-empty-state">
      <p className="text-muted">No sessions yet — add your first play night.</p>
    </div>
  )
}

export function SessionCardSkeleton() {
  return (
    <Card aria-label="Loading session" data-testid="session-skeleton">
      <CardContent className="space-y-3 p-4">
        <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
      </CardContent>
    </Card>
  )
}

export function CampaignHeroBanner({
  coverArtUrl,
  campaignName,
  description,
  onEdit,
}: {
  coverArtUrl?: string
  campaignName: string
  description?: string
  onEdit: () => void
}) {
  return (
    <div
      aria-label="Campaign hero banner"
      data-testid="campaign-hero-banner"
      className="mb-8 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {description?.trim() ? (
            <p className="text-sm text-muted" data-campaign-sessions-description>
              {description}
            </p>
          ) : (
            <button
              type="button"
              className="text-left text-sm text-muted/80 underline-offset-2 hover:text-parchment hover:underline"
              onClick={onEdit}
              data-campaign-sessions-add-description
            >
              Add a description
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Edit ${campaignName}`}
          data-edit-campaign-sessions={campaignName}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {coverArtUrl ? (
        <button
          type="button"
          aria-label={`Change cover art for ${campaignName}`}
          data-campaign-cover-art={campaignName}
          className="block w-full overflow-hidden rounded-lg border border-white/10"
          onClick={onEdit}
        >
          <img
            src={coverArtUrl}
            alt={`${campaignName} cover art`}
            className="h-40 w-full object-cover"
          />
        </button>
      ) : (
        <button
          type="button"
          aria-label="Add cover art"
          data-add-campaign-cover-art
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gold/40 bg-charcoal-elevated/60 text-muted transition-colors hover:border-gold/60 hover:bg-gold/5 hover:text-gold"
          onClick={onEdit}
        >
          <ImagePlus className="h-7 w-7" aria-hidden="true" />
          <span className="text-sm font-medium">Add cover art</span>
        </button>
      )}
    </div>
  )
}
