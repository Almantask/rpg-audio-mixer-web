import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface StoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StoreModal({ open, onOpenChange }: StoreModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-labelledby="store-modal-title"
        className="max-w-lg"
        data-storefront
        data-store-modal
      >
        <DialogHeader>
          <DialogTitle id="store-modal-title">Store</DialogTitle>
          <p className="text-sm text-muted">Purchase additional sound packs for your library.</p>
        </DialogHeader>

        <div className="rounded-lg border border-parchment/10 bg-ink/40 p-6 text-center">
          <ShoppingCart className="mx-auto mb-3 h-8 w-8 text-gold" aria-hidden="true" />
          <p className="font-serif text-lg text-parchment">Storefront coming soon</p>
          <p className="mt-2 text-sm text-muted">
            Browse and buy combat, creature, and ambience packs without leaving the Library.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
