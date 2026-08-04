import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'

import { HomeView } from './views/HomeView'
import { CampaignsView } from './views/CampaignsView'
import { CampaignSessionsView } from './views/CampaignSessionsView'
import { SessionScenesView } from './views/SessionScenesView'
import { GlobalScenesView } from './views/GlobalScenesView'
import { ActiveSceneView } from './views/ActiveSceneView'
import { LibraryView } from './views/LibraryView'
import { CategoryComposerView } from './views/CategoryComposerView'
import { CreditsView } from './views/CreditsView'
import { TrashView } from './views/TrashView'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/campaigns" element={<CampaignsView />} />
            <Route path="/campaigns/:campaignId/sessions" element={<CampaignSessionsView />} />
            <Route
              path="/campaigns/:campaignId/sessions/:sessionId/scenes"
              element={<SessionScenesView />}
            />
            <Route path="/scenes" element={<GlobalScenesView />} />
            <Route path="/scenes/:sceneId" element={<ActiveSceneView />} />
            <Route path="/library" element={<LibraryView />} />
            <Route
              path="/library/soundscapes/:categoryId/compose"
              element={<CategoryComposerView />}
            />
            <Route path="/credits" element={<CreditsView />} />
            <Route path="/trash" element={<TrashView />} />
          </Routes>
        </AppShell>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
