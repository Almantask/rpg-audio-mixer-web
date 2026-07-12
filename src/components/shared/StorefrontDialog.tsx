import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface StorefrontDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StorefrontDialog({ open, onOpenChange }: StorefrontDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent data-testid="storefront">
        <DialogHeader>
          <DialogTitle>Storefront</DialogTitle>
        </DialogHeader>
        <p className="text-zinc-400">Browse premium audio packs for your campaigns.</p>
      </DialogContent>
    </Dialog>
  )
}
