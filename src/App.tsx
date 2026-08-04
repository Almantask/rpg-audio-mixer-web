import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'

import { HomePage } from './pages/HomePage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CampaignSessionsPage } from './pages/CampaignSessionsPage'
import { ScenesCatalogPage } from './pages/ScenesCatalogPage'
import { SessionScenesPage } from './pages/SessionScenesPage'
import { ActiveScenePage } from './pages/ActiveScenePage'
import { LibraryPage } from './pages/LibraryPage'
import { CategoryComposerPage } from './pages/CategoryComposerPage'
import { TrashPage } from './pages/TrashPage'
import { CreditsPage } from './pages/CreditsPage'
import { LegalPage } from './pages/LegalPage'

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
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
            <Route path="/scenes" element={<ScenesCatalogPage />} />
            <Route path="/scenes/:sceneId" element={<ActiveScenePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route
              path="/library/soundscapes/:categoryId/compose"
              element={<CategoryComposerPage />}
            />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/credits/attributions" element={<LegalPage />} />
            <Route path="/legal/:docType" element={<LegalPage />} />
            <Route path="/trash" element={<TrashPage />} />
          </Routes>
        </AppShell>
      </Router>
    </AppProvider>
  )
}

export default App
