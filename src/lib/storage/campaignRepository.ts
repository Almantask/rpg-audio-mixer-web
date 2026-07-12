import { db } from './db'
import { getE2EState } from './e2eState'
import type {
  Campaign,
  CampaignWithSessionCount,
  CreateCampaignInput,
} from './types'

function createId(): string {
  return crypto.randomUUID()
}

async function countActiveSessions(campaignId: string): Promise<number> {
  return db.sessions
    .where('campaignId')
    .equals(campaignId)
    .filter((session) => !session.deletedAt)
    .count()
}

export async function listActiveCampaigns(): Promise<CampaignWithSessionCount[]> {
  const { campaignsLoadFail } = getE2EState()
  if (campaignsLoadFail) {
    throw new Error('Failed to load campaigns')
  }

  const campaigns = await db.campaigns.filter((campaign) => !campaign.deletedAt).toArray()
  const withCounts = await Promise.all(
    campaigns.map(async (campaign) => ({
      ...campaign,
      sessionCount: await countActiveSessions(campaign.id),
    })),
  )

  return withCounts.sort((left, right) => right.lastPlayedAt - left.lastPlayedAt)
}

export async function getCampaign(id: string): Promise<Campaign | undefined> {
  const campaign = await db.campaigns.get(id)
  if (!campaign || campaign.deletedAt) return undefined
  return campaign
}

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const now = Date.now()
  const campaign: Campaign = {
    id: createId(),
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    coverArtUrl: input.coverArtUrl,
    lastPlayedAt: now,
    createdAt: now,
  }
  await db.campaigns.add(campaign)
  return campaign
}

export async function softDeleteCampaign(id: string): Promise<void> {
  const deletedAt = Date.now()
  await db.campaigns.update(id, { deletedAt })
  await db.sessions.where('campaignId').equals(id).modify({ deletedAt })
}

export async function restoreCampaign(id: string): Promise<void> {
  await db.campaigns.update(id, { deletedAt: undefined })
  await db.sessions.where('campaignId').equals(id).modify({ deletedAt: undefined })
}

export async function touchCampaignPlayed(id: string): Promise<void> {
  await db.campaigns.update(id, { lastPlayedAt: Date.now() })
}

export async function listDeletedCampaigns(): Promise<Campaign[]> {
  return db.campaigns.filter((campaign) => Boolean(campaign.deletedAt)).toArray()
}

export async function getActiveSessionCount(campaignId: string): Promise<number> {
  return countActiveSessions(campaignId)
}
