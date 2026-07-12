import { useEffect } from 'react'

export function useMediaSession(
  focusedCategoryName: string | undefined,
  onNextTrack: (categoryName: string) => void,
): void {
  useEffect(() => {
    if (!focusedCategoryName || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: focusedCategoryName,
      artist: 'Arcanum Audio',
    })

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      onNextTrack(focusedCategoryName)
    })

    if (typeof window !== 'undefined') {
      window.__arcanumMediaSessionNextHandler = () => onNextTrack(focusedCategoryName)
    }

    return () => {
      navigator.mediaSession.setActionHandler('nexttrack', null)
      if (typeof window !== 'undefined') {
        window.__arcanumMediaSessionNextHandler = undefined
      }
    }
  }, [focusedCategoryName, onNextTrack])
}
