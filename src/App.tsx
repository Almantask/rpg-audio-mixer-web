import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Home } from './pages/Home';
import { Campaigns } from './pages/Campaigns';
import { CampaignSessions } from './pages/CampaignSessions';
import { Scenes } from './pages/Scenes';
import { SessionScenes } from './pages/SessionScenes';
import { ActiveScene } from './pages/ActiveScene';
import { Library } from './pages/Library';
import { CategoryComposer } from './pages/CategoryComposer';
import { Credits } from './pages/Credits';
import { Trash } from './pages/Trash';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:campaignId/sessions" element={<CampaignSessions />} />
          <Route path="/campaigns/:campaignId/sessions/:sessionId/scenes" element={<SessionScenes />} />
          <Route path="/campaigns/:campaignId/sessions/:sessionId/scenes/:sceneId" element={<ActiveScene />} />
          <Route path="/scenes" element={<Scenes />} />
          <Route path="/scenes/:sceneId" element={<ActiveScene />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/soundscapes/:categoryId/compose" element={<CategoryComposer />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/trash" element={<Trash />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
