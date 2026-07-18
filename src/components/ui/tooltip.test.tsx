import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tooltip } from '@/components/ui/tooltip'

describe('Tooltip', () => {
  it('portals tooltip content to document.body when the trigger is hovered', async () => {
    const user = userEvent.setup()

    render(
      <div data-testid="card" className="overflow-hidden">
        <Tooltip content="0 tracks. To have this level available add at least 1 track.">
          <button type="button">III</button>
        </Tooltip>
      </div>,
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await user.hover(screen.getByRole('button', { name: 'III' }))

    const tooltip = await screen.findByRole('tooltip', {
      name: '0 tracks. To have this level available add at least 1 track.',
    })
    expect(tooltip.parentElement).toBe(document.body)
    expect(screen.getByTestId('card').contains(tooltip)).toBe(false)
  })
})
