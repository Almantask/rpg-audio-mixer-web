import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { HomeCampaignHero } from './HomeCampaignHero'
import type { CampaignWithSessionCount } from '@/lib/storage/types'

const campaign: CampaignWithSessionCount = {
  id: 'c1',
  name: 'Shadows of the Underdark',
  lastPlayedAt: Date.now(),
  createdAt: Date.now(),
  sessionCount: 2,
}

describe('HomeCampaignHero', () => {
  it('renders empty state CTA when no campaigns exist', () => {
    render(
      <MemoryRouter>
        <HomeCampaignHero isEmpty />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Create your first campaign' })).toHaveAttribute(
      'href',
      '/campaigns',
    )
  })

  it('renders campaign hero with Resume link', () => {
    render(
      <MemoryRouter>
        <HomeCampaignHero campaign={campaign} sessionSubtitle="Session 14: The Whispering Gallery" />
      </MemoryRouter>,
    )
    expect(screen.getByText('Shadows of the Underdark')).toBeInTheDocument()
    expect(screen.getByText('Session 14: The Whispering Gallery')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute(
      'href',
      '/campaigns/c1/sessions',
    )
  })

  it('renders skeleton placeholders while loading', () => {
    render(
      <MemoryRouter>
        <HomeCampaignHero isLoading />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('home-campaign-hero')).toBeInTheDocument()
  })
})

describe('TopSoundscapeCard', () => {
  it('shows empty state with Library link', async () => {
    const { TopSoundscapeCard } = await import('./TopSoundscapeCard')
    render(
      <MemoryRouter>
        <TopSoundscapeCard showEmpty />
      </MemoryRouter>,
    )
    expect(screen.getByText('No soundscapes played yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/library')
  })
})

describe('TopFxCard', () => {
  it('shows play count and preview button', async () => {
    const { TopFxCard } = await import('./TopFxCard')
    const onTogglePreview = vi.fn()
    render(
      <TopFxCard
        onTogglePreview={onTogglePreview}
        track={{
          id: 'fx-1',
          name: 'Dragon Roar',
          duration: '0:04',
          baseIntensity: 3,
          fxType: 'IMPACT',
          tags: [],
          defaultVolume: 100,
          createdAt: 1,
          playCount: 128,
        }}
      />,
    )
    expect(screen.getByText('128 PLAYS')).toBeInTheDocument()
    expect(screen.getByText('FX')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Preview Dragon Roar' }))
    expect(onTogglePreview).toHaveBeenCalledOnce()
  })
})
