import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SoundscapeCategoryCard } from './SoundscapeCategoryCard'
import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'

const tracks: SoundscapeTrack[] = [
  {
    id: 't-i',
    name: 'Forest Soft',
    durationSeconds: 30,
    format: 'mp3',
    channels: 'stereo',
    audioUrl: '/audio/i.mp3',
    createdAt: '2026-01-01',
  },
  {
    id: 't-ii',
    name: 'Forest Medium',
    durationSeconds: 30,
    format: 'mp3',
    channels: 'stereo',
    audioUrl: '/audio/ii.mp3',
    createdAt: '2026-01-01',
  },
]

const category: SoundscapeCategory = {
  id: 'cat-forest',
  name: 'Forest',
  trackCount: 2,
  levels: { I: ['t-i'], II: ['t-ii'], III: [] },
}

vi.mock('@/lib/audioPreview', () => {
  const listeners = new Set<
    (trackId: string | null, trackName: string | null, playing: boolean) => void
  >()
  return {
    audioPreview: {
      subscribe: (listener: (trackId: string | null, trackName: string | null, playing: boolean) => void) => {
        listeners.add(listener)
        listener(null, null, false)
        return () => listeners.delete(listener)
      },
      play: vi.fn((trackId: string, _url: string, trackName: string) => {
        for (const listener of listeners) {
          listener(trackId, trackName, true)
        }
      }),
      pause: vi.fn(() => {
        for (const listener of listeners) {
          listener(null, null, false)
        }
      }),
      toggle: vi.fn(),
      stop: vi.fn(),
      isPlaying: vi.fn(() => false),
      getCurrentTrackId: vi.fn(() => null),
    },
  }
})

vi.mock('@/context/CampaignDataContext', () => ({
  useCampaignData: () => ({
    data: { soundscapeTracks: tracks },
  }),
}))

describe('SoundscapeCategoryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders three intensity preview buttons for levels I, II, and III', () => {
    render(
      <MemoryRouter>
        <SoundscapeCategoryCard category={category} onDelete={() => undefined} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Preview Forest level I' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview Forest level II' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '0 tracks. To have this level available add at least 1 track.',
      }),
    ).toBeInTheDocument()
  })

  it('does not render category-name watermark initials behind intensity previews', () => {
    render(
      <MemoryRouter>
        <SoundscapeCategoryCard category={category} onDelete={() => undefined} />
      </MemoryRouter>,
    )

    expect(screen.queryByText('FO')).not.toBeInTheDocument()
  })

  it('disables the preview button when a level has no tracks', () => {
    render(
      <MemoryRouter>
        <SoundscapeCategoryCard category={category} onDelete={() => undefined} />
      </MemoryRouter>,
    )

    const emptyLevel = screen.getByRole('button', {
      name: '0 tracks. To have this level available add at least 1 track.',
    })
    expect(emptyLevel).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Preview Forest level I' })).toBeEnabled()
  })

  it('shows an empty-level hint for intensities with no tracks', () => {
    render(
      <MemoryRouter>
        <SoundscapeCategoryCard category={category} onDelete={() => undefined} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('tooltip', {
        name: '0 tracks. To have this level available add at least 1 track.',
      }),
    ).toBeInTheDocument()
  })

  it('previews the first track at the selected intensity level', async () => {
    const { audioPreview } = await import('@/lib/audioPreview')
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SoundscapeCategoryCard category={category} onDelete={() => undefined} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Preview Forest level II' }))

    expect(audioPreview.play).toHaveBeenCalledWith('t-ii', '/audio/ii.mp3', 'Forest Medium')
    expect(screen.getByRole('button', { name: 'Pause Forest level II' })).toBeInTheDocument()
  })
})
