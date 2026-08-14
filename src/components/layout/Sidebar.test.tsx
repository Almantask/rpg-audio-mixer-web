import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

describe('Sidebar Navigation', () => {
  it('renders all 6 primary navigation items without dividers', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /Home/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Campaigns/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Scenes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Library/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Credits/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Trash/i })).toBeInTheDocument()
  })

  it('highlights the active item according to the route', () => {
    render(
      <MemoryRouter initialEntries={['/campaigns']}>
        <Sidebar isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    )

    const campaignBtn = screen.getByRole('button', { name: /Campaigns/i })
    expect(campaignBtn).toHaveClass('text-amber-400')
  })
})
