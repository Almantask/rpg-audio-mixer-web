import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SoundscapePickerModal } from '@/components/active-scene/SoundscapePickerModal'

const categories = [
  {
    id: 'category-weather',
    name: 'Weather',
    trackCount: 12,
    type: 'WEATHER',
    levels: { I: ['t1'], II: ['t2', 't3'], III: ['t4'] },
  },
  {
    id: 'category-tavern',
    name: 'Tavern',
    trackCount: 8,
    type: 'TOWN',
    levels: { I: ['t5'], II: ['t6'], III: [] },
  },
]

vi.mock('@/lib/audioPreview', () => ({
  audioPreview: {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    isPlaying: vi.fn(() => false),
    getCurrentTrackId: vi.fn(() => null),
    subscribe: vi.fn((listener: (id: string | null, name: string | null, playing: boolean) => void) => {
      listener(null, null, false)
      return () => undefined
    }),
  },
}))

describe('SoundscapePickerModal', () => {
  it('renders the picker header and acquisition actions', () => {
    render(
      <SoundscapePickerModal
        open
        onOpenChange={() => undefined}
        categories={categories}
        tracks={[]}
        excludedCategoryIds={[]}
        onAddSelected={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Add Soundscape' })).toBeInTheDocument()
    expect(screen.getByText('Select soundscapes for this scene.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buy Composition' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Free Compositions' })).toBeInTheDocument()
  })

  it('enables Add Selected after checking categories', async () => {
    const user = userEvent.setup()
    const onAddSelected = vi.fn()

    render(
      <SoundscapePickerModal
        open
        onOpenChange={() => undefined}
        categories={categories}
        tracks={[]}
        excludedCategoryIds={[]}
        onAddSelected={onAddSelected}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Add Selected (0)' })
    expect(addButton).toBeDisabled()

    await user.click(screen.getByLabelText('Select Weather'))
    expect(screen.getByRole('button', { name: 'Add Selected (1)' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Add Selected (1)' }))
    expect(onAddSelected).toHaveBeenCalledWith(['category-weather'])
  })

  it('omits categories already on the scene', () => {
    render(
      <SoundscapePickerModal
        open
        onOpenChange={() => undefined}
        categories={categories}
        tracks={[]}
        excludedCategoryIds={['category-weather']}
        onAddSelected={() => undefined}
      />,
    )

    const pickerGrid = document.querySelector('[data-sc-picker-grid]') as HTMLElement
    expect(pickerGrid.querySelector('[data-sc-picker-item="Weather"]')).toBeNull()
    expect(within(pickerGrid).getByText('Tavern')).toBeVisible()
  })
})
