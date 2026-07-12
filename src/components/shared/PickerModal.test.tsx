import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PickerModal } from './PickerModal'

describe('PickerModal', () => {
  it('renders title and disables Add Selected when nothing is checked', () => {
    render(
      <PickerModal
        backLabel="Back to Active Scene"
        noMatchMessage="No items match"
        onAddSelected={vi.fn()}
        onOpenChange={vi.fn()}
        onSearchChange={vi.fn()}
        open
        searchPlaceholder="Search…"
        searchValue=""
        selectedCount={0}
        subtitle="Select items."
        testId="test-picker"
        title="Add Items"
      >
        <p>Grid content</p>
      </PickerModal>,
    )

    expect(screen.getByRole('heading', { name: 'Add Items' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Selected (0)' })).toBeDisabled()
  })

  it('calls onAddSelected when button is enabled', async () => {
    const onAddSelected = vi.fn()
    render(
      <PickerModal
        backLabel="Back to Active Scene"
        noMatchMessage="No items match"
        onAddSelected={onAddSelected}
        onOpenChange={vi.fn()}
        onSearchChange={vi.fn()}
        open
        searchPlaceholder="Search…"
        searchValue=""
        selectedCount={2}
        subtitle="Select items."
        testId="test-picker"
        title="Add Items"
      >
        <p>Grid content</p>
      </PickerModal>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add Selected (2)' }))
    expect(onAddSelected).toHaveBeenCalledOnce()
  })
})
