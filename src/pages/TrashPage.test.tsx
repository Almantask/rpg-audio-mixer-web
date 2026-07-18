import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { TrashPage } from '@/pages/TrashPage'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { ToastProvider } from '@/components/shared/ToastProvider'

function renderTrashPage() {
  return render(
    <MemoryRouter>
      <CampaignDataProvider>
        <ToastProvider>
          <TrashPage />
        </ToastProvider>
      </CampaignDataProvider>
    </MemoryRouter>,
  )
}

describe('TrashPage', () => {
  it('shows the retention subtitle and footer note', () => {
    window.localStorage.clear()
    renderTrashPage()

    expect(
      screen.getByText('Recently deleted items are kept for 7 days before permanent removal.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Items in Trash are permanently deleted after 7 days. This cannot be undone.'),
    ).toBeInTheDocument()
  })

  it('makes trash tabs horizontally scrollable with full labels on narrow viewports', () => {
    window.localStorage.clear()
    renderTrashPage()

    const tablist = screen.getByRole('tablist', { name: 'Trash tabs' })
    expect(tablist.className).toMatch(/overflow-x-auto/)

    for (const label of ['Campaigns', 'Sessions', 'Scenes', 'Soundscapes', 'FX']) {
      const tab = screen.getByRole('tab', { name: label })
      expect(tab.className).toMatch(/shrink-0/)
      expect(tab.className).toMatch(/whitespace-nowrap/)
      expect(tab).toHaveTextContent(label)
    }
  })

  it('shows per-tab empty state headline', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    renderTrashPage()

    await user.click(screen.getByRole('tab', { name: 'FX' }))
    expect(screen.getByRole('heading', { name: 'No deleted FX' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /restore all/i })).not.toBeInTheDocument()
  })

  it('shows select all and selection bar when items exist', async () => {
    window.localStorage.clear()
    window.sessionStorage.setItem(
      'arcanum-e2e-controls',
      JSON.stringify({ trashListState: 'ready' }),
    )
    window.localStorage.setItem(
      'arcanum-audio-data',
      JSON.stringify({
        campaigns: [],
        sessions: [],
        lastActiveSessionByCampaign: {},
        scenes: [],
        sessionSceneLinks: [],
        sceneSoundboardEntries: [],
        sceneSoundscapeSlots: [],
        sceneSoundboardSettings: [],
        sceneSoundscapeSettings: [],
        fxTracks: [
          {
            id: 'fx-1',
            name: 'Dragon Roar',
            durationSeconds: 2,
            baseIntensity: 'II',
            type: 'CREATURE',
            tags: [],
            audioUrl: 'blob:test',
            defaultVolume: 80,
            createdAt: '2026-07-01T00:00:00.000Z',
            deletedAt: '2026-07-05T00:00:00.000Z',
          },
          {
            id: 'fx-2',
            name: 'Wolf Howl',
            durationSeconds: 2,
            baseIntensity: 'II',
            type: 'CREATURE',
            tags: [],
            audioUrl: 'blob:test2',
            defaultVolume: 80,
            createdAt: '2026-07-01T00:00:00.000Z',
            deletedAt: '2026-07-06T00:00:00.000Z',
          },
        ],
        soundscapeCategories: [],
        soundscapeTracks: [],
        lastActiveSceneBySession: {},
        playStats: { soundscapeCategories: {}, fxTracks: {} },
      }),
    )

    const user = userEvent.setup()
    renderTrashPage()
    await user.click(screen.getByRole('tab', { name: 'FX' }))

    expect(screen.getByLabelText('Select all (2)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /restore all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /empty trash/i })).toBeInTheDocument()

    await user.click(screen.getByLabelText('Select Dragon Roar'))
    await user.click(screen.getByLabelText('Select Wolf Howl'))
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restore Selected' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Purge Selected' })).toBeInTheDocument()
  })
})
