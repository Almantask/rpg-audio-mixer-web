import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import { HomePage } from '@/pages/HomePage'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { ToastProvider } from '@/components/shared/ToastProvider'
import { saveAppData } from '@/lib/campaignStorage'
import { EMPTY_APP_DATA, type Campaign, type Session } from '@/types/campaign'

function buildCampaign(name: string): Campaign {
  const now = new Date().toISOString()
  return {
    id: `campaign-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    createdAt: now,
    lastPlayedAt: now,
  }
}

function buildSession(campaignId: string, number: number, name: string): Session {
  return {
    id: `session-${campaignId}-${number}`,
    campaignId,
    name,
    number,
    date: '2026-01-01',
    sceneCount: 0,
  }
}

function renderHomePage() {
  return render(
    <MemoryRouter>
      <CampaignDataProvider>
        <ToastProvider>
          <HomePage />
        </ToastProvider>
      </CampaignDataProvider>
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('shows loading skeletons when home screen data is loading', () => {
    window.sessionStorage.setItem(
      'arcanum-e2e-controls',
      JSON.stringify({ homeScreenState: 'loading' }),
    )
    renderHomePage()
    expect(document.querySelector('[data-home-hero-skeleton]')).toBeTruthy()
    expect(document.querySelector('[data-home-stat-skeleton="soundscape"]')).toBeTruthy()
  })

  it('shows empty hero when there are no campaigns', () => {
    saveAppData({ ...EMPTY_APP_DATA })
    renderHomePage()
    expect(screen.getByTestId('active-campaign-hero')).toHaveTextContent('Create your first campaign')
    expect(screen.queryByText('Top Soundscape')).not.toBeInTheDocument()
  })

  it('shows active campaign hero with resume when campaigns exist', () => {
    const campaign = buildCampaign('Shadows of the Underdark')
    const session = buildSession(campaign.id, 14, 'The Whispering Gallery awaits your party\'s next move.')
    saveAppData({
      ...EMPTY_APP_DATA,
      campaigns: [campaign],
      sessions: [session],
      lastActiveSessionByCampaign: { [campaign.id]: session.id },
    })
    renderHomePage()
    expect(screen.getByText('Shadows of the Underdark')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()
    expect(
      screen.getByText('Session 14: The Whispering Gallery awaits your party\'s next move.'),
    ).toBeInTheDocument()
  })
})
