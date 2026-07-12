import { AlertTriangle, Clock, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { daysRemaining, daysSinceDeleted } from '@/lib/constants'
import type { TrashItem } from '@/lib/storage/trashRepository'
import { cn } from '@/lib/utils'

interface TrashItemCardProps {
  item: TrashItem
  selected: boolean
  onToggleSelect: (selected: boolean) => void
  onRestore: () => void
  onPurge: () => void
  errorMessage?: string
}

export function TrashItemCard({
  item,
  selected,
  onToggleSelect,
  onRestore,
  onPurge,
  errorMessage,
}: TrashItemCardProps) {
  const remaining = daysRemaining(item.deletedAt)
  const urgent = remaining <= 1

  return (
    <article
      className={cn(
        'rounded-lg border bg-surface p-4',
        selected ? 'border-gold ring-1 ring-gold/40' : 'border-zinc-800',
      )}
      data-testid="trash-item-card"
      data-trash-item-name={item.name}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          aria-label={`Select ${item.name}`}
          checked={selected}
          data-testid="trash-item-checkbox"
          onChange={(event) => onToggleSelect(event.currentTarget.checked)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs">
            {urgent ? <AlertTriangle aria-hidden className="h-4 w-4 text-red-400" /> : null}
            <Clock aria-hidden className="h-4 w-4 text-zinc-500" />
            <span className={cn(urgent ? 'text-red-400' : 'text-zinc-400')}>
              {remaining} days left
            </span>
          </div>
          <h3 className="mt-2 font-serif text-lg text-zinc-100">{item.name}</h3>
          {item.subtitle ? <p className="text-sm text-zinc-400">{item.subtitle}</p> : null}
          <p className="mt-1 text-xs text-zinc-500">Deleted {daysSinceDeleted(item.deletedAt)} days ago</p>
          {errorMessage ? (
            <p className="mt-2 text-xs text-red-400" data-testid="trash-item-error">
              {errorMessage}
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <Button onClick={onRestore} size="sm" type="button" variant="outline">
              <RotateCcw aria-hidden className="mr-1 h-4 w-4" />
              Restore
            </Button>
            <Button
              className="text-red-400 hover:text-red-300"
              onClick={onPurge}
              size="sm"
              type="button"
              variant="ghost"
            >
              Purge
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
