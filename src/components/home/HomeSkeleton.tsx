import { Skeleton } from '@/components/ui/skeleton'

export function HomeHeroSkeleton() {
  return (
    <div data-home-hero-skeleton className="space-y-3 rounded-lg border border-gold/20 p-6">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="ml-auto h-10 w-28" />
    </div>
  )
}

export function HomeStatCardSkeleton({ testId }: { testId: string }) {
  return (
    <div data-home-stat-skeleton={testId} className="space-y-4 rounded-lg border border-white/10 p-6">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  )
}
