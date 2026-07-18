import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ActiveCampaignHero } from '@/components/home/ActiveCampaignHero'
import type { Campaign, Session } from '@/types/campaign'

const campaign: Campaign = {
  id: 'campaign-1',
  name: 'Shadows of the Underdark',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastPlayedAt: '2026-01-01T00:00:00.000Z',
}

const session: Session = {
  id: 'session-1',
  campaignId: 'campaign-1',
  name: 'Whispering Gallery',
  number: 14,
  date: '2026-01-01',
  sceneCount: 0,
  description: 'The gallery awaits.',
}

describe('ActiveCampaignHero', () => {
  it('keeps Resume full-width and touch-friendly on narrow viewports', () => {
    render(
      <MemoryRouter>
        <ActiveCampaignHero campaign={campaign} session={session} />
      </MemoryRouter>,
    )

    const resume = screen.getByRole('button', { name: 'Resume' })
    expect(resume.className).toMatch(/min-h-11/)
    expect(resume.className).toMatch(/w-full/)
    expect(resume.className).toMatch(/sm:w-auto/)
  })
})
