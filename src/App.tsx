import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ActiveScenePage } from '@/pages/ActiveScenePage'
import { CampaignsPage } from '@/pages/CampaignsPage'
import { CampaignSessionsPage } from '@/pages/CampaignSessionsPage'
import { CreditsPage } from '@/pages/CreditsPage'
import { HomePage } from '@/pages/HomePage'
import { LibraryPage, StorefrontPage } from '@/pages/LibraryPage'
import { ScenesPage } from '@/pages/ScenesPage'
import { SessionScenesPage } from '@/pages/SessionScenesPage'
import { TrashPage } from '@/pages/TrashPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route
            path="campaigns/:campaignId/sessions/:sessionId/scenes"
            element={<SessionScenesPage />}
          />
          <Route path="campaigns/:campaignId/sessions" element={<CampaignSessionsPage />} />
          <Route path="scenes" element={<ScenesPage />} />
          <Route path="scenes/:sceneId/active" element={<ActiveScenePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="storefront" element={<StorefrontPage />} />
          <Route path="credits" element={<CreditsPage />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
