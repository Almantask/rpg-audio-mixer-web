import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CampaignSessionsPage } from './pages/CampaignSessionsPage'
import { ScenesPage } from './pages/ScenesPage'
import { SessionScenesPage } from './pages/SessionScenesPage'
import { ActiveScenePage } from './pages/ActiveScenePage'
import { AudioLibraryPage } from './pages/AudioLibraryPage'
import { CreditsPage } from './pages/CreditsPage'
import { TrashPage } from './pages/TrashPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/scenes" element={<ScenesPage />} />
          <Route path="/library" element={<AudioLibraryPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/trash" element={<TrashPage />} />
          <Route path="/scenes/:sceneId" element={<ActiveScenePage />} />
        </Route>

        {/* Campaign Drill-down Routes (Keep 'Campaigns' highlighted in sidebar) */}
        <Route element={<AppLayout activeSidebarOverride="/campaigns" />}>
          <Route path="/campaigns/:campaignId/sessions" element={<CampaignSessionsPage />} />
          <Route path="/campaigns/:campaignId/sessions/:sessionId/scenes" element={<SessionScenesPage />} />
          <Route path="/campaigns/:campaignId/sessions/:sessionId/scenes/:sceneId" element={<ActiveScenePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
