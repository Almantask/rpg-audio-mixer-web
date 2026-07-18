import { Coffee, ExternalLink, PenLine, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader, ScreenLandmark } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { APP_VERSION, DONATION_URL, REVIEW_URL } from '@/lib/creditsLinks'

function SectionHeading({ title, id }: { title: string; id?: string }) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <h2 id={id} className="shrink-0 font-serif text-xl text-white">
        {title}
      </h2>
      <div className="h-px flex-1 bg-white/10" aria-hidden="true" />
    </div>
  )
}

function openExternalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function CreditsPage() {
  const year = new Date().getFullYear()

  return (
    <ScreenLandmark screenName="Credits screen">
      <PageHeader title="Credits" />

      <section className="mb-10" aria-labelledby="credits-support-heading">
        <SectionHeading title="Support" id="credits-support-heading" />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Coffee className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-white">Support Development</h3>
                <p className="mt-2 text-sm text-muted">
                  Help cover server costs and fund new sound libraries for your table.
                </p>
              </div>
              <Button
                type="button"
                className="gap-2"
                data-buy-coffee
                aria-label="Buy the Devs a Coffee (opens in new tab)"
                onClick={() => openExternalUrl(DONATION_URL)}
              >
                Buy the Devs a Coffee
                <Coffee className="h-4 w-4" aria-hidden="true" />
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
                <Star className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-white">Leave a Review</h3>
                <p className="mt-2 text-sm text-muted">
                  Share feedback with other GMs and help Arcanum Audio reach more tables.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                data-leave-review
                aria-label="Leave a Review (opens in new tab)"
                onClick={() => openExternalUrl(REVIEW_URL)}
              >
                Leave a Review
                <PenLine className="h-4 w-4" aria-hidden="true" />
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="credits-legal-heading">
        <SectionHeading title="Legal" id="credits-legal-heading" />

        <nav aria-label="Legal links" className="flex flex-col gap-3">
          <Link
            to="/legal/terms"
            className="min-h-11 text-gold underline-offset-4 hover:underline"
          >
            Terms of Service
          </Link>
          <Link
            to="/legal/privacy"
            className="min-h-11 text-gold underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            to="/credits/attributions"
            className="min-h-11 text-gold underline-offset-4 hover:underline"
            data-legal-attributions
          >
            Attributions
          </Link>
        </nav>
      </section>

      <footer className="text-sm text-muted">
        © {year} Arcanum Audio. V {APP_VERSION}.
      </footer>
    </ScreenLandmark>
  )
}
