import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorOverlay } from './ErrorOverlay'

describe('ErrorOverlay', () => {
  it('renders a scrollable overlay with message and Close button', () => {
    render(<ErrorOverlay message="Playback failed" onDismiss={vi.fn()} />)

    expect(screen.getByTestId('error-overlay')).toBeInTheDocument()
    expect(screen.getByText('Playback failed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('calls onDismiss when Close is clicked', async () => {
    const onDismiss = vi.fn()
    render(<ErrorOverlay message="Save failed" onDismiss={onDismiss} />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
