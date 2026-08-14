import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from './storage'

describe('Storage Repository', () => {
  beforeEach(() => {
    storage.reset()
  })

  it('creates and retrieves campaigns', () => {
    expect(storage.getCampaigns()).toHaveLength(0)

    const c = storage.createCampaign({ name: 'Curse of Strahd', description: 'Gothic Horror' })
    expect(c.name).toBe('Curse of Strahd')

    const list = storage.getCampaigns()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(c.id)
  })

  it('soft-deletes campaigns and moves to trash with 7-day retention', () => {
    const c = storage.createCampaign({ name: 'Underdark' })
    storage.deleteCampaign(c.id)

    expect(storage.getCampaigns()).toHaveLength(0)
    const trash = storage.getTrashItems('campaign')
    expect(trash).toHaveLength(1)
    expect(trash[0].title).toBe('Underdark')

    storage.restoreTrashItem(trash[0].id)
    expect(storage.getCampaigns()).toHaveLength(1)
  })

  it('creates and numbers sessions per campaign', () => {
    const c = storage.createCampaign({ name: 'Campaign 1' })
    const s1 = storage.createSession({ campaignId: c.id, name: 'Arrival', date: '2026-01-01' })
    expect(s1.sessionNumber).toBe(1)

    const s2 = storage.createSession({ campaignId: c.id, name: 'Dungeon', date: '2026-01-02' })
    expect(s2.sessionNumber).toBe(2)
  })

  it('duplicates scenes independently and appends Copy of', () => {
    const sc = storage.createScene({ name: 'Tavern', tags: ['Social'] })
    const copy = storage.duplicateScene(sc.id)
    expect(copy?.name).toBe('Copy of Tavern')
    expect(copy?.id).not.toBe(sc.id)
    expect(storage.getScenes()).toHaveLength(2)
  })

  it('adds and removes soundboard effects from a scene', () => {
    const sc = storage.createScene({ name: 'Battlefield' })
    const fxList = storage.getFxTracks()
    const fx = fxList[0]

    storage.addFxToSoundboard(sc.id, fx.id)
    const updated = storage.getSceneById(sc.id)
    expect(updated?.soundboardEffects).toHaveLength(1)
    expect(updated?.soundboardEffects[0].hotkeyLabel).toBe('Num 1')

    storage.removeFxFromSoundboard(sc.id, updated!.soundboardEffects[0].id)
    const empty = storage.getSceneById(sc.id)
    expect(empty?.soundboardEffects).toHaveLength(0)
  })
})
