import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold',
        className,
      )}
      {...props}
    />
  )
}
