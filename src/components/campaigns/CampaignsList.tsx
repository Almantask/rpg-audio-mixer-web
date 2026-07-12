import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CreateCampaignCardProps {
  onClick: () => void
}

export function CreateCampaignCard({ onClick }: CreateCampaignCardProps) {
  return (
    <button
      aria-label="Create Campaign"
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gold/50 bg-transparent px-6 py-8 text-gold transition-colors hover:bg-gold/5"
      data-testid="create-campaign-card"
      onClick={onClick}
      type="button"
    >
      <Plus aria-hidden="true" className="h-5 w-5" />
      <span className="font-medium">Create Campaign</span>
    </button>
  )
}

export function CampaignsEmptyState() {
  return (
    <div className="py-12 text-center" data-testid="campaigns-empty-state">
      <p className="font-serif text-xl text-gold">No campaigns yet</p>
      <p className="mt-2 text-sm text-zinc-500">Start your first adventure.</p>
    </div>
  )
}

export function CampaignsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-6 text-center" role="alert">
      <p className="text-red-200">Unable to load campaigns.</p>
      <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
        Retry
      </Button>
    </div>
  )
}
