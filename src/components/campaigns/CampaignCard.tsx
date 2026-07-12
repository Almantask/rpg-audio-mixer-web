import { Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Campaign } from '@/types/campaign'
import { formatSessionCount } from '@/lib/campaignStorage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SwipeToDelete } from '@/components/shared/SwipeToDelete'

interface CampaignCardProps {
  campaign: Campaign
  sessionCount: number
  onDelete: () => void
  onOpen: () => void
}

export function CampaignCard({ campaign, sessionCount, onDelete, onOpen }: CampaignCardProps) {
  const navigate = useNavigate()
  const ctaLabel = sessionCount === 0 ? 'Start' : 'Resume'

  const handleOpen = () => {
    onOpen()
    navigate(`/campaigns/${campaign.id}/sessions`)
  }

  return (
    <SwipeToDelete onSwipeDelete={onDelete}>
      <Card data-campaign-card={campaign.name}>
        <CardContent className="flex items-center gap-4 p-4">
          <div
            aria-hidden="true"
            className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-charcoal"
          >
            {campaign.coverArtUrl ? (
              <img
                src={campaign.coverArtUrl}
                alt=""
                className="h-full w-full object-cover"
                data-campaign-cover={campaign.name}
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="font-serif text-lg text-gold"
              data-campaign-title={campaign.name}
            >
              {campaign.name}
            </h3>
            {campaign.description ? (
              <p
                className="mt-1 line-clamp-2 text-sm text-muted"
                data-campaign-description={campaign.name}
              >
                {campaign.description}
              </p>
            ) : null}
            <p
              className="mt-2 text-sm text-muted"
              data-campaign-session-count={campaign.name}
            >
              {formatSessionCount(sessionCount)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
              onClick={handleOpen}
            >
              {ctaLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </SwipeToDelete>
  )
}

export function CreateCampaignCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Create Campaign"
      data-testid="create-campaign-card"
      className="w-full rounded-lg border border-dashed border-gold/40 bg-transparent p-6 text-center transition-colors hover:border-gold/70"
      onClick={onClick}
    >
      <Plus className="mx-auto mb-2 h-6 w-6 text-gold" aria-hidden="true" />
      <span className="text-gold">Create Campaign</span>
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
    <Card aria-label="Loading campaign" data-testid="campaign-skeleton">
      <CardContent className="flex items-center gap-4 p-4">
        <SkeletonBlock className="h-20 w-20" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-5 w-1/2" />
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-4 w-1/4" />
        </div>
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
