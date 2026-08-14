import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CampaignSessionsPage } from './pages/CampaignSessionsPage'
import { SessionScenesPage } from './pages/SessionScenesPage'
import { ScenesPage } from './pages/ScenesPage'
import { ActiveScenePage } from './pages/ActiveScenePage'
import { LibraryPage } from './pages/LibraryPage'
import { CreditsPage } from './pages/CreditsPage'
import { AttributionsPage } from './pages/AttributionsPage'
import { TermsPage, PrivacyPage } from './pages/LegalPages'
import { TrashPage } from './pages/TrashPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:campaignId/sessions" element={<CampaignSessionsPage />} />
          <Route path="/campaigns/:campaignId/sessions/:sessionId/scenes" element={<SessionScenesPage />} />
          <Route path="/scenes" element={<ScenesPage />} />
          <Route path="/scenes/:sceneId" element={<ActiveScenePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/credits/attributions" element={<AttributionsPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          <Route path="/trash" element={<TrashPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
