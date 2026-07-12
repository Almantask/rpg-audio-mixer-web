import { db, getCampaignSessionsPath } from './db'
import { getE2EState } from './e2eState'
import { uniqueRestoredName } from '@/lib/constants'
import { restoreCampaign, softDeleteCampaign } from './campaignRepository'
import { restoreFxTrack } from './fxTrackRepository'
import { restoreScene } from './sceneRepository'
import { restoreCategory } from './soundscapeCategoryRepository'
import { restoreSession } from './sessionRepository'
import type { Campaign, FxTrack, Scene, Session, SoundscapeCategory } from './types'

export type TrashEntityType = 'campaigns' | 'sessions' | 'scenes' | 'soundscapes' | 'fx'

export interface TrashItem {
  id: string
  type: TrashEntityType
  name: string
  deletedAt: number
  subtitle?: string
}

async function renameOnCollision(
  table: 'campaigns' | 'scenes' | 'soundscapeCategories' | 'fxTracks',
  id: string,
  name: string,
): Promise<void> {
  const existing = await db[table]
    .filter((item: { name: string; deletedAt?: number }) => item.name === name && !item.deletedAt)
    .first()
  if (existing) {
    await db[table].update(id, { name: uniqueRestoredName(name) })
  }
}

export async function listTrashItems(type: TrashEntityType): Promise<TrashItem[]> {
  switch (type) {
    case 'campaigns': {
      const campaigns = await db.campaigns.filter((item) => Boolean(item.deletedAt)).toArray()
      return campaigns.map((campaign) => ({
        id: campaign.id,
        type,
        name: campaign.name,
        deletedAt: campaign.deletedAt!,
      }))
    }
    case 'sessions': {
      const sessions = await db.sessions.filter((item) => Boolean(item.deletedAt)).toArray()
      const items: TrashItem[] = []
      for (const session of sessions) {
        const campaign = await db.campaigns.get(session.campaignId)
        if (campaign?.deletedAt) continue
        items.push({
          id: session.id,
          type,
          name: `Session ${session.number}`,
          subtitle: session.name,
          deletedAt: session.deletedAt!,
        })
      }
      return items
    }
    case 'scenes': {
      const scenes = await db.scenes.filter((item) => Boolean(item.deletedAt)).toArray()
      return scenes.map((scene) => ({
        id: scene.id,
        type,
        name: scene.name,
        deletedAt: scene.deletedAt!,
      }))
    }
    case 'soundscapes': {
      const categories = await db.soundscapeCategories
        .filter((item) => Boolean(item.deletedAt))
        .toArray()
      return categories.map((category) => ({
        id: category.id,
        type,
        name: category.name,
        deletedAt: category.deletedAt!,
      }))
    }
    case 'fx': {
      const tracks = await db.fxTracks.filter((item) => Boolean(item.deletedAt)).toArray()
      return tracks.map((track) => ({
        id: track.id,
        type,
        name: track.name,
        deletedAt: track.deletedAt!,
      }))
    }
    default:
      return []
  }
}

export async function restoreTrashItem(item: TrashItem): Promise<void> {
  const { trashRestoreFailIds } = getE2EState()
  if (trashRestoreFailIds.includes(item.name) || trashRestoreFailIds.includes(item.id)) {
    throw new Error(`Unable to restore ${item.name}`)
  }

  switch (item.type) {
    case 'campaigns':
      await restoreCampaign(item.id)
      break
    case 'sessions': {
      const session = await db.sessions.get(item.id)
      if (!session) throw new Error('Session not found')
      await restoreSession(item.id)
      const duplicate = await db.sessions
        .where('campaignId')
        .equals(session.campaignId)
        .filter(
          (candidate) => !candidate.deletedAt && candidate.name === session.name && candidate.id !== item.id,
        )
        .first()
      if (duplicate) {
        await db.sessions.update(item.id, { name: uniqueRestoredName(session.name) })
      }
      break
    }
    case 'scenes':
      await restoreScene(item.id)
      await renameOnCollision('scenes', item.id, item.name)
      break
    case 'soundscapes':
      await restoreCategory(item.id)
      await renameOnCollision('soundscapeCategories', item.id, item.name)
      break
    case 'fx':
      await restoreFxTrack(item.id)
      await renameOnCollision('fxTracks', item.id, item.name)
      break
    default:
      break
  }
}

export async function purgeTrashItem(item: TrashItem): Promise<void> {
  const { trashPurgeFailIds } = getE2EState()
  if (trashPurgeFailIds.includes(item.name) || trashPurgeFailIds.includes(item.id)) {
    throw new Error(`Unable to purge ${item.name}`)
  }

  switch (item.type) {
    case 'campaigns':
      await db.sessions.where('campaignId').equals(item.id).delete()
      await db.campaigns.delete(item.id)
      break
    case 'sessions':
      await db.sessions.delete(item.id)
      break
    case 'scenes':
      await db.sceneSoundscapes.where('sceneId').equals(item.id).delete()
      await db.sceneEffects.where('sceneId').equals(item.id).delete()
      await db.scenes.delete(item.id)
      break
    case 'soundscapes':
      await db.intensityLevels.where('categoryId').equals(item.id).delete()
      await db.soundscapeCategories.delete(item.id)
      break
    case 'fx':
      await db.fxTracks.delete(item.id)
      break
    default:
      break
  }
}

export async function restoreTrashItems(items: TrashItem[]): Promise<{ restored: number; failed: TrashItem[] }> {
  const failed: TrashItem[] = []
  let restored = 0
  for (const item of items) {
    try {
      await restoreTrashItem(item)
      restored += 1
    } catch {
      failed.push(item)
    }
  }
  return { restored, failed }
}

export async function purgeTrashItems(items: TrashItem[]): Promise<{ purged: number; failed: TrashItem[] }> {
  const failed: TrashItem[] = []
  let purged = 0
  for (const item of items) {
    try {
      await purgeTrashItem(item)
      purged += 1
    } catch {
      failed.push(item)
    }
  }
  return { purged, failed }
}

export function getRestoreDestinationPath(item: TrashItem, campaignId?: string): string | undefined {
  switch (item.type) {
    case 'campaigns':
      return '/campaigns'
    case 'sessions':
      return campaignId ? getCampaignSessionsPath(campaignId) : undefined
    case 'scenes':
      return '/scenes'
    case 'soundscapes':
    case 'fx':
      return '/library'
    default:
      return undefined
  }
}

export async function softDeleteCampaignToTrash(campaign: Campaign): Promise<void> {
  await softDeleteCampaign(campaign.id)
}

export type { Campaign, FxTrack, Scene, Session, SoundscapeCategory }
