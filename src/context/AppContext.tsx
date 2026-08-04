import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  Campaign,
  Session,
  Scene,
  SessionScene,
  SoundscapeCategory,
  CategoryTrack,
  FxTrack,
  SceneSoundscape,
  SceneFxTile,
  TrashItem,
  EntityType
} from '../types';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'error';
  message: string;
}

interface AppContextType {
  campaigns: Campaign[];
  sessions: Session[];
  scenes: Scene[];
  sessionScenes: SessionScene[];
  soundscapeCategories: SoundscapeCategory[];
  categoryTracks: CategoryTrack[];
  fxTracks: FxTrack[];
  sceneSoundscapes: SceneSoundscape[];
  sceneFxTiles: SceneFxTile[];
  trashItems: TrashItem[];
  toasts: ToastMessage[];

  // Active scene audio playback & ducking state
  masterVolume: number;
  isMasterPlaying: boolean;
  isDucked: boolean;
  activePlayingFxCount: number;

  // Actions
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;

  createCampaign: (data: { title: string; description?: string; coverImage?: string }) => Campaign;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;

  createSession: (data: { campaignId: string; name: string; description?: string; coverImage?: string }) => Session;
  updateSession: (id: string, data: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  touchSession: (id: string) => void;

  createScene: (data: { name: string; description?: string; backgroundImage?: string; tags?: string[] }) => Scene;
  updateScene: (id: string, data: Partial<Scene>) => void;
  duplicateScene: (id: string) => Scene;
  deleteScene: (id: string) => void;

  linkSceneToSession: (sessionId: string, sceneId: string) => void;
  unlinkSceneFromSession: (sessionId: string, sceneId: string) => void;

  createSoundscapeCategory: (data: { name: string; description?: string; coverImage?: string }) => SoundscapeCategory;
  deleteSoundscapeCategory: (id: string) => void;
  assignTrackToLevel: (data: { categoryId: string; level: 'I' | 'II' | 'III'; name: string; duration?: string; fileFormat?: string }) => CategoryTrack | null;
  removeTrackFromLevel: (trackId: string) => void;

  importFxTrack: (data: { name: string; category: string; duration?: string; fileFormat?: string }) => FxTrack;
  updateFxTrack: (id: string, data: Partial<FxTrack>) => void;
  deleteFxTrack: (id: string) => void;

  addSoundscapesToScene: (sceneId: string, categoryIds: string[]) => void;
  removeSoundscapeFromScene: (sceneId: string, categoryId: string) => void;
  setCategoryVolume: (sceneId: string, categoryId: string, volume: number) => void;
  setCategoryLevel: (sceneId: string, categoryId: string, level: 'I' | 'II' | 'III') => void;
  toggleCategoryPlay: (sceneId: string, categoryId: string) => void;
  setMasterVolume: (volume: number) => void;
  toggleMasterPlay: () => void;
  rollD20: (sceneId: string) => void;
  saveSceneState: (sceneId: string) => void;

  addFxToScene: (sceneId: string, fxTrackIds: string[]) => void;
  removeFxFromScene: (tileId: string) => void;
  playSceneFxTile: (tileId: string) => void;
  stopSceneFxTile: (tileId: string) => void;
  playFxPreview: (fxTrackId: string) => void;

  restoreTrashItem: (id: string) => void;
  purgeTrashItem: (id: string) => void;
  emptyTrashTab: (type: EntityType) => void;
  restoreAllTrashTab: (type: EntityType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial pre-seeded mock data
const initialCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Shadows of the Underdark',
    description: 'A long-running descent into the dark realm beneath the surface.',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    deletedAt: null
  },
  {
    id: 'camp-2',
    title: 'Echoes of the Void',
    description: 'Whispers from a shattered keep at the edge of reality.',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    deletedAt: null
  },
  {
    id: 'camp-3',
    title: 'New Adventure',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=400',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deletedAt: null
  }
];

const initialSessions: Session[] = [
  {
    id: 'sess-14',
    campaignId: 'camp-1',
    sessionNumber: 14,
    name: 'The Howling Crags',
    description: 'Traversing the jagged peaks in search of the ancient shrine.',
    date: 'Mar 12',
    lastActive: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    deletedAt: null
  },
  {
    id: 'sess-13',
    campaignId: 'camp-1',
    sessionNumber: 13,
    name: 'Sunken Temple',
    description: 'Submerged subterranean ruins.',
    date: 'Feb 28',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    deletedAt: null
  },
  {
    id: 'sess-1',
    campaignId: 'camp-2',
    sessionNumber: 1,
    name: 'Arrival at Oakhaven',
    description: 'First steps into the cursed forest village.',
    date: 'Jan 10',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    deletedAt: null
  }
];

const initialScenes: Scene[] = [
  {
    id: 'scene-1',
    name: "Dragon's Lair",
    description: 'Molten rock, roaring flames, and ancient gold treasures.',
    backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800',
    tags: ['COMBAT', 'BOSS', 'CAVE'],
    isUserOwned: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    deletedAt: null
  },
  {
    id: 'scene-2',
    name: 'The Rusty Tankard',
    description: 'Bustling tavern with laughter, clinking ale mugs, and lute music.',
    backgroundImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800',
    tags: ['TAVERN', 'SOCIAL'],
    isUserOwned: true,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    deletedAt: null
  },
  {
    id: 'scene-3',
    name: 'Whispering Woods',
    description: 'Eerie rustling leaves and distant wolf howls in midnight fog.',
    backgroundImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800',
    tags: ['FOREST', 'EXPLORATION'],
    isUserOwned: true,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    deletedAt: null
  }
];

const initialSessionScenes: SessionScene[] = [
  { sessionId: 'sess-14', sceneId: 'scene-1', lastPlayedAt: new Date().toISOString() },
  { sessionId: 'sess-14', sceneId: 'scene-2' },
  { sessionId: 'sess-14', sceneId: 'scene-3' },
  { sessionId: 'sess-13', sceneId: 'scene-2' }
];

const initialSoundscapeCategories: SoundscapeCategory[] = [
  {
    id: 'sc-1',
    name: 'Meteorological',
    description: 'Thunderstorms, gentle rain, and howling blizzards.',
    coverImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=400',
    isFree: true,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    deletedAt: null
  },
  {
    id: 'sc-2',
    name: 'Tavern Ambience',
    description: 'Crowd chatter, hearth fire crackle, and acoustic folk strings.',
    coverImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=400',
    isFree: true,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    deletedAt: null
  },
  {
    id: 'sc-3',
    name: 'Ethereal Planes',
    description: 'Mystical drone harmonics and otherworldly whispers.',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400',
    isFree: false,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    deletedAt: null
  }
];

const initialCategoryTracks: CategoryTrack[] = [
  { id: 'ct-1', categoryId: 'sc-1', level: 'I', name: 'Gentle Rain Drizzle', duration: '3:42', fileFormat: 'MP3' },
  { id: 'ct-2', categoryId: 'sc-1', level: 'I', name: 'Distant Rolling Thunder', duration: '2:15', fileFormat: 'WAV' },
  { id: 'ct-3', categoryId: 'sc-1', level: 'II', name: 'Heavy Downpour & Gusts', duration: '4:10', fileFormat: 'MP3' },
  { id: 'ct-4', categoryId: 'sc-1', level: 'III', name: 'Violent Tempest & Lightning Strike', duration: '5:01', fileFormat: 'WAV' },
  { id: 'ct-5', categoryId: 'sc-2', level: 'I', name: 'Muffled Hearth & Low Chatter', duration: '2:50', fileFormat: 'MP3' },
  { id: 'ct-6', categoryId: 'sc-2', level: 'II', name: 'Lively Crowd & Clinking Mugs', duration: '3:30', fileFormat: 'MP3' }
];

const initialFxTracks: FxTrack[] = [
  { id: 'fx-1', name: 'Thunder Clap', category: 'Weather', duration: '0:04', fileFormat: 'WAV', isFree: true, plays: 42, createdAt: new Date().toISOString() },
  { id: 'fx-2', name: 'Sword Clash', category: 'Combat', duration: '0:02', fileFormat: 'WAV', isFree: true, plays: 128, createdAt: new Date().toISOString() },
  { id: 'fx-3', name: 'Dragon Roar', category: 'Monsters', duration: '0:06', fileFormat: 'MP3', isFree: true, plays: 95, createdAt: new Date().toISOString() },
  { id: 'fx-4', name: 'Spell Fireball Blast', category: 'Magic', duration: '0:03', fileFormat: 'WAV', isFree: true, plays: 64, createdAt: new Date().toISOString() },
  { id: 'fx-5', name: 'Glass Shatter', category: 'Impacts', duration: '0:01', fileFormat: 'WAV', isFree: true, plays: 30, createdAt: new Date().toISOString() },
  { id: 'fx-6', name: 'Door Creak & Slam', category: 'Environment', duration: '0:03', fileFormat: 'MP3', isFree: true, plays: 18, createdAt: new Date().toISOString() }
];

const initialSceneSoundscapes: SceneSoundscape[] = [
  { sceneId: 'scene-1', categoryId: 'sc-1', volume: 80, activeLevel: 'II', isPlaying: false },
  { sceneId: 'scene-1', categoryId: 'sc-3', volume: 60, activeLevel: 'I', isPlaying: false },
  { sceneId: 'scene-2', categoryId: 'sc-2', volume: 75, activeLevel: 'I', isPlaying: false }
];

const initialSceneFxTiles: SceneFxTile[] = [
  { id: 'tile-1', sceneId: 'scene-1', fxTrackId: 'fx-1', position: 0 },
  { id: 'tile-2', sceneId: 'scene-1', fxTrackId: 'fx-2', position: 1 },
  { id: 'tile-3', sceneId: 'scene-1', fxTrackId: 'fx-3', position: 2 },
  { id: 'tile-4', sceneId: 'scene-2', fxTrackId: 'fx-5', position: 0 }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('arcanum_campaigns');
    return saved ? JSON.parse(saved) : initialCampaigns;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('arcanum_sessions');
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [scenes, setScenes] = useState<Scene[]>(() => {
    const saved = localStorage.getItem('arcanum_scenes');
    return saved ? JSON.parse(saved) : initialScenes;
  });

  const [sessionScenes, setSessionScenes] = useState<SessionScene[]>(() => {
    const saved = localStorage.getItem('arcanum_session_scenes');
    return saved ? JSON.parse(saved) : initialSessionScenes;
  });

  const [soundscapeCategories, setSoundscapeCategories] = useState<SoundscapeCategory[]>(() => {
    const saved = localStorage.getItem('arcanum_soundscapes');
    return saved ? JSON.parse(saved) : initialSoundscapeCategories;
  });

  const [categoryTracks, setCategoryTracks] = useState<CategoryTrack[]>(() => {
    const saved = localStorage.getItem('arcanum_category_tracks');
    return saved ? JSON.parse(saved) : initialCategoryTracks;
  });

  const [fxTracks, setFxTracks] = useState<FxTrack[]>(() => {
    const saved = localStorage.getItem('arcanum_fx_tracks');
    return saved ? JSON.parse(saved) : initialFxTracks;
  });

  const [sceneSoundscapes, setSceneSoundscapes] = useState<SceneSoundscape[]>(() => {
    const saved = localStorage.getItem('arcanum_scene_soundscapes');
    return saved ? JSON.parse(saved) : initialSceneSoundscapes;
  });

  const [sceneFxTiles, setSceneFxTiles] = useState<SceneFxTile[]>(() => {
    const saved = localStorage.getItem('arcanum_scene_fx');
    return saved ? JSON.parse(saved) : initialSceneFxTiles;
  });

  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => {
    const saved = localStorage.getItem('arcanum_trash');
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Audio Engine State
  const [masterVolume, setMasterVolume] = useState<number>(80);
  const [isMasterPlaying, setIsMasterPlaying] = useState<boolean>(false);
  const [isDucked, setIsDucked] = useState<boolean>(false);
  const [activePlayingFxCount, setActivePlayingFxCount] = useState<number>(0);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('arcanum_campaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('arcanum_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('arcanum_scenes', JSON.stringify(scenes)); }, [scenes]);
  useEffect(() => { localStorage.setItem('arcanum_session_scenes', JSON.stringify(sessionScenes)); }, [sessionScenes]);
  useEffect(() => { localStorage.setItem('arcanum_soundscapes', JSON.stringify(soundscapeCategories)); }, [soundscapeCategories]);
  useEffect(() => { localStorage.setItem('arcanum_category_tracks', JSON.stringify(categoryTracks)); }, [categoryTracks]);
  useEffect(() => { localStorage.setItem('arcanum_fx_tracks', JSON.stringify(fxTracks)); }, [fxTracks]);
  useEffect(() => { localStorage.setItem('arcanum_scene_soundscapes', JSON.stringify(sceneSoundscapes)); }, [sceneSoundscapes]);
  useEffect(() => { localStorage.setItem('arcanum_scene_fx', JSON.stringify(sceneFxTiles)); }, [sceneFxTiles]);
  useEffect(() => { localStorage.setItem('arcanum_trash', JSON.stringify(trashItems)); }, [trashItems]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Helper for soft-deleting
  const softDelete = useCallback((id: string, type: EntityType, name: string, data: any) => {
    const item: TrashItem = {
      id,
      type,
      name,
      deletedAt: new Date().toISOString(),
      originalData: data
    };
    setTrashItems(prev => [...prev.filter(i => i.id !== id), item]);
  }, []);

  // CAMPAIGNS
  const createCampaign = useCallback((data: { title: string; description?: string; coverImage?: string }) => {
    const newCamp: Campaign = {
      id: 'camp-' + Date.now(),
      title: data.title,
      description: data.description || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400',
      createdAt: new Date().toISOString(),
      deletedAt: null
    };
    setCampaigns(prev => [newCamp, ...prev]);
    showToast(`Campaign "${newCamp.title}" created`, 'success');
    return newCamp;
  }, [showToast]);

  const updateCampaign = useCallback((id: string, data: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    const target = campaigns.find(c => c.id === id);
    if (!target) return;
    const now = new Date().toISOString();
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, deletedAt: now } : c));
    softDelete(id, 'campaign', target.title, target);
    showToast(`Campaign "${target.title}" moved to Trash`, 'info');
  }, [campaigns, softDelete, showToast]);

  // SESSIONS
  const createSession = useCallback((data: { campaignId: string; name: string; description?: string; coverImage?: string }) => {
    const campSessions = sessions.filter(s => s.campaignId === data.campaignId && !s.deletedAt);
    const sessionNumber = campSessions.length + 1;
    const newSess: Session = {
      id: 'sess-' + Date.now(),
      campaignId: data.campaignId,
      sessionNumber,
      name: data.name,
      description: data.description || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=400',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      createdAt: new Date().toISOString(),
      deletedAt: null
    };
    setSessions(prev => [...prev, newSess]);
    showToast(`Session ${sessionNumber} "${newSess.name}" created`, 'success');
    return newSess;
  }, [sessions, showToast]);

  const updateSession = useCallback((id: string, data: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  const deleteSession = useCallback((id: string) => {
    const target = sessions.find(s => s.id === id);
    if (!target) return;
    const now = new Date().toISOString();
    setSessions(prev => prev.map(s => s.id === id ? { ...s, deletedAt: now } : s));
    softDelete(id, 'session', `Session ${target.sessionNumber} - ${target.name}`, target);
    showToast(`Session "${target.name}" moved to Trash`, 'info');
  }, [sessions, softDelete, showToast]);

  const touchSession = useCallback((id: string) => {
    const now = new Date().toISOString();
    setSessions(prev => prev.map(s => s.id === id ? { ...s, lastActive: now } : s));
  }, []);

  // SCENES
  const createScene = useCallback((data: { name: string; description?: string; backgroundImage?: string; tags?: string[] }) => {
    const newScene: Scene = {
      id: 'scene-' + Date.now(),
      name: data.name,
      description: data.description || '',
      backgroundImage: data.backgroundImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800',
      tags: data.tags || [],
      isUserOwned: true,
      createdAt: new Date().toISOString(),
      deletedAt: null
    };
    setScenes(prev => [newScene, ...prev]);
    showToast(`Scene "${newScene.name}" created`, 'success');
    return newScene;
  }, [showToast]);

  const updateScene = useCallback((id: string, data: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  const duplicateScene = useCallback((id: string) => {
    const source = scenes.find(s => s.id === id);
    if (!source) throw new Error('Scene not found');
    const newScene: Scene = {
      ...source,
      id: 'scene-' + Date.now(),
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      deletedAt: null
    };
    setScenes(prev => [newScene, ...prev]);

    // Duplicate soundscapes and FX tiles
    const sourceSoundscapes = sceneSoundscapes.filter(ss => ss.sceneId === id);
    const newSoundscapes = sourceSoundscapes.map(ss => ({ ...ss, sceneId: newScene.id }));
    setSceneSoundscapes(prev => [...prev, ...newSoundscapes]);

    const sourceFx = sceneFxTiles.filter(tile => tile.sceneId === id);
    const newFx = sourceFx.map(tile => ({ ...tile, id: 'tile-' + Math.random().toString(36).substring(2, 9), sceneId: newScene.id }));
    setSceneFxTiles(prev => [...prev, ...newFx]);

    showToast(`Duplicated "${source.name}"`, 'success');
    return newScene;
  }, [scenes, sceneSoundscapes, sceneFxTiles, showToast]);

  const deleteScene = useCallback((id: string) => {
    const target = scenes.find(s => s.id === id);
    if (!target) return;
    const now = new Date().toISOString();
    setScenes(prev => prev.map(s => s.id === id ? { ...s, deletedAt: now } : s));
    softDelete(id, 'scene', target.name, target);
    showToast(`Scene "${target.name}" moved to Trash`, 'info');
  }, [scenes, softDelete, showToast]);

  const linkSceneToSession = useCallback((sessionId: string, sceneId: string) => {
    setSessionScenes(prev => {
      if (prev.some(ss => ss.sessionId === sessionId && ss.sceneId === sceneId)) return prev;
      return [...prev, { sessionId, sceneId }];
    });
  }, []);

  const unlinkSceneFromSession = useCallback((sessionId: string, sceneId: string) => {
    setSessionScenes(prev => prev.filter(ss => !(ss.sessionId === sessionId && ss.sceneId === sceneId)));
    showToast('Scene unlinked from session', 'info');
  }, [showToast]);

  // SOUNDSCAPE CATEGORIES & COMPOSER
  const createSoundscapeCategory = useCallback((data: { name: string; description?: string; coverImage?: string }) => {
    const newCat: SoundscapeCategory = {
      id: 'sc-' + Date.now(),
      name: data.name,
      description: data.description || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=400',
      isFree: true,
      createdAt: new Date().toISOString(),
      deletedAt: null
    };
    setSoundscapeCategories(prev => [newCat, ...prev]);
    showToast(`Soundscape Category "${newCat.name}" created`, 'success');
    return newCat;
  }, [showToast]);

  const deleteSoundscapeCategory = useCallback((id: string) => {
    const target = soundscapeCategories.find(sc => sc.id === id);
    if (!target) return;
    const now = new Date().toISOString();
    setSoundscapeCategories(prev => prev.map(sc => sc.id === id ? { ...sc, deletedAt: now } : sc));
    softDelete(id, 'soundscape', target.name, target);
    showToast(`Category "${target.name}" moved to Trash`, 'info');
  }, [soundscapeCategories, softDelete, showToast]);

  const assignTrackToLevel = useCallback((data: { categoryId: string; level: 'I' | 'II' | 'III'; name: string; duration?: string; fileFormat?: string }) => {
    // Check duplicate track name within the same level (PW-45 rule)
    const existing = categoryTracks.find(t => t.categoryId === data.categoryId && t.level === data.level && t.name.toLowerCase() === data.name.toLowerCase());
    if (existing) {
      showToast(`Track "${data.name}" is already in Level ${data.level}`, 'error');
      return null;
    }
    const newTrack: CategoryTrack = {
      id: 'ct-' + Date.now() + Math.random().toString(36).substring(2, 5),
      categoryId: data.categoryId,
      level: data.level,
      name: data.name,
      duration: data.duration || '3:00',
      fileFormat: data.fileFormat || 'MP3'
    };
    setCategoryTracks(prev => [...prev, newTrack]);
    showToast(`Track added to Level ${data.level}`, 'success');
    return newTrack;
  }, [categoryTracks, showToast]);

  const removeTrackFromLevel = useCallback((trackId: string) => {
    setCategoryTracks(prev => prev.filter(t => t.id !== trackId));
    showToast('Track removed from level', 'info');
  }, [showToast]);

  // FX TRACKS
  const importFxTrack = useCallback((data: { name: string; category: string; duration?: string; fileFormat?: string }) => {
    const newFx: FxTrack = {
      id: 'fx-' + Date.now(),
      name: data.name,
      category: data.category || 'General',
      duration: data.duration || '0:03',
      fileFormat: data.fileFormat || 'WAV',
      isFree: true,
      plays: 0,
      createdAt: new Date().toISOString(),
      deletedAt: null
    };
    setFxTracks(prev => [newFx, ...prev]);
    showToast(`FX Track "${newFx.name}" imported`, 'success');
    return newFx;
  }, [showToast]);

  const updateFxTrack = useCallback((id: string, data: Partial<FxTrack>) => {
    setFxTracks(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
  }, []);

  const deleteFxTrack = useCallback((id: string) => {
    const target = fxTracks.find(f => f.id === id);
    if (!target) return;
    const now = new Date().toISOString();
    setFxTracks(prev => prev.map(f => f.id === id ? { ...f, deletedAt: now } : f));
    softDelete(id, 'fx', target.name, target);
    showToast(`FX track "${target.name}" moved to Trash`, 'info');
  }, [fxTracks, softDelete, showToast]);

  // ACTIVE SCENE SOUNDSCAPES
  const addSoundscapesToScene = useCallback((sceneId: string, categoryIds: string[]) => {
    let addedCount = 0;
    setSceneSoundscapes(prev => {
      const existingIds = new Set(prev.filter(ss => ss.sceneId === sceneId).map(ss => ss.categoryId));
      const toAdd = categoryIds.filter(id => !existingIds.has(id));
      addedCount = toAdd.length;
      const newItems: SceneSoundscape[] = toAdd.map(categoryId => ({
        sceneId,
        categoryId,
        volume: 75,
        activeLevel: 'I',
        isPlaying: false
      }));
      return [...prev, ...newItems];
    });
    if (addedCount > 0) {
      showToast(`${addedCount} ${addedCount === 1 ? 'category' : 'categories'} added`, 'success');
    }
  }, [showToast]);

  const removeSoundscapeFromScene = useCallback((sceneId: string, categoryId: string) => {
    setSceneSoundscapes(prev => prev.filter(ss => !(ss.sceneId === sceneId && ss.categoryId === categoryId)));
    showToast('Soundscape category removed from scene', 'info');
  }, [showToast]);

  const setCategoryVolume = useCallback((sceneId: string, categoryId: string, volume: number) => {
    setSceneSoundscapes(prev => prev.map(ss => (ss.sceneId === sceneId && ss.categoryId === categoryId) ? { ...ss, volume } : ss));
  }, []);

  const setCategoryLevel = useCallback((sceneId: string, categoryId: string, level: 'I' | 'II' | 'III') => {
    setSceneSoundscapes(prev => prev.map(ss => (ss.sceneId === sceneId && ss.categoryId === categoryId) ? { ...ss, activeLevel: level } : ss));
  }, []);

  const toggleCategoryPlay = useCallback((sceneId: string, categoryId: string) => {
    setSceneSoundscapes(prev => prev.map(ss => {
      if (ss.sceneId === sceneId && ss.categoryId === categoryId) {
        return { ...ss, isPlaying: !ss.isPlaying };
      }
      return ss;
    }));
  }, []);

  const toggleMasterPlay = useCallback(() => {
    setIsMasterPlaying(prev => !prev);
  }, []);

  const rollD20 = useCallback((sceneId: string) => {
    const levels: ('I' | 'II' | 'III')[] = ['I', 'II', 'III'];
    setSceneSoundscapes(prev => prev.map(ss => {
      if (ss.sceneId === sceneId) {
        const randLevel = levels[Math.floor(Math.random() * levels.length)];
        return { ...ss, activeLevel: randLevel };
      }
      return ss;
    }));
    showToast('d20 rolled! Randomized scene intensity levels', 'info');
  }, [showToast]);

  const saveSceneState = useCallback((_sceneId: string) => {
    showToast('Mixer state saved for this scene', 'success');
  }, [showToast]);

  // ACTIVE SCENE FX SOUNDBOARD
  const addFxToScene = useCallback((sceneId: string, fxTrackIds: string[]) => {
    let addedCount = 0;
    setSceneFxTiles(prev => {
      const existingTiles = prev.filter(tile => tile.sceneId === sceneId);
      let nextPos = existingTiles.length;
      const newTiles: SceneFxTile[] = fxTrackIds.map(fxTrackId => {
        addedCount++;
        return {
          id: 'tile-' + Date.now() + Math.random().toString(36).substring(2, 5),
          sceneId,
          fxTrackId,
          position: nextPos++
        };
      });
      return [...prev, ...newTiles];
    });
    if (addedCount > 0) {
      showToast(`${addedCount} ${addedCount === 1 ? 'effect' : 'effects'} added`, 'success');
    }
  }, [showToast]);

  const removeFxFromScene = useCallback((tileId: string) => {
    setSceneFxTiles(prev => prev.filter(tile => tile.id !== tileId));
    showToast('FX tile removed from soundboard', 'info');
  }, [showToast]);

  const playSceneFxTile = useCallback((tileId: string) => {
    // Auto-ducking rule (PW-37): All playing soundscapes duck to 40% volume on any FX trigger, restore when FX ends (simulated 3s)
    setIsDucked(true);
    setActivePlayingFxCount(prev => prev + 1);

    // Update play count
    const tile = sceneFxTiles.find(t => t.id === tileId);
    if (tile) {
      setFxTracks(prev => prev.map(f => f.id === tile.fxTrackId ? { ...f, plays: (f.plays || 0) + 1 } : f));
    }

    setTimeout(() => {
      setActivePlayingFxCount(prev => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setIsDucked(false);
        }
        return next;
      });
    }, 3000);
  }, [sceneFxTiles]);

  const stopSceneFxTile = useCallback((_tileId: string) => {
    setActivePlayingFxCount(0);
    setIsDucked(false);
  }, []);

  const playFxPreview = useCallback((_fxTrackId: string) => {
    showToast('Previewing FX audio...', 'info');
  }, [showToast]);

  // TRASH RESTORE & PURGE
  const restoreTrashItem = useCallback((id: string) => {
    const item = trashItems.find(i => i.id === id);
    if (!item) return;

    // Name collision check rule (F-68 / PW-20): append (restored) if name exists
    if (item.type === 'campaign') {
      let restoreName = item.originalData.title;
      if (campaigns.some(c => !c.deletedAt && c.title === restoreName)) {
        restoreName = `${restoreName} (restored)`;
      }
      setCampaigns(prev => prev.map(c => c.id === item.id ? { ...c, title: restoreName, deletedAt: null } : c));
    } else if (item.type === 'session') {
      let restoreName = item.originalData.name;
      if (sessions.some(s => !s.deletedAt && s.name === restoreName)) {
        restoreName = `${restoreName} (restored)`;
      }
      setSessions(prev => prev.map(s => s.id === item.id ? { ...s, name: restoreName, deletedAt: null } : s));
    } else if (item.type === 'scene') {
      let restoreName = item.originalData.name;
      if (scenes.some(s => !s.deletedAt && s.name === restoreName)) {
        restoreName = `${restoreName} (restored)`;
      }
      setScenes(prev => prev.map(s => s.id === item.id ? { ...s, name: restoreName, deletedAt: null } : s));
    } else if (item.type === 'soundscape') {
      let restoreName = item.originalData.name;
      if (soundscapeCategories.some(sc => !sc.deletedAt && sc.name === restoreName)) {
        restoreName = `${restoreName} (restored)`;
      }
      setSoundscapeCategories(prev => prev.map(sc => sc.id === item.id ? { ...sc, name: restoreName, deletedAt: null } : sc));
    } else if (item.type === 'fx') {
      let restoreName = item.originalData.name;
      if (fxTracks.some(f => !f.deletedAt && f.name === restoreName)) {
        restoreName = `${restoreName} (restored)`;
      }
      setFxTracks(prev => prev.map(f => f.id === item.id ? { ...f, name: restoreName, deletedAt: null } : f));
    }

    setTrashItems(prev => prev.filter(i => i.id !== id));
    showToast(`Restored "${item.name}"`, 'success');
  }, [trashItems, campaigns, sessions, scenes, soundscapeCategories, fxTracks, showToast]);

  const purgeTrashItem = useCallback((id: string) => {
    setTrashItems(prev => prev.filter(i => i.id !== id));
    setCampaigns(prev => prev.filter(c => c.id !== id));
    setSessions(prev => prev.filter(s => s.id !== id));
    setScenes(prev => prev.filter(s => s.id !== id));
    setSoundscapeCategories(prev => prev.filter(sc => sc.id !== id));
    setFxTracks(prev => prev.filter(f => f.id !== id));
    showToast('Item permanently deleted', 'info');
  }, [showToast]);

  const emptyTrashTab = useCallback((type: EntityType) => {
    const targetIds = new Set(trashItems.filter(i => i.type === type).map(i => i.id));
    setTrashItems(prev => prev.filter(i => i.type !== type));
    setCampaigns(prev => prev.filter(c => !targetIds.has(c.id)));
    setSessions(prev => prev.filter(s => !targetIds.has(s.id)));
    setScenes(prev => prev.filter(s => !targetIds.has(s.id)));
    setSoundscapeCategories(prev => prev.filter(sc => !targetIds.has(sc.id)));
    setFxTracks(prev => prev.filter(f => !targetIds.has(f.id)));
    showToast(`Emptied ${type} trash`, 'info');
  }, [trashItems, showToast]);

  const restoreAllTrashTab = useCallback((type: EntityType) => {
    const targetItems = trashItems.filter(i => i.type === type);
    targetItems.forEach(item => restoreTrashItem(item.id));
  }, [trashItems, restoreTrashItem]);

  return (
    <AppContext.Provider
      value={{
        campaigns,
        sessions,
        scenes,
        sessionScenes,
        soundscapeCategories,
        categoryTracks,
        fxTracks,
        sceneSoundscapes,
        sceneFxTiles,
        trashItems,
        toasts,
        masterVolume,
        isMasterPlaying,
        isDucked,
        activePlayingFxCount,
        showToast,
        dismissToast,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        createSession,
        updateSession,
        deleteSession,
        touchSession,
        createScene,
        updateScene,
        duplicateScene,
        deleteScene,
        linkSceneToSession,
        unlinkSceneFromSession,
        createSoundscapeCategory,
        deleteSoundscapeCategory,
        assignTrackToLevel,
        removeTrackFromLevel,
        importFxTrack,
        updateFxTrack,
        deleteFxTrack,
        addSoundscapesToScene,
        removeSoundscapeFromScene,
        setCategoryVolume,
        setCategoryLevel,
        toggleCategoryPlay,
        setMasterVolume,
        toggleMasterPlay,
        rollD20,
        saveSceneState,
        addFxToScene,
        removeFxFromScene,
        playSceneFxTile,
        stopSceneFxTile,
        playFxPreview,
        restoreTrashItem,
        purgeTrashItem,
        emptyTrashTab,
        restoreAllTrashTab
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
