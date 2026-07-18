import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FreeTracksModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FreeTracksModal({ open, onOpenChange }: FreeTracksModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-labelledby="free-tracks-modal-title"
        className="max-w-lg"
        data-free-tracks-modal
      >
        <DialogHeader>
          <DialogTitle id="free-tracks-modal-title">Free Tracks</DialogTitle>
          <p className="text-sm text-muted">Download free demo sound effects for your library.</p>
        </DialogHeader>

        <div className="rounded-lg border border-parchment/10 bg-ink/40 p-6 text-center">
          <Download className="mx-auto mb-3 h-8 w-8 text-gold" aria-hidden="true" />
          <p className="font-serif text-lg text-parchment">Coming soon</p>
          <p className="mt-2 text-sm text-muted">
            Free demo FX packs will be available here without leaving the Library.
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
