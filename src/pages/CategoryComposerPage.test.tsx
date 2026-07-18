import { render, screen } from '@testing-library/react'
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
    levels: { I: [], II: [], III: [] },
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

vi.mock('@/context/CampaignDataContext', () => ({
  useCampaignData: () => ({
    data: {
      soundscapeCategories: [fixture.category],
      soundscapeTracks: [fixture.track],
    },
    e2e: { fxLibraryState: 'ready' },
    importSoundscapeTrack: vi.fn(),
    updateSoundscapeCategory: vi.fn(),
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
})
