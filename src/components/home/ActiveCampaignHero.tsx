import { Link, useNavigate } from 'react-router-dom'
import type { Campaign, Session } from '@/types/campaign'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatSessionContextLabel } from '@/lib/sessionTitle'

interface ActiveCampaignHeroProps {
  campaign?: Campaign
  session?: Session
  empty?: boolean
}

function sessionSubtitle(session: Session): string {
  if (session.description?.trim()) {
    return `Session ${session.number}: ${session.description.trim()}`
  }
  return formatSessionContextLabel(session)
}

export function ActiveCampaignHero({ campaign, session, empty = false }: ActiveCampaignHeroProps) {
  const navigate = useNavigate()

  if (empty || !campaign) {
    return (
      <section aria-label="Active Campaigns" className="w-full space-y-3">
        <h2 className="font-serif text-lg tracking-wide text-gold">Active Campaigns</h2>
        <div
          data-testid="active-campaign-hero"
          className="flex w-full flex-col items-center rounded-xl border border-gold/30 bg-charcoal-elevated p-8 text-center"
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
    <section aria-label="Active Campaigns" className="w-full space-y-3">
      <h2 className="font-serif text-lg tracking-wide text-gold">Active Campaigns</h2>
      <div
        data-testid="active-campaign-hero"
        data-hero-campaign={campaign.name}
        className={cn(
          'relative min-h-[13.5rem] w-full overflow-hidden rounded-xl border border-gold/25',
          'bg-gradient-to-br from-ink-overlay via-charcoal-elevated to-charcoal',
          'transition-all duration-300',
          'lg:min-h-[18rem] xl:min-h-[22rem]',
          'data-[hero-expanding=true]:fixed data-[hero-expanding=true]:inset-0 data-[hero-expanding=true]:z-40 data-[hero-expanding=true]:rounded-none',
        )}
      >
        {campaign.coverArtUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${campaign.coverArtUrl})` }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-violet/10"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/55 to-charcoal/30" />
        <div className="relative flex h-full min-h-[13.5rem] w-full flex-col justify-end gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-7 lg:min-h-[18rem] xl:min-h-[22rem]">
          <div className="min-w-0 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/90">
              Continue session
            </p>
            <h3 className="mt-2 font-serif text-3xl tracking-wide text-gold md:text-4xl xl:text-5xl">
              {campaign.name}
            </h3>
            {session ? (
              <p className="mt-2 max-w-3xl text-muted xl:text-lg" data-hero-session-subtitle>
                {sessionSubtitle(session)}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            data-hero-resume
            aria-label="Resume"
            className="min-h-11 min-w-[7rem] shrink-0"
            onClick={handleResume}
          >
            Resume
          </Button>
        </div>
      </div>
    </section>
  )
}
