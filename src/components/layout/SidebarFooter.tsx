import { UserRound } from 'lucide-react'

export function SidebarFooter() {
  return (
    <div
      aria-label="Profile avatar placeholder"
      className="mt-auto border-t border-zinc-800 p-4"
      data-testid="sidebar-footer-avatar"
    >
      <div
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400"
      >
        <UserRound aria-hidden="true" className="h-5 w-5" />
      </div>
    </div>
  )
}
