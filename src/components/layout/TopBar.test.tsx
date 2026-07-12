import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('renders Arcanum Audio centered in gold italic serif styling', () => {
    render(<TopBar onMenuToggle={() => undefined} sidebarOpen={false} />)

    const title = screen.getByRole('heading', { name: 'Arcanum Audio' })
    expect(title).toHaveClass('italic', 'text-gold', 'font-serif')
  })

  it('renders a hamburger menu button', () => {
    render(<TopBar onMenuToggle={() => undefined} sidebarOpen={false} />)

    expect(screen.getByRole('button', { name: 'Toggle navigation menu' })).toBeInTheDocument()
  })

  it('does not render a settings or gear icon', () => {
    render(<TopBar onMenuToggle={() => undefined} sidebarOpen={false} />)

    expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/gear/i)).not.toBeInTheDocument()
  })

  it('calls onMenuToggle when hamburger is clicked', async () => {
    const onMenuToggle = vi.fn()
    const user = userEvent.setup()

    render(<TopBar onMenuToggle={onMenuToggle} sidebarOpen={false} />)
    await user.click(screen.getByRole('button', { name: 'Toggle navigation menu' }))

    expect(onMenuToggle).toHaveBeenCalledOnce()
  })

  it('reflects sidebar open state on the menu button', () => {
    render(<TopBar onMenuToggle={() => undefined} sidebarOpen />)

    expect(screen.getByRole('button', { name: 'Toggle navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
