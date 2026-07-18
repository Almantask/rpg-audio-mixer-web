import {
  AlertTriangle,
  Clock,
  Flag,
  Frame,
  Music,
  RotateCcw,
  ScrollText,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { daysRemaining, daysSinceDeleted } from '@/lib/trashStorage'
import { cn } from '@/lib/utils'

export type TrashEntityType = 'campaign' | 'session' | 'scene' | 'soundscape' | 'fx'

const TYPE_ICONS: Record<TrashEntityType, typeof Flag> = {
  campaign: Flag,
  session: ScrollText,
  scene: Frame,
  soundscape: Music,
  fx: Zap,
}

const DATA_ATTR: Record<TrashEntityType, string> = {
  campaign: 'data-trashed-campaign',
  session: 'data-trashed-session',
  scene: 'data-trashed-scene',
  soundscape: 'data-trashed-soundscape',
  fx: 'data-trashed-fx',
}

export interface TrashItemCardProps {
  id: string
  type: TrashEntityType
  title: string
  dataLabel: string
  deletedAt: string
  selected: boolean
  error?: string
  onToggleSelect: (id: string) => void
  onRestore: (id: string) => void
  onPurge: (id: string) => void
}

export function TrashItemCard({
  id,
  type,
  title,
  dataLabel,
  deletedAt,
  selected,
  error,
  onToggleSelect,
  onRestore,
  onPurge,
}: TrashItemCardProps) {
  const Icon = TYPE_ICONS[type]
  const remaining = daysRemaining(deletedAt)
  const sinceDeleted = daysSinceDeleted(deletedAt)
  const urgent = remaining <= 1
  const dataAttr = DATA_ATTR[type]

  return (
    <Card
      className={cn(
        'transition-colors hover:border-gold/40',
        selected && 'border-gold/60 bg-gold/5',
        error && 'border-red-500/40',
      )}
      data-trash-selected={selected ? 'true' : 'false'}
      {...{ [dataAttr]: dataLabel }}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            data-trash-card-checkbox
            data-trash-checkbox
            aria-label={`Select ${title}`}
            checked={selected}
            className="mt-1 h-4 w-4 shrink-0 accent-gold"
            onChange={() => onToggleSelect(id)}
            onClick={(event) => event.stopPropagation()}
          />
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-charcoal">
            <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs',
                urgent ? 'text-red-400' : 'text-muted',
              )}
            >
              {urgent ? (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>
                {remaining} {remaining === 1 ? 'day' : 'days'} left
              </span>
            </div>
            <h4 className="mt-1 truncate font-serif text-lg text-white">{title}</h4>
            <p className="text-sm text-muted">
              Deleted {sinceDeleted} {sinceDeleted === 1 ? 'day' : 'days'} ago
            </p>
            {error ? (
              <p className="mt-1 text-sm text-red-400" data-trash-error data-trash-item-error>
                {error}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2 pl-7">
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-2 text-gold"
            data-trash-restore
            aria-label={`Restore ${title}`}
            onClick={() => onRestore(id)}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restore
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-2 text-red-400 hover:text-red-300"
            data-trash-purge
            aria-label={`Purge ${title}`}
            onClick={() => onPurge(id)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Purge
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function TrashItemCardSkeleton() {
  return (
    <Card aria-busy="true" role="status" aria-label="Loading trash item">
      <CardContent className="h-36 animate-pulse p-4">
        <div className="h-full rounded bg-white/5" />
      </CardContent>
    </Card>
  )
}
