import { useState, useEffect, useCallback } from 'react'
import { storage } from './storage'
import type { Campaign, Session, Scene, FxTrack, TrashItem, TrashEntityType } from './types'

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => storage.getCampaigns())

  const refresh = useCallback(() => {
    setCampaigns(storage.getCampaigns())
  }, [])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('arcanum:storage_changed', handler)
    return () => window.removeEventListener('arcanum:storage_changed', handler)
  }, [refresh])

  return { campaigns, refresh }
}

export function useSessions(campaignId?: string) {
  const [sessions, setSessions] = useState<Session[]>(() => storage.getSessions(campaignId))

  const refresh = useCallback(() => {
    setSessions(storage.getSessions(campaignId))
  }, [campaignId])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('arcanum:storage_changed', handler)
    return () => window.removeEventListener('arcanum:storage_changed', handler)
  }, [refresh])

  return { sessions, refresh }
}

export function useScenes(sessionId?: string) {
  const [scenes, setScenes] = useState<Scene[]>(() =>
    sessionId ? storage.getScenesForSession(sessionId) : storage.getScenes()
  )

  const refresh = useCallback(() => {
    setScenes(sessionId ? storage.getScenesForSession(sessionId) : storage.getScenes())
  }, [sessionId])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('arcanum:storage_changed', handler)
    return () => window.removeEventListener('arcanum:storage_changed', handler)
  }, [refresh])

  return { scenes, refresh }
}

export function useFxTracks() {
  const [fxTracks, setFxTracks] = useState<FxTrack[]>(() => storage.getFxTracks())

  const refresh = useCallback(() => {
    setFxTracks(storage.getFxTracks())
  }, [])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('arcanum:storage_changed', handler)
    return () => window.removeEventListener('arcanum:storage_changed', handler)
  }, [refresh])

  return { fxTracks, refresh }
}

export function useTrash(type?: TrashEntityType) {
  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => storage.getTrashItems(type))

  const refresh = useCallback(() => {
    setTrashItems(storage.getTrashItems(type))
  }, [type])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('arcanum:storage_changed', handler)
    return () => window.removeEventListener('arcanum:storage_changed', handler)
  }, [refresh])

  return { trashItems, refresh }
}
