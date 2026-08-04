export type EntityType = 'campaign' | 'session' | 'scene' | 'soundscape' | 'fx';

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  deletedAt?: string | null;
}

export interface Session {
  id: string;
  campaignId: string;
  sessionNumber: number;
  name: string;
  description?: string;
  coverImage?: string;
  date?: string;
  lastActive?: string;
  createdAt: string;
  deletedAt?: string | null;
}

export interface Scene {
  id: string;
  name: string;
  description?: string;
  backgroundImage?: string;
  tags?: string[];
  isUserOwned: boolean;
  createdAt: string;
  deletedAt?: string | null;
}

export interface SessionScene {
  sessionId: string;
  sceneId: string;
  lastPlayedAt?: string;
}

export interface SoundscapeCategory {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isFree?: boolean;
  createdAt: string;
  deletedAt?: string | null;
}

export interface CategoryTrack {
  id: string;
  categoryId: string;
  level: 'I' | 'II' | 'III';
  name: string;
  duration: string;
  fileFormat: string;
  audioUrl?: string;
}

export interface FxTrack {
  id: string;
  name: string;
  category: string;
  duration: string;
  fileFormat: string;
  audioUrl?: string;
  isFree?: boolean;
  plays?: number;
  createdAt: string;
  deletedAt?: string | null;
}

export interface SceneSoundscape {
  sceneId: string;
  categoryId: string;
  volume: number; // 0..100
  activeLevel: 'I' | 'II' | 'III';
  isPlaying: boolean;
}

export interface SceneFxTile {
  id: string;
  sceneId: string;
  fxTrackId: string;
  position: number;
}

export interface TrashItem {
  id: string;
  type: EntityType;
  name: string;
  deletedAt: string;
  originalData: any;
}
