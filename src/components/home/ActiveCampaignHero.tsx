import { Link, useNavigate } from 'react-router-dom'
import type { Campaign, Session } from '@/types/campaign'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActiveCampaignHeroProps {
  campaign?: Campaign
  session?: Session
  empty?: boolean
}

function sessionSubtitle(session: Session): string {
  const detail = session.description?.trim() || session.name
  return `Session ${session.number}: ${detail}`
}

export function ActiveCampaignHero({ campaign, session, empty = false }: ActiveCampaignHeroProps) {
  const navigate = useNavigate()

  if (empty || !campaign) {
    return (
      <section aria-label="Active Campaigns" className="space-y-3">
        <h2 className="font-serif text-lg text-gold">Active Campaigns</h2>
        <div
          data-testid="active-campaign-hero"
          className="flex flex-col items-center rounded-lg border border-gold/30 bg-charcoal-elevated p-8 text-center"
        >
          <p className="font-serif text-xl text-gold">Create your first campaign</p>
          <Button asChild className="mt-6" data-hero-create-campaign>
            <Link to="/campaigns">Create your first campaign</Link>
          </Button>
        </div>
      </section>
    )
  }

  const handleResume = () => {
    const hero = document.querySelector('[data-testid="active-campaign-hero"]')
    hero?.setAttribute('data-hero-expanding', 'true')
    window.setTimeout(() => {
      navigate(`/campaigns/${campaign.id}/sessions`)
    }, 150)
  }

  return (
    <section aria-label="Active Campaigns" className="space-y-3">
      <h2 className="font-serif text-lg text-gold">Active Campaigns</h2>
      <div
        data-testid="active-campaign-hero"
        data-hero-campaign={campaign.name}
        className={cn(
          'relative overflow-hidden rounded-lg border border-gold/30 bg-charcoal-elevated p-6 transition-all duration-300',
          'data-[hero-expanding=true]:fixed data-[hero-expanding=true]:inset-0 data-[hero-expanding=true]:z-40 data-[hero-expanding=true]:rounded-none',
        )}
      >
        {campaign.coverArtUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${campaign.coverArtUrl})` }}
          />
        ) : null}
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-serif text-2xl text-gold">{campaign.name}</h3>
            {session ? (
              <p className="mt-2 text-muted" data-hero-session-subtitle>
                {sessionSubtitle(session)}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            data-hero-resume
            aria-label="Resume"
            className="min-h-[44px] min-w-[44px]"
            onClick={handleResume}
          >
            Resume
          </Button>
        </div>
      </div>
    </section>
  )
}
