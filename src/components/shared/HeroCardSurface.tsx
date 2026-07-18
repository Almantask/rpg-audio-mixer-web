import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type HeroCardSurfaceSize = 'list' | 'hero'

interface HeroCardSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  coverArtUrl?: string
  /** Extra attributes on the cover layer (e.g. data-campaign-cover). */
  coverProps?: HTMLAttributes<HTMLDivElement> & Record<string, string | undefined>
  size?: HeroCardSurfaceSize
  children: ReactNode
}

const sizeClasses: Record<HeroCardSurfaceSize, string> = {
  list: 'min-h-[9.5rem]',
  hero: 'min-h-[13.5rem] lg:min-h-[18rem] xl:min-h-[22rem]',
}

export function HeroCardSurface({
  coverArtUrl,
  coverProps,
  size = 'list',
  className,
  children,
  ...props
}: HeroCardSurfaceProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-gold/25',
        'bg-gradient-to-br from-ink-overlay via-charcoal-elevated to-charcoal',
        'transition-all duration-200 hover:border-gold/40',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {coverArtUrl ? (
        <div
          aria-hidden="true"
          data-hero-cover
          {...coverProps}
          className={cn(
            'absolute inset-0 bg-cover bg-center opacity-40',
            coverProps?.className,
          )}
          style={{
            backgroundImage: `url(${coverArtUrl})`,
            ...coverProps?.style,
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          data-hero-fallback
          className="absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-violet/10"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/55 to-charcoal/30"
      />
      <div className="relative z-[1] flex h-full min-h-inherit w-full min-w-0 flex-col">
        {children}
      </div>
    </div>
  )
}
