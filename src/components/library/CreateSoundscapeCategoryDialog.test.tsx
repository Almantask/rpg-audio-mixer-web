import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CreateSoundscapeCategoryDialog } from '@/components/library/CreateSoundscapeCategoryDialog'

describe('CreateSoundscapeCategoryDialog', () => {
  it('renders title, category name field, and actions', () => {
    render(
      <CreateSoundscapeCategoryDialog open onOpenChange={vi.fn()} onCreate={vi.fn()} />,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('data-sc-create-category-modal')
    expect(screen.getByRole('heading', { name: 'Add Soundscape' })).toBeInTheDocument()
    expect(screen.getByLabelText('Category name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('creates with a trimmed name and closes', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <CreateSoundscapeCategoryDialog open onOpenChange={onOpenChange} onCreate={onCreate} />,
    )

    await user.type(screen.getByLabelText('Category name'), '  Arcane  ')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onCreate).toHaveBeenCalledWith('Arcane')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('submits on Enter when the name is valid', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    render(
      <CreateSoundscapeCategoryDialog open onOpenChange={vi.fn()} onCreate={onCreate} />,
    )

    await user.type(screen.getByLabelText('Category name'), 'Forest{Enter}')

    expect(onCreate).toHaveBeenCalledWith('Forest')
  })

  it('does not create when the name is empty or whitespace', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    render(
      <CreateSoundscapeCategoryDialog open onOpenChange={vi.fn()} onCreate={onCreate} />,
    )

    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/required/i)

    await user.type(screen.getByLabelText('Category name'), '   ')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('closes without creating on Cancel', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <CreateSoundscapeCategoryDialog open onOpenChange={onOpenChange} onCreate={onCreate} />,
    )

    await user.type(screen.getByLabelText('Category name'), 'Draft')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCreate).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
