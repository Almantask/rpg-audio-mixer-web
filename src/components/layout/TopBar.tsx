import { Menu } from 'lucide-react'

interface TopBarProps {
  onToggleSidebar: () => void
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-amber-300 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      <div className="flex-1 text-center">
        <h1 className="font-serif-title text-xl font-bold tracking-wide text-amber-400 italic">
          Arcanum Audio
        </h1>
      </div>

      <div className="w-9 md:w-0" />
    </header>
  )
}
