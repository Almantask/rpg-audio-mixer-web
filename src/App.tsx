import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { ActiveCampaignsPage } from './pages/ActiveCampaignsPage'
import { CampaignSessionsPage } from './pages/CampaignSessionsPage'
import { SessionScenesPage } from './pages/SessionScenesPage'
import { GlobalScenesPage } from './pages/GlobalScenesPage'
import { ActiveScenePage } from './pages/ActiveScenePage'
import { LibraryPage } from './pages/LibraryPage'
import { CreditsPage } from './pages/CreditsPage'
import { TrashPage } from './pages/TrashPage'

export const App: React.FC = () => {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/campaigns" element={<ActiveCampaignsPage />} />
        <Route path="/campaigns/:campaignId/sessions" element={<CampaignSessionsPage />} />
        <Route
          path="/campaigns/:campaignId/sessions/:sessionId/scenes"
          element={<SessionScenesPage />}
        />
        <Route path="/scenes" element={<GlobalScenesPage />} />
        <Route path="/scenes/:sceneId" element={<ActiveScenePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/trash" element={<TrashPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
