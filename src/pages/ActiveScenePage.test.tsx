import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActiveScenePage } from '@/pages/ActiveScenePage'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { ToastProvider } from '@/components/shared/ToastProvider'
import { EMPTY_APP_DATA } from '@/types/campaign'
import { saveAppData } from '@/lib/campaignStorage'

vi.mock('@/context/SceneAudioContext', () => ({
  SceneAudioProvider: ({ children }: { children: ReactNode }) => children,
  useSceneAudio: () => ({
    playback: {
      soundboard: {},
      soundscapes: {},
      soundboardMasterVolume: 100,
      soundscapeMasterVolume: 100,
      soundscapeMuted: false,
    },
    triggerSoundboard: vi.fn(),
    stopSoundboardFx: vi.fn(),
    playSoundscape: vi.fn(),
    pauseSoundscape: vi.fn(),
    rollSoundscapeRandom: vi.fn(),
    playScene: vi.fn(),
    stopAll: vi.fn(),
    setSoundboardMasterVolume: vi.fn(),
    setSoundscapeMasterVolume: vi.fn(),
    setSoundscapeMuted: vi.fn(),
    updateSlotVolume: vi.fn(),
    updateSlotIntensity: vi.fn(),
    canPlaySoundscape: () => false,
    hasLoadedSoundscapeTrack: () => false,
    isSoundboardPlaying: () => false,
    getSoundscapeTileState: () => undefined,
    setFocusedSoundscapeSlot: vi.fn(),
  }),
}))

describe('ActiveScenePage header', () => {
  beforeEach(() => {
    const now = new Date().toISOString()
    saveAppData({
      ...EMPTY_APP_DATA,
      scenes: [
        {
          id: 'scene-tavern',
          name: 'Tavern',
          tags: [],
          createdAt: now,
          lastUsedAt: now,
        },
      ],
    })
  })

  function renderActiveScene() {
    const router = createMemoryRouter(
      [
        {
          path: '/scenes/:sceneId/active',
          element: <ActiveScenePage />,
        },
      ],
      { initialEntries: ['/scenes/scene-tavern/active'] },
    )

    render(
      <CampaignDataProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </CampaignDataProvider>,
    )
  }

  it('shows the Scenes eyebrow and scene title without a page subtitle', () => {
    renderActiveScene()

    expect(screen.getByText('Scenes')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tavern' })).toBeInTheDocument()
    expect(
      screen.queryByText('Soundscapes and soundboard controls.'),
    ).not.toBeInTheDocument()
  })

  it('places the session lock on the tabs row and does not show Stop All outside Soundboard', () => {
    renderActiveScene()

    const tabsRow = screen.getByTestId('active-scene-tabs-row')
    const soundboardTab = screen.getByRole('tab', { name: 'Soundboard' })
    const lock = screen.getByRole('button', { name: 'Lock session' })

    expect(tabsRow).toContainElement(screen.getByRole('tab', { name: 'Soundscapes' }))
    expect(tabsRow).toContainElement(soundboardTab)
    expect(tabsRow).toContainElement(lock)
    expect(tabsRow.className).not.toMatch(/justify-between|ml-auto/)
    expect(
      soundboardTab.compareDocumentPosition(lock) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Stop All' })).not.toBeInTheDocument()
  })
})
