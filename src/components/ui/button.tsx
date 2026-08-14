import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-amber-600 text-black font-semibold hover:bg-amber-500 shadow-sm',
        gold: 'bg-[#D4AF37] text-black font-semibold hover:bg-[#E5C158] shadow-sm',
        destructive: 'bg-red-900/80 text-red-100 hover:bg-red-800 border border-red-700/50',
        outline: 'border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white',
        secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/50',
        ghost: 'hover:bg-zinc-800 text-zinc-300 hover:text-white',
        link: 'text-amber-400 underline-offset-4 hover:underline',
        dashed: 'border border-dashed border-amber-500/50 bg-amber-950/10 text-amber-300 hover:bg-amber-950/30 hover:border-amber-400',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
