import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SoundscapeTrackCard } from '@/components/library/SoundscapeTrackCard'
import type { SoundscapeTrack } from '@/types/library'

const audioPreviewMock = vi.hoisted(() => {
  let listener: ((trackId: string | null, trackName: string | null, isPlaying: boolean) => void) | null =
    null
  return {
    play: vi.fn((trackId: string, _url: string, trackName: string) => {
      listener?.(trackId, trackName, true)
    }),
    pause: vi.fn(() => {
      listener?.(null, null, false)
    }),
    stop: vi.fn(() => {
      listener?.(null, null, false)
    }),
    subscribe: vi.fn((cb: (trackId: string | null, trackName: string | null, isPlaying: boolean) => void) => {
      listener = cb
      return () => {
        listener = null
      }
    }),
    getCurrentTrackId: vi.fn(() => null),
    isPlaying: vi.fn(() => false),
  }
})

vi.mock('@/lib/audioPreview', () => ({
  audioPreview: audioPreviewMock,
}))

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

describe('SoundscapeTrackCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders local track title, local cue, duration, and format', () => {
    render(
      <SoundscapeTrackCard
        track={makeTrack({
          id: 'local-1',
          name: 'Thunderous Downpour',
          durationSeconds: 80,
          format: 'MP3',
          type: 'local',
        })}
        onDelete={vi.fn()}
      />,
    )

    const card = screen.getByTestId('soundscape-track-card')
    expect(card).toHaveAttribute('data-track-card', 'Thunderous Downpour')
    expect(screen.getByText('Thunderous Downpour')).toBeInTheDocument()
    expect(screen.getByText('Local · 1:20 · MP3')).toBeInTheDocument()
  })

  it('renders YouTube video cue and duration', () => {
    render(
      <SoundscapeTrackCard
        track={makeTrack({
          id: 'yt-1',
          name: 'YouTube Video 12345',
          durationSeconds: 185,
          type: 'youtube',
          youtubeId: '12345',
          format: 'YouTube',
        })}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('YouTube Video 12345')).toBeInTheDocument()
    expect(screen.getByText('YouTube · 3:05')).toBeInTheDocument()
    expect(screen.queryByText(/Playlist/i)).not.toBeInTheDocument()
  })

  it('renders playlist cue and video count on one card', () => {
    render(
      <SoundscapeTrackCard
        track={makeTrack({
          id: 'pl-1',
          name: 'YouTube Playlist (PL6789)',
          type: 'youtube-playlist',
          format: 'YouTube',
          playlistVideos: Array.from({ length: 12 }, (_, index) => ({
            youtubeId: `v${index}`,
            name: `Video ${index}`,
            durationSeconds: 60,
          })),
        })}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('YouTube Playlist (PL6789)')).toBeInTheDocument()
    expect(screen.getByText('Playlist · 12 videos')).toBeInTheDocument()
  })

  it('exposes a trash control and has no checkbox', () => {
    const onDelete = vi.fn()
    render(
      <SoundscapeTrackCard
        track={makeTrack({ id: 'local-1', name: 'Thunderous Downpour' })}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByRole('button', { name: /trash|delete/i })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('previews inline via audioPreview without a mini player', async () => {
    const user = userEvent.setup()
    render(
      <SoundscapeTrackCard
        track={makeTrack({ id: 'local-1', name: 'Thunderous Downpour' })}
        onDelete={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /preview thunderous downpour/i }))

    expect(audioPreviewMock.play).toHaveBeenCalledWith(
      'local-1',
      '/audio/local-1.mp3',
      'Thunderous Downpour',
    )
    expect(screen.getByTestId('soundscape-track-card')).toHaveAttribute(
      'data-track-card-preview-state',
      'playing',
    )
    expect(screen.queryByTestId('mini-player')).not.toBeInTheDocument()
    expect(document.querySelector('[data-mini-player]')).toBeNull()
  })

  it('calls onDelete when trash is activated', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <SoundscapeTrackCard
        track={makeTrack({ id: 'local-1', name: 'Thunderous Downpour' })}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: /trash|delete/i }))
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
