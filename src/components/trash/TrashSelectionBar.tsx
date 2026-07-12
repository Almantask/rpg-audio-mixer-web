import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TrashSelectionBarProps {
  selectedCount: number
  onRestoreSelected: () => void
  onPurgeSelected: () => void
}

export function TrashSelectionBar({
  selectedCount,
  onRestoreSelected,
  onPurgeSelected,
}: TrashSelectionBarProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div
      data-trash-selection-bar
      className="sticky bottom-0 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gold/30 bg-charcoal-elevated px-4 py-3"
    >
      <span className="text-sm text-white" data-trash-selection-count>
        {selectedCount} selected
      </span>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-gold/50 text-gold hover:bg-gold/10"
          data-trash-restore-selected
          onClick={onRestoreSelected}
        >
          Restore Selected
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn('border-red-500/50 text-red-400 hover:bg-red-500/10')}
          data-trash-purge-selected
          onClick={onPurgeSelected}
        >
          Purge Selected
        </Button>
      </div>
    </div>
  )
}
