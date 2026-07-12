import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { CampaignWithSessionCount } from '@/lib/storage/types'
import { cn } from '@/lib/utils'

interface HomeCampaignHeroProps {
  campaign?: CampaignWithSessionCount | null
  sessionSubtitle?: string | null
  isLoading?: boolean
  isEmpty?: boolean
}

export function HomeCampaignHero({
  campaign,
  sessionSubtitle,
  isLoading = false,
  isEmpty = false,
}: HomeCampaignHeroProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-surface p-8" data-testid="home-campaign-hero">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <Skeleton className="mt-6 h-10 w-32" />
      </div>
    )
  }

  if (isEmpty || !campaign) {
    return (
      <div
        className="rounded-lg border border-zinc-800 bg-surface p-8 text-center"
        data-testid="home-campaign-hero"
      >
        <p className="mb-4 text-zinc-400">Create your first campaign</p>
        <Button asChild type="button">
          <Link to="/campaigns">Create your first campaign</Link>
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-zinc-800 bg-surface',
        'bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8',
      )}
      data-testid="home-campaign-hero"
      style={
        campaign.coverArtUrl
          ? {
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.45)), url(${campaign.coverArtUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <h3 className="font-serif text-2xl text-gold">{campaign.name}</h3>
      {sessionSubtitle ? (
        <p className="mt-2 text-sm text-zinc-300" data-testid="home-session-subtitle">
          {sessionSubtitle}
        </p>
      ) : null}
      <div className="mt-6">
        <Button asChild data-testid="home-resume-button" type="button">
          <Link to={`/campaigns/${campaign.id}/sessions`}>Resume</Link>
        </Button>
      </div>
    </div>
  )
}
