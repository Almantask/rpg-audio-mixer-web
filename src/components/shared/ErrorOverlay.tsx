import { Button } from '@/components/ui/button'

interface ErrorOverlayProps {
  message: string
  onDismiss: () => void
}

export function ErrorOverlay({ message, onDismiss }: ErrorOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      data-testid="error-overlay"
      role="alertdialog"
      aria-labelledby="error-overlay-title"
      aria-describedby="error-overlay-message"
    >
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg border border-red-900/60 bg-zinc-950 p-6 shadow-xl">
        <h2 className="font-serif text-lg text-red-400" id="error-overlay-title">
          Something went wrong
        </h2>
        <p className="mt-3 text-sm text-zinc-300" id="error-overlay-message">
          {message}
        </p>
        <div className="mt-6 flex justify-end">
          <Button data-testid="error-overlay-close" onClick={onDismiss} type="button" variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
