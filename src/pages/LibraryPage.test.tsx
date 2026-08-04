import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LibraryPage } from '@/pages/LibraryPage'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { ToastProvider } from '@/components/shared/ToastProvider'
import type { AppData } from '@/types/campaign'
import type { SoundscapeTrack } from '@/types/library'

vi.mock('@/lib/audioPreview', () => ({
  audioPreview: {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
    getCurrentTrackId: vi.fn(() => null),
    isPlaying: vi.fn(() => false),
  },
}))

function emptyAppData(overrides: Partial<AppData> = {}): AppData {
  return {
    campaigns: [],
    sessions: [],
    lastActiveSessionByCampaign: {},
    scenes: [],
    sessionSceneLinks: [],
    sceneSoundboardEntries: [],
    sceneSoundscapeSlots: [],
    sceneSoundboardSettings: [],
    sceneSoundscapeSettings: [],
    fxTracks: [],
    soundscapeCategories: [],
    soundscapeTracks: [],
    lastActiveSceneBySession: {},
    playStats: { soundscapeCategories: {}, fxTracks: {} },
    ...overrides,
  }
}

function seedAppData(overrides: Partial<AppData> = {}) {
  window.localStorage.setItem('arcanum-audio-data', JSON.stringify(emptyAppData(overrides)))
}

function makeTrack(partial: Partial<SoundscapeTrack> & Pick<SoundscapeTrack, 'id' | 'name'>): SoundscapeTrack {
  return {
    durationSeconds: 80,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: `/audio/${partial.id}.mp3`,
    createdAt: '2026-07-01T00:00:00.000Z',
    type: 'local',
    ...partial,
  }
}

function renderLibraryPage(initialEntry = '/library?tab=fx') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CampaignDataProvider>
        <ToastProvider>
          <Routes>
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/scenes" element={<div>Scenes screen</div>} />
          </Routes>
        </ToastProvider>
      </CampaignDataProvider>
    </MemoryRouter>,
  )
}

describe('LibraryPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('shows the Library heading without a page subtitle', () => {
    renderLibraryPage()

    expect(screen.getByRole('heading', { name: 'Library' })).toBeInTheDocument()
    expect(
      screen.queryByText('Browse soundscapes and sound effects.'),
    ).not.toBeInTheDocument()
  })

  it('shows Sound Effects tab actions without a browse subtitle', () => {
    renderLibraryPage('/library?tab=fx')

    expect(screen.getByRole('tab', { name: 'Sound Effects' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.queryByText('Browse, import, and manage your sound effects.'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import FX' })).toBeInTheDocument()
  })

  it('shows Soundscapes tab actions without a browse subtitle', async () => {
    const user = userEvent.setup()
    renderLibraryPage('/library?tab=fx')

    await user.click(screen.getByRole('tab', { name: 'Soundscapes' }))

    expect(
      screen.queryByText('Browse and manage your soundscape categories.'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buy Composition' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Free Compositions' })).toBeInTheDocument()
  })

  it('shows Soundscapes tab without Category Type or Sort Order sidebar filters', async () => {
    const user = userEvent.setup()
    renderLibraryPage('/library?tab=fx')

    await user.click(screen.getByRole('tab', { name: 'Soundscapes' }))

    expect(screen.queryByLabelText('Category Type')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Sort Order')).not.toBeInTheDocument()
    expect(screen.queryByText('All Types')).not.toBeInTheDocument()
    expect(screen.queryByText('Recently Added')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buy Composition' })).toBeInTheDocument()
  })

  it('shows three equal Library tabs including Tracks', () => {
    renderLibraryPage('/library?tab=fx')

    const tablist = screen.getByRole('tablist', { name: 'Library tabs' })
    const tabs = within(tablist).getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Soundscapes',
      'Sound Effects',
      'Tracks',
    ])
    expect(screen.getByRole('tab', { name: 'Tracks' })).toHaveAttribute(
      'data-library-tab',
      'Tracks',
    )
    for (const label of ['Soundscapes', 'Sound Effects', 'Tracks']) {
      const tab = screen.getByRole('tab', { name: label })
      expect(tab.className).toMatch(/px-2/)
      expect(tab.className).toMatch(/pb-2/)
    }
  })

  it('opens the Tracks tab from the ?tab=tracks deep link', () => {
    renderLibraryPage('/library?tab=tracks')

    expect(screen.getByRole('tab', { name: 'Tracks' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('shows active soundscape tracks and excludes FX and categories', () => {
    seedAppData({
      fxTracks: [
        {
          id: 'fx-1',
          name: 'Wolf Howl',
          durationSeconds: 2,
          baseIntensity: 'II',
          type: 'CREATURE',
          tags: [],
          audioUrl: 'blob:fx',
          defaultVolume: 80,
          createdAt: '2026-07-01T00:00:00.000Z',
        },
      ],
      soundscapeCategories: [
        {
          id: 'cat-1',
          name: 'Weather',
          trackCount: 1,
          createdAt: '2026-07-01T00:00:00.000Z',
        },
      ],
      soundscapeTracks: [
        makeTrack({ id: 't1', name: 'Forest Ambience' }),
        makeTrack({ id: 't2', name: 'Thunderous Downpour' }),
        makeTrack({
          id: 't3',
          name: 'YouTube Video 12345',
          type: 'youtube',
          youtubeId: '12345',
          format: 'YouTube',
        }),
        makeTrack({
          id: 't4',
          name: 'Deleted Track',
          deletedAt: '2026-07-10T00:00:00.000Z',
        }),
      ],
    })

    renderLibraryPage('/library?tab=tracks')

    expect(screen.getByTestId('tracks-grid')).toBeInTheDocument()
    expect(screen.getByText('Forest Ambience')).toBeInTheDocument()
    expect(screen.getByText('Thunderous Downpour')).toBeInTheDocument()
    expect(screen.getByText('YouTube Video 12345')).toBeInTheDocument()
    expect(screen.queryByText('Deleted Track')).not.toBeInTheDocument()
    expect(screen.queryByText('Wolf Howl')).not.toBeInTheDocument()
    expect(screen.queryByText('Weather')).not.toBeInTheDocument()
  })

  it('uses a three-column wide grid for Tracks', () => {
    seedAppData({
      soundscapeTracks: [
        makeTrack({ id: 'a', name: 'Alpha Rain' }),
        makeTrack({ id: 'b', name: 'Beta Wind' }),
        makeTrack({ id: 'c', name: 'Gamma Storm' }),
        makeTrack({ id: 'd', name: 'Delta Fire' }),
      ],
    })

    renderLibraryPage('/library?tab=tracks')

    const grid = screen.getByTestId('tracks-grid')
    expect(grid.className).toMatch(/lg:grid-cols-3/)
    expect(grid.className).not.toMatch(/lg:grid-cols-4|lg:grid-cols-6/)
  })

  it('shows empty state with Import control when there are no tracks', () => {
    seedAppData({ soundscapeTracks: [] })
    renderLibraryPage('/library?tab=tracks')

    expect(screen.getByTestId('tracks-library-empty')).toBeInTheDocument()
    expect(
      screen.getByText(/soundscape tracks will appear here/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Import$/i })).toBeInTheDocument()
  })

  it('shows skeleton cards while soundscape library data is loading', () => {
    window.sessionStorage.setItem(
      'arcanum-e2e-controls',
      JSON.stringify({ soundscapeLibraryState: 'loading' }),
    )
    seedAppData({
      soundscapeTracks: [makeTrack({ id: 't1', name: 'Forest Ambience' })],
    })

    renderLibraryPage('/library?tab=tracks')

    expect(screen.getByTestId('tracks-library-loading')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Loading soundscape track').length).toBeGreaterThan(0)
    expect(screen.queryByText('Forest Ambience')).not.toBeInTheDocument()
  })

  it('filters Tracks by name case-insensitively and clears filters', async () => {
    const user = userEvent.setup()
    seedAppData({
      soundscapeTracks: [
        makeTrack({ id: 't1', name: 'Thunderous Downpour' }),
        makeTrack({ id: 't2', name: 'Distant Rolling Thunder' }),
        makeTrack({ id: 't3', name: 'Forest Ambience' }),
      ],
    })

    renderLibraryPage('/library?tab=tracks')

    await user.type(screen.getByLabelText('Search tracks'), 'thunder')

    expect(screen.getByText('Thunderous Downpour')).toBeInTheDocument()
    expect(screen.getByText('Distant Rolling Thunder')).toBeInTheDocument()
    expect(screen.queryByText('Forest Ambience')).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText('Search tracks'))
    await user.type(screen.getByLabelText('Search tracks'), 'nonexistent_track_xyz')

    expect(screen.getByText('No tracks match your filters')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /clear filters/i }))

    expect(screen.getByText('Thunderous Downpour')).toBeInTheDocument()
    expect(screen.getByText('Forest Ambience')).toBeInTheDocument()
  })

  it('stops Tracks preview when switching away from the Tracks tab', async () => {
    const { audioPreview } = await import('@/lib/audioPreview')
    const user = userEvent.setup()
    seedAppData({
      soundscapeTracks: [makeTrack({ id: 't1', name: 'Thunderous Downpour' })],
    })

    renderLibraryPage('/library?tab=tracks')

    await user.click(screen.getByRole('button', { name: /preview thunderous downpour/i }))
    expect(audioPreview.play).toHaveBeenCalled()

    await user.click(screen.getByRole('tab', { name: 'Soundscapes' }))
    expect(audioPreview.stop).toHaveBeenCalled()
    expect(document.querySelector('[data-mini-player]')).toBeNull()
  })

  it('soft-deletes an unused track without confirmation', async () => {
    const user = userEvent.setup()
    seedAppData({
      soundscapeTracks: [makeTrack({ id: 't1', name: 'Thunderous Downpour' })],
    })

    renderLibraryPage('/library?tab=tracks')

    await user.click(screen.getByRole('button', { name: 'Trash Thunderous Downpour' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Thunderous Downpour')).not.toBeInTheDocument()
  })

  it('confirms in-use trash with category impact and detaches on confirm', async () => {
    const user = userEvent.setup()
    seedAppData({
      soundscapeTracks: [makeTrack({ id: 't1', name: 'Thunderous Downpour' })],
      soundscapeCategories: [
        {
          id: 'weather',
          name: 'Weather',
          trackCount: 1,
          createdAt: '2026-07-01T00:00:00.000Z',
          levels: { I: ['t1'], II: [], III: [] },
        },
        {
          id: 'interior',
          name: 'Interior',
          trackCount: 1,
          createdAt: '2026-07-01T00:00:00.000Z',
          levels: { I: [], II: ['t1'], III: [] },
        },
      ],
    })

    renderLibraryPage('/library?tab=tracks')

    await user.click(screen.getByRole('button', { name: 'Trash Thunderous Downpour' }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Weather')
    expect(dialog).toHaveTextContent('Interior')

    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(screen.queryByText('Thunderous Downpour')).not.toBeInTheDocument()
    await waitForElementToBeRemoved(() => screen.queryByRole('alertdialog'))
  })

  it('cancels in-use trash and keeps the track attached', async () => {
    const user = userEvent.setup()
    seedAppData({
      soundscapeTracks: [makeTrack({ id: 't1', name: 'Thunderous Downpour' })],
      soundscapeCategories: [
        {
          id: 'weather',
          name: 'Weather',
          trackCount: 1,
          createdAt: '2026-07-01T00:00:00.000Z',
          levels: { I: ['t1'], II: [], III: [] },
        },
      ],
    })

    renderLibraryPage('/library?tab=tracks')

    await user.click(screen.getByRole('button', { name: 'Trash Thunderous Downpour' }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByText('Thunderous Downpour')).toBeInTheDocument()
    await waitForElementToBeRemoved(() => screen.queryByRole('alertdialog'))
  })

  it('warns when trashing a playlist that occupies an intensity level', async () => {
    const user = userEvent.setup()
    seedAppData({
      soundscapeTracks: [
        makeTrack({
          id: 'pl1',
          name: 'YouTube Playlist (PL6789)',
          type: 'youtube-playlist',
          format: 'YouTube',
        }),
      ],
      soundscapeCategories: [
        {
          id: 'weather',
          name: 'Weather',
          trackCount: 1,
          createdAt: '2026-07-01T00:00:00.000Z',
          levels: { I: ['pl1'], II: [], III: [] },
        },
      ],
    })

    renderLibraryPage('/library?tab=tracks')

    await user.click(screen.getByRole('button', { name: 'Trash YouTube Playlist (PL6789)' }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent(/playlist occupies an intensity level/i)
    expect(screen.getByText('YouTube Playlist (PL6789)')).toBeInTheDocument()
  })

  it('imports a local audio file from the Tracks tab with a humanized name', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      configurable: true,
      value: () => 'blob:imported-track',
    })
    const user = userEvent.setup()
    seedAppData({ soundscapeTracks: [] })

    renderLibraryPage('/library?tab=tracks')

    await user.click(screen.getByRole('button', { name: /^Import$/i }))

    const fileInput = document.querySelector(
      'input[data-tracks-import-file]',
    ) as HTMLInputElement
    expect(fileInput).toBeTruthy()

    const file = new File(['audio'], 'thunderous_downpour.mp3', { type: 'audio/mpeg' })
    await user.upload(fileInput, file)

    expect(await screen.findByText('Thunderous Downpour')).toBeInTheDocument()
  })

  it('imports a YouTube video from the Tracks tab', async () => {
    const user = userEvent.setup()
    seedAppData({ soundscapeTracks: [] })

    renderLibraryPage('/library?tab=tracks')

    await user.click(screen.getByRole('button', { name: /^Import$/i }))
    await user.type(
      screen.getByPlaceholderText(/youtube/i),
      'https://www.youtube.com/watch?v=12345',
    )
    await user.click(screen.getByRole('button', { name: /import youtube/i }))

    expect(await screen.findByText('YouTube Video 12345')).toBeInTheDocument()
  })

  it('shows a dismissible error for an invalid YouTube URL', async () => {
    const user = userEvent.setup()
    seedAppData({
      soundscapeTracks: [makeTrack({ id: 't1', name: 'Forest Ambience' })],
    })

    renderLibraryPage('/library?tab=tracks')

    await user.click(screen.getByRole('button', { name: /^Import$/i }))
    await user.type(screen.getByPlaceholderText(/youtube/i), 'not-a-valid-youtube-url')
    await user.click(screen.getByRole('button', { name: /import youtube/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/youtube url could not be imported/i)
    await user.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Forest Ambience')).toBeInTheDocument()
  })

  it('shows a dismissible error for an invalid local audio import', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      configurable: true,
      value: () => 'blob:imported-track',
    })
    window.sessionStorage.setItem(
      'arcanum-e2e-controls',
      JSON.stringify({ invalidAudioImport: true }),
    )
    const user = userEvent.setup()
    seedAppData({
      soundscapeTracks: [makeTrack({ id: 't1', name: 'Forest Ambience' })],
    })

    renderLibraryPage('/library?tab=tracks')

    await user.click(screen.getByRole('button', { name: /^Import$/i }))
    const fileInput = document.querySelector(
      'input[data-tracks-import-file]',
    ) as HTMLInputElement
    const file = new File(['not-audio'], 'fake.mp3', { type: 'audio/mpeg' })
    await user.upload(fileInput, file)

    expect(screen.getByRole('alert')).toHaveTextContent(/could not be read as audio/i)
    await user.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Forest Ambience')).toBeInTheDocument()
  })
})
