import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  valueLabel?: string
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueLabel, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={cn('space-y-2', className)}>
        {(label || valueLabel) && (
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gold">
            {label ? <label htmlFor={inputId}>{label}</label> : <span />}
            {valueLabel ? <span aria-live="polite">{valueLabel}</span> : null}
          </div>
        )}
        <input
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-gold"
          id={inputId}
          ref={ref}
          type="range"
          {...props}
        />
      </div>
    )
  },
)
Slider.displayName = 'Slider'
