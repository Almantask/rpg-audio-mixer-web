import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TrashItemCard } from './TrashItemCard'
import type { TrashItem } from '@/lib/storage/trashRepository'

const item: TrashItem = {
  id: '1',
  type: 'fx',
  name: 'Dragon Roar',
  deletedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
}

describe('TrashItemCard', () => {
  it('renders item details and actions', async () => {
    const onRestore = vi.fn()
    const onPurge = vi.fn()
    render(
      <TrashItemCard
        item={item}
        onPurge={onPurge}
        onRestore={onRestore}
        onToggleSelect={() => undefined}
        selected={false}
      />,
    )
    expect(screen.getByText('Dragon Roar')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Restore' }))
    expect(onRestore).toHaveBeenCalledOnce()
  })
})
