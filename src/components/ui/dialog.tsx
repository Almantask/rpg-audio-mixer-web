import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogContent({
  className,
  children,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: {
  className?: string
  children: React.ReactNode
  'aria-labelledby'?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(DialogContext)
  const open = Boolean(ctx?.open)
  const [rendered, setRendered] = React.useState(open)
  const [phase, setPhase] = React.useState<'enter' | 'exit'>(open ? 'enter' : 'exit')

  React.useEffect(() => {
    if (!ctx) {
      return
    }
    if (open) {
      setRendered(true)
      setPhase('enter')
      return
    }
    setPhase('exit')
    const timeout = window.setTimeout(() => setRendered(false), 180)
    return () => window.clearTimeout(timeout)
  }, [ctx, open])

  if (!ctx || !rendered) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog overlay"
        className={cn(
          'absolute inset-0 bg-black/55 backdrop-blur-[2px]',
          phase === 'enter' ? 'aa-dialog-overlay-in' : 'aa-dialog-overlay-out',
        )}
        onClick={() => ctx.onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        className={cn(
          'relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-charcoal-elevated/95 p-5 shadow-2xl shadow-black/40 sm:p-6',
          phase === 'exit' ? 'pointer-events-none' : null,
          phase === 'enter' ? 'aa-dialog-content-in' : 'aa-dialog-content-out',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-serif text-xl text-gold', className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

export function AlertDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

export function AlertDialogContent({
  className,
  children,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: {
  className?: string
  children: React.ReactNode
  'aria-labelledby'?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogContent aria-labelledby={ariaLabelledBy} className={className} role="alertdialog" {...props}>
      {children}
    </DialogContent>
  )
}

export function AlertDialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <DialogHeader {...props} />
}

export function AlertDialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <DialogTitle {...props} />
}

export function AlertDialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <DialogFooter {...props} />
}
