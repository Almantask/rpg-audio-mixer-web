import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HeroCardSurface } from '@/components/shared/HeroCardSurface'

describe('HeroCardSurface', () => {
  it('renders cover art as a cinematic background when available', () => {
    render(
      <HeroCardSurface coverArtUrl="https://example.com/cover.jpg" data-testid="hero-surface">
        <p>Title</p>
      </HeroCardSurface>,
    )

    const cover = document.querySelector('[data-hero-cover]')
    expect(cover).toBeTruthy()
    expect(cover).toHaveStyle({ backgroundImage: 'url(https://example.com/cover.jpg)' })
    expect(cover?.className).toMatch(/opacity-40/)
    expect(document.querySelector('[data-hero-fallback]')).toBeNull()
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('uses a dark gradient fallback when cover art is missing', () => {
    render(
      <HeroCardSurface data-testid="hero-surface">
        <p>Title</p>
      </HeroCardSurface>,
    )

    expect(document.querySelector('[data-hero-cover]')).toBeNull()
    const fallback = document.querySelector('[data-hero-fallback]')
    expect(fallback).toBeTruthy()
    expect(fallback?.className).toMatch(/from-gold\/15/)
  })

  it('applies the gold-bordered rounded frame shared with the home hero', () => {
    render(
      <HeroCardSurface data-testid="hero-surface">
        <p>Title</p>
      </HeroCardSurface>,
    )

    const surface = screen.getByTestId('hero-surface')
    expect(surface.className).toMatch(/rounded-xl/)
    expect(surface.className).toMatch(/border-gold\/25/)
  })
})
