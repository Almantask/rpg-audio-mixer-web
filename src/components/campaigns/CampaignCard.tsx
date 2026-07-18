import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Campaign } from '@/types/campaign'
import { formatSessionCount } from '@/lib/campaignStorage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HeroCardSurface } from '@/components/shared/HeroCardSurface'
import { SwipeToDelete } from '@/components/shared/SwipeToDelete'

interface CampaignCardProps {
  campaign: Campaign
  sessionCount: number
  onDelete: () => void
  onOpen: () => void
  onEdit: () => void
}

export function CampaignCard({
  campaign,
  sessionCount,
  onDelete,
  onOpen,
  onEdit,
}: CampaignCardProps) {
  const navigate = useNavigate()
  const ctaLabel = sessionCount === 0 ? 'Start' : 'Resume'

  const handleOpen = () => {
    onOpen()
    navigate(`/campaigns/${campaign.id}/sessions`)
  }

  return (
    <SwipeToDelete onSwipeDelete={onDelete}>
      <HeroCardSurface
        data-campaign-card={campaign.name}
        coverArtUrl={campaign.coverArtUrl}
        coverProps={{ 'data-campaign-cover': campaign.name }}
      >
        <div className="flex h-full min-h-[9.5rem] w-full min-w-0 flex-col justify-end gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/90"
              data-campaign-session-count={campaign.name}
            >
              {formatSessionCount(sessionCount)}
            </p>
            <h3
              className="mt-2 break-words font-serif text-2xl tracking-wide text-gold sm:text-3xl"
              data-campaign-title={campaign.name}
            >
              {campaign.name}
            </h3>
            {campaign.description ? (
              <p
                className="mt-2 line-clamp-2 text-sm text-muted sm:text-base"
                data-campaign-description={campaign.name}
              >
                {campaign.description}
              </p>
            ) : null}
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <Button
              type="button"
              aria-label={`Edit ${campaign.name}`}
              variant="ghost"
              size="icon"
              data-edit-campaign={campaign.name}
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              aria-label={`Delete ${campaign.name}`}
              variant="ghost"
              size="icon"
              data-delete-campaign={campaign.name}
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              data-campaign-cta={campaign.name}
              className="min-h-11 min-w-[7rem] flex-1 sm:flex-none"
              onClick={handleOpen}
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </HeroCardSurface>
    </SwipeToDelete>
  )
}

export function CreateCampaignCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Create Campaign"
      data-testid="create-campaign-card"
      className="w-full rounded-xl border border-dashed border-gold/35 bg-charcoal-elevated/40 p-6 text-center transition-colors hover:border-gold/60 hover:bg-gold/5"
      onClick={onClick}
    >
      <Plus className="mx-auto mb-2 h-6 w-6 text-gold" aria-hidden="true" />
      <span className="font-medium text-gold">Create Campaign</span>
    </button>
  )
}

export function CampaignsEmptyState() {
  return (
    <div className="mb-6 text-center" data-testid="campaigns-empty-state">
      <p className="font-serif text-xl text-gold">No campaigns yet</p>
    </div>
  )
}

export function CampaignCardSkeleton() {
  return (
    <Card
      aria-label="Loading campaign"
      data-testid="campaign-skeleton"
      className="min-h-[9.5rem] overflow-hidden border-gold/25 bg-gradient-to-br from-ink-overlay via-charcoal-elevated to-charcoal"
    >
      <CardContent className="flex min-h-[9.5rem] flex-col justify-end gap-3 p-5">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-7 w-1/2" />
        <SkeletonBlock className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/10 ${className ?? ''}`} />
}

export function CampaignsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
      <p className="mb-4 text-white">Unable to load campaigns.</p>
      <Button type="button" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
