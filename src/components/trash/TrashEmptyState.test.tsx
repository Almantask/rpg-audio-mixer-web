import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TrashEmptyState } from '@/components/trash/TrashEmptyState'

describe('TrashEmptyState', () => {
  it('shows tab-specific empty headline for FX', () => {
    render(<TrashEmptyState tab="fx" />)
    expect(screen.getByRole('heading', { name: 'No deleted FX' })).toBeInTheDocument()
    expect(screen.getByText('Deleted FX tracks will appear here for 7 days.')).toBeInTheDocument()
  })

  it('shows tab-specific empty headline for campaigns', () => {
    render(<TrashEmptyState tab="campaigns" />)
    expect(screen.getByRole('heading', { name: 'No deleted campaigns' })).toBeInTheDocument()
  })

  it('shows tab-specific empty headline for Tracks', () => {
    render(<TrashEmptyState tab="tracks" />)
    expect(screen.getByRole('heading', { name: 'No deleted Tracks' })).toBeInTheDocument()
    expect(
      screen.getByText('Deleted soundscape tracks will appear here for 7 days.'),
    ).toBeInTheDocument()
  })
})
