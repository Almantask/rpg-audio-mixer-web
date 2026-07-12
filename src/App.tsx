import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ActiveScenePage } from '@/pages/ActiveScenePage'
import { CampaignSessionsPage } from '@/pages/CampaignSessionsPage'
import { CampaignsPage } from '@/pages/CampaignsPage'
import { CreditsPage } from '@/pages/CreditsPage'
import { AttributionsPage } from '@/pages/AttributionsPage'
import { LegalPrivacyPage } from '@/pages/LegalPrivacyPage'
import { LegalTermsPage } from '@/pages/LegalTermsPage'
import { HomePage } from '@/pages/HomePage'
import { CategoryComposerPage } from '@/pages/CategoryComposerPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { ScenesPage } from '@/pages/ScenesPage'
import { SessionScenesPage } from '@/pages/SessionScenesPage'
import { TrashPage } from '@/pages/TrashPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />} path="/">
        <Route element={<HomePage />} index />
        <Route element={<CampaignsPage />} path="campaigns" />
        <Route element={<CampaignSessionsPage />} path="campaigns/:campaignId/sessions" />
        <Route
          element={<SessionScenesPage />}
          path="campaigns/:campaignId/sessions/:sessionId/scenes"
        />
        <Route element={<ScenesPage />} path="scenes" />
        <Route element={<ActiveScenePage />} path="scenes/:sceneId" />
        <Route element={<LibraryPage />} path="library" />
        <Route
          element={<CategoryComposerPage />}
          path="library/soundscapes/:categoryId/compose"
        />
        <Route element={<CreditsPage />} path="credits" />
        <Route element={<AttributionsPage />} path="credits/attributions" />
        <Route element={<LegalTermsPage />} path="legal/terms" />
        <Route element={<LegalPrivacyPage />} path="legal/privacy" />
        <Route element={<TrashPage />} path="trash" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Route>
    </Routes>
  )
}
