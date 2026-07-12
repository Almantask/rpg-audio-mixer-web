import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LoadingSkeletonGroup } from '@/components/ui/skeleton'

export interface PickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  backLabel: string
  title: string
  subtitle: string
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  actionButtons?: ReactNode
  filters?: ReactNode
  emptyState?: ReactNode
  noMatchMessage: string
  onClearFilters?: () => void
  showNoMatch?: boolean
  selectedCount: number
  onAddSelected?: () => void
  showAddSelected?: boolean
  testId: string
  children: ReactNode
}

export function PickerModal({
  open,
  onOpenChange,
  backLabel,
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  isLoading = false,
  actionButtons,
  filters,
  emptyState,
  noMatchMessage,
  onClearFilters,
  showNoMatch = false,
  selectedCount,
  onAddSelected,
  showAddSelected = true,
  testId,
  children,
}: PickerModalProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onSearchChange('')
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-3xl" data-testid={testId}>
        <DialogHeader>
          <button
            className="mb-2 text-left text-sm text-gold"
            data-testid="picker-back-link"
            onClick={() => handleOpenChange(false)}
            type="button"
          >
            ← {backLabel}
          </button>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-zinc-400">{subtitle}</p>
        </DialogHeader>

        {actionButtons ? <div className="flex flex-wrap gap-2">{actionButtons}</div> : null}

        <div className="space-y-3">
          {filters}
          <Input
            aria-label="Picker search"
            data-testid="picker-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            value={searchValue}
          />
        </div>

        {isLoading ? (
          <LoadingSkeletonGroup label="Loading picker items" />
        ) : emptyState ? (
          emptyState
        ) : showNoMatch ? (
          <div className="py-8 text-center" data-testid="picker-no-match">
            <p className="text-zinc-400">{noMatchMessage}</p>
            {onClearFilters ? (
              <button
                className="mt-2 text-sm text-gold underline"
                data-testid="picker-clear-filters"
                onClick={onClearFilters}
                type="button"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <div data-testid="picker-grid">{children}</div>
        )}

        {showAddSelected && onAddSelected ? (
          <DialogFooter>
            <Button
              data-testid="picker-add-selected"
              disabled={selectedCount === 0}
              onClick={onAddSelected}
              type="button"
            >
              Add Selected ({selectedCount})
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
