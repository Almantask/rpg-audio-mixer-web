import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CampaignSessionsPage } from './pages/CampaignSessionsPage'
import { ScenesPage } from './pages/ScenesPage'
import { SessionScenesPage } from './pages/SessionScenesPage'
import { ActiveScenePage } from './pages/ActiveScenePage'
import { LibraryPage } from './pages/LibraryPage'
import { CreditsPage } from './pages/CreditsPage'
import { TrashPage } from './pages/TrashPage'

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:campaignId" element={<CampaignSessionsPage />} />
          <Route path="/campaigns/:campaignId/sessions/:sessionId" element={<SessionScenesPage />} />
          <Route path="/campaigns/:campaignId/sessions/:sessionId/scenes/:sceneId" element={<ActiveScenePage />} />
          <Route path="/scenes" element={<ScenesPage />} />
          <Route path="/scenes/:sceneId" element={<ActiveScenePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/trash" element={<TrashPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
export default App
