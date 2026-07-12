import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatSessionCount } from '@/lib/format'
import { getCampaignSessionsPath } from '@/lib/storage/db'
import { touchCampaignPlayed } from '@/lib/storage/campaignRepository'
import type { CampaignWithSessionCount } from '@/lib/storage/types'
import { useSwipeRight } from '@/hooks/useSwipeRight'

interface CampaignCardProps {
  campaign: CampaignWithSessionCount
  onDelete: (campaign: CampaignWithSessionCount) => void
}

export function CampaignCard({ campaign, onDelete }: CampaignCardProps) {
  const navigate = useNavigate()
  const ctaLabel = campaign.sessionCount > 0 ? 'Resume' : 'Start'
  const { swipeHandlers } = useSwipeRight(() => onDelete(campaign))

  const openSessions = async () => {
    await touchCampaignPlayed(campaign.id)
    navigate(getCampaignSessionsPath(campaign.id))
  }

  return (
    <article
      aria-label={`${campaign.name} campaign card`}
      className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-surface p-4"
      data-campaign-name={campaign.name}
      data-testid="campaign-card"
      {...swipeHandlers}
    >
      <div
        aria-hidden={!campaign.coverArtUrl}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-900"
      >
        {campaign.coverArtUrl ? (
          <img alt="" className="h-full w-full object-cover" src={campaign.coverArtUrl} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
            Cover
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate font-serif text-lg text-gold">{campaign.name}</h2>
        {campaign.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{campaign.description}</p>
        ) : null}
        <p className="mt-2 text-sm text-zinc-500">{formatSessionCount(campaign.sessionCount)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          aria-label={`${ctaLabel} ${campaign.name}`}
          onClick={() => void openSessions()}
          type="button"
        >
          {ctaLabel}
        </Button>
        <Button
          aria-label={`Delete ${campaign.name}`}
          className="text-zinc-400 hover:text-red-400"
          onClick={() => onDelete(campaign)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </article>
  )
}

export function CampaignCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-28 animate-pulse rounded-lg bg-zinc-800"
      data-testid="campaign-card-skeleton"
    />
  )
}
