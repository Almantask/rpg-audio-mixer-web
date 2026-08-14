import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CampaignSessionsPage } from './pages/CampaignSessionsPage'
import { SessionScenesPage } from './pages/SessionScenesPage'
import { ScenesPage } from './pages/ScenesPage'
import { ActiveScenePage } from './pages/ActiveScenePage'
import { LibraryPage } from './pages/LibraryPage'
import { CreditsPage } from './pages/CreditsPage'
import { TrashPage } from './pages/TrashPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:campaignId/sessions" element={<CampaignSessionsPage />} />
          <Route path="/campaigns/:campaignId/sessions/:sessionId/scenes" element={<SessionScenesPage />} />
          <Route path="/scenes" element={<ScenesPage />} />
          <Route path="/scenes/:sceneId" element={<ActiveScenePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/trash" element={<TrashPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
