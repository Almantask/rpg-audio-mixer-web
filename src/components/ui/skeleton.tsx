import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-zinc-800', className)}
      {...props}
    />
  )
}

export function LoadingSkeletonGroup({ label }: { label: string }) {
  return (
    <div aria-label={label} className="space-y-3" role="status">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  )
}
