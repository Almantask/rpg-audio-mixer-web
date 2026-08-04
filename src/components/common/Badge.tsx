import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'purple' | 'muted' | 'destructive'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gold', className = '' }) => {
  const variantStyles = {
    gold: 'border-amber-500/40 text-amber-300 bg-amber-950/30',
    purple: 'border-purple-500/40 text-purple-300 bg-purple-950/30',
    muted: 'border-neutral-700 text-neutral-400 bg-neutral-900',
    destructive: 'border-red-500/40 text-red-400 bg-red-950/30',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider border rounded-md ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
