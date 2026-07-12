import { Plus } from 'lucide-react'

interface AddSessionCardProps {
  onClick: () => void
}

export function AddSessionCard({ onClick }: AddSessionCardProps) {
  return (
    <button
      aria-label="Add New Session"
      className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gold/50 bg-transparent px-6 py-8 text-gold transition-colors hover:bg-gold/5"
      data-testid="add-session-card"
      onClick={onClick}
      type="button"
    >
      <Plus aria-hidden="true" className="h-5 w-5" />
      <span className="font-medium">Add New Session</span>
    </button>
  )
}

export function SessionsEmptyState({ onAddSession }: { onAddSession: () => void }) {
  return (
    <div className="col-span-full py-12 text-center" data-testid="sessions-empty-state">
      <p className="text-4xl" role="img" aria-label="Empty sessions illustration">
        📜
      </p>
      <p className="mt-4 font-serif text-xl text-gold">No sessions yet</p>
      <button
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-black"
        onClick={onAddSession}
        type="button"
      >
        Add New Session
      </button>
    </div>
  )
}

export function SessionsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-full rounded-lg border border-red-900/50 bg-red-950/20 p-6 text-center" role="alert">
      <p className="text-red-200">Unable to load sessions.</p>
      <button
        className="mt-4 rounded-md border border-gold px-4 py-2 text-gold"
        onClick={onRetry}
        type="button"
      >
        Retry
      </button>
    </div>
  )
}

export function SessionCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="min-h-40 animate-pulse rounded-lg bg-zinc-800"
      data-testid="session-card-skeleton"
    />
  )
}

interface CampaignHeroBannerProps {
  name: string
  coverArtUrl?: string
  description?: string
}

export function CampaignHeroBanner({ name, coverArtUrl, description }: CampaignHeroBannerProps) {
  return (
    <div
      className="relative mb-8 overflow-hidden rounded-lg border border-zinc-800"
      data-testid="campaign-hero-banner"
    >
      <div className="relative h-40 bg-zinc-900">
        {coverArtUrl ? (
          <img alt="" className="h-full w-full object-cover" src={coverArtUrl} />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">{name}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        {description ? (
          <p className="absolute bottom-4 left-4 max-w-xl text-sm text-zinc-300">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
