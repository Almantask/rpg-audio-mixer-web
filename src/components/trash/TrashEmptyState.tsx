import { Trash2 } from 'lucide-react'
import type { TrashTab } from '@/types/campaign'

const EMPTY_STATE_COPY: Record<
  TrashTab,
  { headline: string; description: string }
> = {
  campaigns: {
    headline: 'No deleted campaigns',
    description: 'Deleted campaigns will appear here for 7 days.',
  },
  sessions: {
    headline: 'No deleted sessions',
    description: 'Deleted sessions will appear here for 7 days.',
  },
  scenes: {
    headline: 'No deleted scenes',
    description: 'Deleted scenes will appear here for 7 days.',
  },
  soundscapes: {
    headline: 'No deleted soundscapes',
    description: 'Deleted soundscapes will appear here for 7 days.',
  },
  fx: {
    headline: 'No deleted FX',
    description: 'Deleted FX tracks will appear here for 7 days.',
  },
}

interface TrashEmptyStateProps {
  tab: TrashTab
}

export function TrashEmptyState({ tab }: TrashEmptyStateProps) {
  const copy = EMPTY_STATE_COPY[tab]

  return (
    <div className="flex flex-col items-center py-16 text-center" data-trash-empty>
      <Trash2 className="mb-4 h-16 w-16 text-gold/60" aria-hidden="true" />
      <h3 className="font-serif text-xl text-gold">{copy.headline}</h3>
      <p className="mt-2 max-w-md text-muted">{copy.description}</p>
    </div>
  )
}
