import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-amber-500/20 text-amber-300 border-amber-500/30',
        secondary: 'border-transparent bg-zinc-800 text-zinc-300',
        destructive: 'border-transparent bg-red-950 text-red-300 border-red-800/50',
        outline: 'text-zinc-300 border-zinc-700',
        purple: 'border-transparent bg-purple-950/60 text-purple-300 border-purple-800/50',
        gold: 'border-amber-500/40 bg-amber-950/40 text-amber-300 font-serif',
        active: 'border-amber-500 bg-amber-500/20 text-amber-300 animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
