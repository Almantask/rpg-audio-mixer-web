import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog'

interface DeleteSessionDialogProps {
  open: boolean
  sessionLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteSessionDialog({
  open,
  sessionLabel,
  onOpenChange,
  onConfirm,
}: DeleteSessionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent aria-labelledby="delete-session-title">
        <AlertDialogHeader>
          <AlertDialogTitle id="delete-session-title">
            Delete {sessionLabel}?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <p className="text-sm text-muted">
          This session will move to Trash and can be recovered within 7 days.
        </p>
        <AlertDialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            aria-label={`Confirm delete ${sessionLabel}`}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
