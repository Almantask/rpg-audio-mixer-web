import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    return (
      <label className={cn('inline-flex cursor-pointer items-center gap-2', className)} htmlFor={inputId}>
        <span className="relative flex h-4 w-4 items-center justify-center rounded border border-zinc-600 bg-zinc-900">
          <input
            className="peer sr-only"
            id={inputId}
            ref={ref}
            type="checkbox"
            {...props}
          />
          <Check
            aria-hidden="true"
            className="h-3 w-3 text-gold opacity-0 peer-checked:opacity-100"
          />
        </span>
        {label ? <span className="text-sm text-zinc-300">{label}</span> : null}
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'
