import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

describe('DialogContent', () => {
  it('portals the dialog into document.body so it escapes transformed ancestors', () => {
    const host = document.createElement('div')
    host.style.transform = 'translateY(0)'
    document.body.appendChild(host)

    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent aria-labelledby="dialog-title">
          <DialogTitle id="dialog-title">Portaled dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
      { container: host },
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog.parentElement?.parentElement).toBe(document.body)
    expect(host.contains(dialog)).toBe(false)

    host.remove()
  })

  it('uses a stacking layer above the mobile menu button', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent aria-labelledby="dialog-title">
          <DialogTitle id="dialog-title">Stacked dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    )

    const overlayRoot = screen.getByRole('dialog').parentElement
    expect(overlayRoot?.className).toMatch(/z-\[70\]/)
  })
})
