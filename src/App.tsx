import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ActiveScenePage } from '@/pages/ActiveScenePage'
import { CampaignsPage } from '@/pages/CampaignsPage'
import { CampaignSessionsPage } from '@/pages/CampaignSessionsPage'
import { AttributionsPage } from '@/pages/AttributionsPage'
import { CreditsPage } from '@/pages/CreditsPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { HomePage } from '@/pages/HomePage'
import { LibraryPage, StorefrontPage } from '@/pages/LibraryPage'
import { CategoryComposerPage } from '@/pages/CategoryComposerPage'
import { ScenesPage } from '@/pages/ScenesPage'
import { SessionScenesPage } from '@/pages/SessionScenesPage'
import { TrashPage } from '@/pages/TrashPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      {
        path: 'campaigns/:campaignId/sessions/:sessionId/scenes',
        element: <SessionScenesPage />,
      },
      { path: 'campaigns/:campaignId/sessions', element: <CampaignSessionsPage /> },
      { path: 'scenes', element: <ScenesPage /> },
      { path: 'scenes/:sceneId/active', element: <ActiveScenePage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'library/soundscapes/:categoryId/compose', element: <CategoryComposerPage /> },
      { path: 'storefront', element: <StorefrontPage /> },
      { path: 'credits', element: <CreditsPage /> },
      { path: 'credits/attributions', element: <AttributionsPage /> },
      { path: 'legal/terms', element: <TermsPage /> },
      { path: 'legal/privacy', element: <PrivacyPage /> },
      { path: 'trash', element: <TrashPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}
