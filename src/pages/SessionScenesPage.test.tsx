import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { SessionScenesPage } from '@/pages/SessionScenesPage'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { ToastProvider } from '@/components/shared/ToastProvider'
import { saveAppData } from '@/lib/campaignStorage'
import { EMPTY_APP_DATA, type Campaign, type Session } from '@/types/campaign'
import type { Scene, SessionSceneLink } from '@/types/scene'

const CAMPAIGN_ID = 'campaign-echoes'
const SESSION_ID = 'session-1'

function buildCampaign(name: string): Campaign {
  const now = new Date().toISOString()
  return {
    id: CAMPAIGN_ID,
    name,
    createdAt: now,
    lastPlayedAt: now,
  }
}

function buildSession(
  name: string,
  number = 1,
  overrides: Partial<Session> = {},
): Session {
  return {
    id: SESSION_ID,
    campaignId: CAMPAIGN_ID,
    name,
    number,
    date: '2026-01-01',
    sceneCount: 0,
    ...overrides,
  }
}

function buildScene(name: string): Scene {
  const now = new Date().toISOString()
  return {
    id: `scene-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    tags: [],
    createdAt: now,
    lastUsedAt: now,
  }
}

function buildLink(sceneId: string): SessionSceneLink {
  return {
    id: `link-${sceneId}`,
    sessionId: SESSION_ID,
    sceneId,
    linkedAt: new Date().toISOString(),
  }
}

function renderSessionScenesPage() {
  return render(
    <MemoryRouter initialEntries={[`/campaigns/${CAMPAIGN_ID}/sessions/${SESSION_ID}/scenes`]}>
      <CampaignDataProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/campaigns/:campaignId/sessions/:sessionId/scenes"
              element={<SessionScenesPage />}
            />
            <Route path="/scenes" element={<div>Global Scenes</div>} />
          </Routes>
        </ToastProvider>
      </CampaignDataProvider>
    </MemoryRouter>,
  )
}

function seedEmptySession(overrides: Partial<Session> = {}) {
  saveAppData({
    ...EMPTY_APP_DATA,
    campaigns: [buildCampaign('Echoes of the Void')],
    sessions: [buildSession('Opening Night', 1, overrides)],
  })
}

function seedLinkedScene(sceneName: string) {
  const scene = buildScene(sceneName)
  saveAppData({
    ...EMPTY_APP_DATA,
    campaigns: [buildCampaign('Echoes of the Void')],
    sessions: [{ ...buildSession('Opening Night'), sceneCount: 1 }],
    scenes: [scene],
    sessionSceneLinks: [buildLink(scene.id)],
  })
  return scene
}

describe('SessionScenesPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('shows the session description under the page title', () => {
    seedEmptySession({ description: 'The party climbs the windy ridge' })
    renderSessionScenesPage()

    expect(screen.getByRole('heading', { level: 2, name: 'Session 1 – Opening Night' })).toBeInTheDocument()
    expect(screen.getByText('The party climbs the windy ridge')).toBeInTheDocument()
    expect(screen.queryByText('Session Scenes')).not.toBeInTheDocument()
  })

  it('omits the subtitle when the session has no description', () => {
    seedEmptySession()
    renderSessionScenesPage()

    expect(screen.getByRole('heading', { level: 2, name: 'Session 1 – Opening Night' })).toBeInTheDocument()
    expect(screen.queryByText('Session Scenes')).not.toBeInTheDocument()
  })

  it('shows New Scene to the left of Import Scene in the empty state', () => {
    seedEmptySession()
    renderSessionScenesPage()

    const screenRoot = screen.getByRole('region', { name: 'Session Scenes screen' })
    const newScene = within(screenRoot).getByRole('button', { name: 'New Scene' })
    const importScene = within(screenRoot).getByRole('button', { name: 'Import Scene' })

    expect(screen.getByText('No scenes in this session yet')).toBeInTheDocument()
    expect(
      newScene.compareDocumentPosition(importScene) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('shows New Scene to the left of Import Scene on a populated list', () => {
    seedLinkedScene('Tavern')
    renderSessionScenesPage()

    const newScene = screen.getByRole('button', { name: 'New Scene' })
    const importScene = screen.getByRole('button', { name: 'Import Scene' })

    expect(screen.getByText('Tavern')).toBeInTheDocument()
    expect(
      newScene.compareDocumentPosition(importScene) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('opens the New Scene create dialog from Session Scenes', async () => {
    seedEmptySession()
    const user = userEvent.setup()
    renderSessionScenesPage()

    await user.click(screen.getByRole('button', { name: 'New Scene' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'New Scene' })).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Scene name')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Scene description')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Background image')).toBeInTheDocument()
  })

  it('creates a scene, auto-links it, and stays on Session Scenes', async () => {
    seedEmptySession()
    const user = userEvent.setup()
    renderSessionScenesPage()

    await user.click(screen.getByRole('button', { name: 'New Scene' }))
    await user.type(screen.getByLabelText('Scene name'), 'Tavern')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByText('Tavern')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Session Scenes screen' })).toBeInTheDocument()
    expect(screen.queryByText('Global Scenes')).not.toBeInTheDocument()

    const stored = JSON.parse(window.localStorage.getItem('arcanum-audio-data') ?? '{}') as {
      scenes: Scene[]
      sessionSceneLinks: SessionSceneLink[]
    }
    const created = stored.scenes.find((scene) => scene.name === 'Tavern')
    expect(created).toBeDefined()
    expect(
      stored.sessionSceneLinks.some(
        (link) => link.sessionId === SESSION_ID && link.sceneId === created?.id,
      ),
    ).toBe(true)
  })

  it('duplicates a session scene and auto-links the copy', async () => {
    seedLinkedScene('Forest Night')
    const user = userEvent.setup()
    renderSessionScenesPage()

    await user.click(screen.getByRole('button', { name: 'Duplicate Forest Night' }))

    expect(screen.getByText('Copy of Forest Night')).toBeInTheDocument()
    expect(screen.getByText('Forest Night')).toBeInTheDocument()

    const stored = JSON.parse(window.localStorage.getItem('arcanum-audio-data') ?? '{}') as {
      scenes: Scene[]
      sessionSceneLinks: SessionSceneLink[]
    }
    const copy = stored.scenes.find((scene) => scene.name === 'Copy of Forest Night')
    expect(copy).toBeDefined()
    expect(
      stored.sessionSceneLinks.some(
        (link) => link.sessionId === SESSION_ID && link.sceneId === copy?.id,
      ),
    ).toBe(true)
  })
})
