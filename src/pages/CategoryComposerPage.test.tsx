import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CategoryComposerPage } from '@/pages/CategoryComposerPage'

type PreviewListener = (
  trackId: string | null,
  trackName: string | null,
  playing: boolean,
) => void

const fixture = vi.hoisted(() => ({
  category: {
    id: 'category-1',
    name: 'Woodland',
    trackCount: 0,
    levels: { I: [] as string[], II: [] as string[], III: [] as string[] },
  },
  track: {
    id: 'track-1',
    name: 'Forest Rain',
    durationSeconds: 125,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: '/audio/forest-rain.mp3',
    createdAt: '2026-07-12T00:00:00.000Z',
  },
  categoriesList: [] as any[],
  tracksList: [] as any[],
}))

const audioPreviewMock = vi.hoisted(() => {
  let listener: PreviewListener | undefined

  return {
    play: vi.fn((trackId: string, _audioUrl: string, trackName: string) => {
      listener?.(trackId, trackName, true)
    }),
    pause: vi.fn(() => listener?.(null, null, false)),
    stop: vi.fn(() => listener?.(null, null, false)),
    subscribe: vi.fn((nextListener: PreviewListener) => {
      listener = nextListener
      nextListener(null, null, false)
      return () => {
        if (listener === nextListener) listener = undefined
      }
    }),
  }
})

const importYoutubeTrackMock = vi.fn((name, url, isPlaylist, playlistVideos) => ({
  id: 'track-yt-mock',
  name,
  durationSeconds: 180,
  format: 'YouTube',
  channels: 'Stereo',
  audioUrl: url,
  createdAt: new Date().toISOString(),
  type: isPlaylist ? 'youtube-playlist' : 'youtube',
  isOfflineReady: false,
  playlistVideos,
}))
const updateSoundscapeTrackMock = vi.fn()

vi.mock('@/context/CampaignDataContext', () => ({
  useCampaignData: () => ({
    data: {
      soundscapeCategories: fixture.categoriesList,
      soundscapeTracks: fixture.tracksList,
      sceneSoundscapeSlots: [],
    },
    e2e: { fxLibraryState: 'ready' },
    importSoundscapeTrack: vi.fn(),
    importYoutubeTrack: importYoutubeTrackMock,
    updateSoundscapeTrack: updateSoundscapeTrackMock,
    updateSoundscapeCategory: vi.fn(),
    updateSoundscapeSlot: vi.fn(),
  }),
}))

vi.mock('@/components/shared/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

vi.mock('@/lib/audioPreview', () => ({
  audioPreview: audioPreviewMock,
}))

function renderComposer() {
  return render(
    <MemoryRouter initialEntries={['/library/categories/category-1/compose']}>
      <Routes>
        <Route
          path="/library/categories/:categoryId/compose"
          element={<CategoryComposerPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

async function openTrackPicker() {
  const user = userEvent.setup()
  renderComposer()
  await user.click(screen.getByRole('button', { name: 'Add track' }))
  return user
}

describe('CategoryComposerPage track picker', () => {
  beforeEach(() => {
    fixture.categoriesList = [fixture.category]
    fixture.tracksList = [fixture.track]
    vi.clearAllMocks()
  })

  it('renders secondary composer actions with an outline', async () => {
    const user = userEvent.setup()
    renderComposer()

    const addTrackButton = screen.getByRole('button', { name: 'Add track' })
    expect(addTrackButton).toHaveClass('border')

    await user.click(addTrackButton)

    expect(screen.getByRole('button', { name: 'Import' })).toHaveClass('border')
  })

  it('previews from the named track body without selecting it', async () => {
    const user = await openTrackPicker()
    const previewControl = screen.getByRole('button', {
      name: 'Preview Forest Rain',
    })

    expect(previewControl.closest('[data-picker-track]')).toHaveAttribute(
      'data-picker-track',
      'Forest Rain',
    )

    await user.click(previewControl)

    expect(audioPreviewMock.play).toHaveBeenCalledWith(
      'track-1',
      '/audio/forest-rain.mp3',
      'Forest Rain',
    )
    expect(
      screen.getByRole('button', { name: 'Pause preview Forest Rain' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Add Selected (0)' })).toBeDisabled()
  })

  it('selects from the checkbox without starting a preview', async () => {
    const user = await openTrackPicker()
    const checkbox = screen.getByRole('checkbox')

    await user.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(audioPreviewMock.play).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Add Selected (1)' })).toBeEnabled()
  })

  it('imports YouTube video URL successfully', async () => {
    const user = await openTrackPicker()
    const input = screen.getByPlaceholderText('Paste YouTube Video or Playlist URL…')
    const button = screen.getByRole('button', { name: 'Import YouTube' })

    await user.type(input, 'https://www.youtube.com/watch?v=12345')
    await user.click(button)

    await waitFor(() => {
      expect(importYoutubeTrackMock).toHaveBeenCalledWith(
        'YouTube Video 12345',
        'https://www.youtube.com/watch?v=12345',
        false,
        undefined,
        '12345',
      )
    })
  })

  it('presents live-linked vs snapshot dialog for YouTube playlist URL', async () => {
    const user = await openTrackPicker()
    const input = screen.getByPlaceholderText('Paste YouTube Video or Playlist URL…')
    const button = screen.getByRole('button', { name: 'Import YouTube' })

    await user.type(input, 'https://www.youtube.com/playlist?list=PL6789')
    await user.click(button)

    expect(screen.getByText('Attach YouTube Playlist')).toBeInTheDocument()

    const liveLinkedBtn = screen.getByRole('button', {
      name: 'Keep linked to YouTube (Live-linked)',
    })
    await user.click(liveLinkedBtn)

    await waitFor(() => {
      expect(importYoutubeTrackMock).toHaveBeenCalledWith(
        'YouTube Playlist (PL6789)',
        'https://www.youtube.com/playlist?list=PL6789',
        true,
        expect.arrayContaining([
          expect.objectContaining({ name: 'Playlist Video A (PL678)' }),
        ]),
      )
    })
  })

  it('toggles Make Offline-Ready on YouTube tracks', async () => {
    const user = userEvent.setup()
    
    // Add YouTube track to level I in the category
    fixture.category.levels = { I: ['track-yt'], II: [], III: [] }
    fixture.category.trackCount = 1
    
    const ytTrack = {
      id: 'track-yt',
      name: 'Cave Ambient',
      durationSeconds: 180,
      format: 'YouTube',
      channels: 'Stereo',
      audioUrl: 'https://youtube.com/watch?v=cave',
      createdAt: '2026-07-12T00:00:00.000Z',
      type: 'youtube' as const,
      isOfflineReady: false,
    }
    fixture.tracksList = [fixture.track, ytTrack]
    
    renderComposer()
    
    expect(screen.getByText('Cave Ambient')).toBeInTheDocument()
    
    const offlineBtn = screen.getByRole('button', { name: 'Make Offline-Ready' })
    await user.click(offlineBtn)
    
    expect(updateSoundscapeTrackMock).toHaveBeenCalledWith('track-yt', { isOfflineReady: true })
  })
})
