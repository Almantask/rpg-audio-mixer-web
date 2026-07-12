import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  onMenuToggle: () => void
  sidebarOpen: boolean
}

export function TopBar({ onMenuToggle, sidebarOpen }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-zinc-800 bg-surface px-4">
      <Button
        aria-controls="primary-navigation"
        aria-expanded={sidebarOpen}
        aria-label="Toggle navigation menu"
        className="lg:hidden"
        onClick={onMenuToggle}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center justify-center">
        <h1 className="font-serif text-lg italic text-gold">Arcanum Audio</h1>
      </div>
      <div aria-hidden="true" className="w-10 lg:hidden" />
    </header>
  )
}
