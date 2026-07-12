import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { homePreview, isActiveScenePlaying, type HomePreviewState } from '@/lib/audio/homePreview'
import { getCategoryPreviewTrackName } from '@/hooks/useHome'

export function useHomePreview() {
  const location = useLocation()
  const [preview, setPreview] = useState<HomePreviewState>(homePreview.getState())
  const blocked = isActiveScenePlaying()

  useEffect(() => homePreview.subscribe(setPreview), [])

  useEffect(() => {
    if (location.pathname !== '/') {
      homePreview.stop()
    }
  }, [location.pathname])

  const toggleSoundscape = async (categoryId: string, categoryName: string) => {
    if (blocked) return
    const trackName = (await getCategoryPreviewTrackName(categoryId)) ?? categoryName
    await homePreview.toggleSoundscape(trackName)
  }

  const toggleFx = async (trackName: string) => {
    if (blocked) return
    await homePreview.toggleFx(trackName)
  }

  const isSoundscapePreviewing = (name: string) =>
    preview.kind === 'soundscape' && preview.name === name && preview.isPlaying

  const isSoundscapePaused = (name: string) =>
    preview.kind === 'soundscape' && preview.name === name && !preview.isPlaying

  const isFxPreviewing = (name: string) =>
    preview.kind === 'fx' && preview.name === name && preview.isPlaying

  const isFxPaused = (name: string) =>
    preview.kind === 'fx' && preview.name === name && !preview.isPlaying

  const getProgress = (kind: 'soundscape' | 'fx', name: string) =>
    preview.kind === kind && preview.name === name ? preview.progress : 0

  return {
    blocked,
    toggleSoundscape,
    toggleFx,
    isSoundscapePreviewing,
    isSoundscapePaused,
    isFxPreviewing,
    isFxPaused,
    getProgress,
  }
}
