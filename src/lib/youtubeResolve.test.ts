import { describe, expect, it } from 'vitest'
import {
  extractYoutubePlaylistId,
  extractYoutubeVideoId,
  fallbackYoutubePlaylist,
  fallbackYoutubeVideo,
  isYoutubePlaylistUrl,
} from './youtubeResolve'

describe('youtubeResolve', () => {
  it('extracts video and playlist ids from common YouTube URLs', () => {
    expect(extractYoutubeVideoId('https://www.youtube.com/watch?v=12345')).toBe('12345')
    expect(extractYoutubeVideoId('https://youtu.be/abcDEFghiJK')).toBe('abcDEFghiJK')
    expect(extractYoutubePlaylistId('https://www.youtube.com/playlist?list=PL6789')).toBe('PL6789')
    expect(isYoutubePlaylistUrl('https://www.youtube.com/playlist?list=PL6789')).toBe(true)
    expect(isYoutubePlaylistUrl('https://www.youtube.com/watch?v=12345')).toBe(false)
  })

  it('builds acceptance-compatible fallback names for unresolved URLs', () => {
    expect(fallbackYoutubeVideo('https://www.youtube.com/watch?v=12345').name).toBe(
      'YouTube Video 12345',
    )
    const playlist = fallbackYoutubePlaylist('https://www.youtube.com/playlist?list=PL6789')
    expect(playlist.name).toBe('YouTube Playlist (PL6789)')
    expect(playlist.videos.map((video) => video.name)).toEqual([
      'Playlist Video A (PL678)',
      'Playlist Video B (PL678)',
      'Playlist Video C (PL678)',
    ])
  })
})
