import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'

import { HomePage } from './pages/HomePage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CampaignSessionsPage } from './pages/CampaignSessionsPage'
import { SessionScenesPage } from './pages/SessionScenesPage'
import { ScenesPage } from './pages/ScenesPage'
import { ActiveScenePage } from './pages/ActiveScenePage'
import { LibraryPage } from './pages/LibraryPage'
import { CategoryComposerPage } from './pages/CategoryComposerPage'
import { CreditsPage } from './pages/CreditsPage'
import { TrashPage } from './pages/TrashPage'

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:campaignId/sessions" element={<CampaignSessionsPage />} />
          <Route
            path="/campaigns/:campaignId/sessions/:sessionId/scenes"
            element={<SessionScenesPage />}
          />
          <Route
            path="/campaigns/:campaignId/sessions/:sessionId/scenes/:sceneId"
            element={<ActiveScenePage />}
          />
          <Route path="/scenes" element={<ScenesPage />} />
          <Route path="/scenes/:sceneId" element={<ActiveScenePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/composer" element={<CategoryComposerPage />} />
          <Route path="/library/composer/:categoryId" element={<CategoryComposerPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/trash" element={<TrashPage />} />
        </Routes>
      </AppShell>
    </AppProvider>
  )
}

export default App
