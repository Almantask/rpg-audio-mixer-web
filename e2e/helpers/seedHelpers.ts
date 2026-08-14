import type { Page } from '@playwright/test'

async function ensureAppLoaded(page: Page) {
  const url = page.url()
  if (url === 'about:blank' || !url.includes('localhost')) {
    await page.goto('/')
  }
}

export async function resetBrowserStorage(page: Page) {
  await ensureAppLoaded(page)
  await page.evaluate(() => {
    localStorage.clear()
    if (window.__ARCANUM_AUDIO_STATE__) {
      window.__ARCANUM_AUDIO_STATE__.isPlaying = false
      window.__ARCANUM_AUDIO_STATE__.playingTracks = []
    }
  })
}

export async function seedCampaign(
  page: Page,
  campaign: { id?: string; name: string; description?: string; coverArt?: string; lastPlayedAt?: string }
) {
  await ensureAppLoaded(page)
  return await page.evaluate((c) => {
    const raw = localStorage.getItem('arcanum_campaigns')
    const list = raw ? JSON.parse(raw) : []
    const now = new Date().toISOString()
    const newCamp = {
      id: c.id || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: c.name,
      description: c.description,
      coverArt: c.coverArt,
      createdAt: now,
      lastPlayedAt: c.lastPlayedAt || now,
    }
    list.unshift(newCamp)
    localStorage.setItem('arcanum_campaigns', JSON.stringify(list))
    return newCamp
  }, campaign)
}

export async function seedSession(
  page: Page,
  session: {
    id?: string
    campaignId: string
    sessionNumber?: number
    name: string
    date?: string
    description?: string
    coverArt?: string
    lastOpenedAt?: string
  }
) {
  await ensureAppLoaded(page)
  return await page.evaluate((s) => {
    const raw = localStorage.getItem('arcanum_sessions')
    const list = raw ? JSON.parse(raw) : []
    const campaignSessions = list.filter((item: { campaignId: string }) => item.campaignId === s.campaignId)
    const sessionNumber = s.sessionNumber || (campaignSessions.length + 1)
    const now = new Date().toISOString()
    const newSess = {
      id: s.id || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      campaignId: s.campaignId,
      sessionNumber,
      name: s.name,
      date: s.date || now.split('T')[0],
      description: s.description,
      coverArt: s.coverArt,
      createdAt: now,
      lastOpenedAt: s.lastOpenedAt || now,
    }
    list.unshift(newSess)
    localStorage.setItem('arcanum_sessions', JSON.stringify(list))
    return newSess
  }, session)
}

export async function seedScene(
  page: Page,
  scene: {
    id?: string
    name: string
    description?: string
    coverImage?: string
    tags?: string[]
    sessionId?: string
    sessionIds?: string[]
    soundboardEffects?: { id: string; fxTrackId: string; name: string; hotkeyLabel?: string; order?: number; orderIndex?: number }[]
    soundscapeCategoryIds?: string[]
    lastPlayedAt?: string
  }
) {
  await ensureAppLoaded(page)
  return await page.evaluate((sc) => {
    const raw = localStorage.getItem('arcanum_scenes')
    const list = raw ? JSON.parse(raw) : []
    const now = new Date().toISOString()
    const sessionIds = sc.sessionIds || (sc.sessionId ? [sc.sessionId] : [])
    const newScene = {
      id: sc.id || `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: sc.name,
      description: sc.description,
      coverImage: sc.coverImage,
      tags: sc.tags || [],
      sessionIds,
      soundboardEffects: sc.soundboardEffects || [],
      soundscapeCategoryIds: sc.soundscapeCategoryIds || ['cat_ambient'],
      soundboardMasterVolume: 0.85,
      createdAt: now,
      lastPlayedAt: sc.lastPlayedAt || now,
    }
    list.unshift(newScene)
    localStorage.setItem('arcanum_scenes', JSON.stringify(list))
    return newScene
  }, scene)
}
