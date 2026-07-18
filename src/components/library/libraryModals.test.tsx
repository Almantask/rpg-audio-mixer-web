import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FreeTracksModal } from '@/components/library/FreeTracksModal'
import { ImportFxModal } from '@/components/library/ImportFxModal'
import { StoreModal } from '@/components/library/StoreModal'

describe('StoreModal', () => {
  it('shows storefront content while staying in a dialog', async () => {
    const onOpenChange = vi.fn()
    render(<StoreModal open onOpenChange={onOpenChange} />)

    expect(screen.getByRole('dialog')).toHaveAttribute('data-storefront')
    expect(screen.getByRole('heading', { name: 'Store' })).toBeInTheDocument()
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('FreeTracksModal', () => {
  it('shows a coming soon message in a dialog', async () => {
    const onOpenChange = vi.fn()
    render(<FreeTracksModal open onOpenChange={onOpenChange} />)

    expect(screen.getByRole('dialog')).toHaveAttribute('data-free-tracks-modal')
    expect(screen.getByRole('heading', { name: 'Free Tracks' })).toBeInTheDocument()
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('ImportFxModal', () => {
  it('offers a multi-file dropzone and choose-files action', () => {
    render(<ImportFxModal open onOpenChange={vi.fn()} onImport={vi.fn()} />)

    expect(screen.getByRole('dialog')).toHaveAttribute('data-fx-import-modal')
    expect(screen.getByRole('heading', { name: 'Import FX' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /drop audio files/i })).toBeInTheDocument()
    expect(document.querySelector('[data-fx-import-input]')?.getAttribute('accept')).toMatch(
      /audio/i,
    )
    expect(document.querySelector('[data-fx-import-input]')).toHaveAttribute('multiple')
    expect(screen.getByRole('button', { name: 'Choose files' })).toBeInTheDocument()
  })

  it('imports every dropped audio file', () => {
    const onImport = vi.fn()
    const onOpenChange = vi.fn()
    render(<ImportFxModal open onOpenChange={onOpenChange} onImport={onImport} />)

    const dropzone = screen.getByRole('button', { name: /drop audio files/i })

    const files = [
      new File(['a'], 'arrow.mp3', { type: 'audio/mpeg' }),
      new File(['b'], 'whip.mp3', { type: 'audio/mpeg' }),
      new File(['c'], 'notes.txt', { type: 'text/plain' }),
    ]

    fireEvent.drop(dropzone, {
      dataTransfer: { files },
    })

    expect(onImport).toHaveBeenCalledTimes(1)
    expect(onImport.mock.calls[0]?.[0]).toHaveLength(2)
    expect(onImport.mock.calls[0]?.[0].map((file: File) => file.name)).toEqual([
      'arrow.mp3',
      'whip.mp3',
    ])
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
