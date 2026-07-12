import { cn } from '@/lib/utils'

interface MainContentProps {
  children: React.ReactNode
  className?: string
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main
      className={cn('flex-1 overflow-y-auto bg-background p-4 md:p-6', className)}
      id="main-content"
    >
      <div className="mx-auto w-full max-w-4xl">{children}</div>
    </main>
  )
}
