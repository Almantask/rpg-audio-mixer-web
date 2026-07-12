import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { APP_VERSION, SUPPORT_COFFEE_URL, SUPPORT_REVIEW_URL } from '@/lib/constants'

export function CreditsPage() {
  const year = new Date().getFullYear()

  return (
    <section aria-labelledby="credits-heading">
      <h1 className="font-serif text-2xl text-gold" id="credits-heading">
        Credits
      </h1>
      <p className="mt-2 text-zinc-400">App info, support links, and legal.</p>

      <div className="mt-8">
        <h2 className="font-serif text-lg text-gold">Support</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-surface p-6">
            <p className="text-sm text-zinc-400">
              Support ongoing development, server costs, and new sound libraries.
            </p>
            <Button asChild className="mt-4" type="button">
              <a
                aria-label="Buy the Devs a Coffee (opens in new tab)"
                href={SUPPORT_COFFEE_URL}
                rel="noreferrer"
                target="_blank"
              >
                Buy the Devs a Coffee ☕
                <ExternalLink aria-hidden className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-surface p-6">
            <p className="text-sm text-zinc-400">Share feedback with other GMs.</p>
            <Button asChild className="mt-4" type="button" variant="outline">
              <a
                aria-label="Leave a Review (opens in new tab)"
                href={SUPPORT_REVIEW_URL}
                rel="noreferrer"
                target="_blank"
              >
                Leave a Review ✍️
                <ExternalLink aria-hidden className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-lg text-gold">Legal</h2>
        <ul className="mt-4 space-y-2">
          <li>
            <Link className="text-gold underline" to="/legal/terms">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link className="text-gold underline" to="/legal/privacy">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link className="text-gold underline" to="/credits/attributions">
              Attributions
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-12 text-sm text-zinc-500">
        © {year} Arcanum Audio. V {APP_VERSION}.
      </p>
    </section>
  )
}
