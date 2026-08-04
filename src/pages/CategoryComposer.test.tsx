import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { CategoryComposer } from './CategoryComposer'

describe('CategoryComposer Page', () => {
  it('renders category composer for Meteorological', () => {
    render(
      <MemoryRouter initialEntries={['/library/soundscapes/sc-1/compose']}>
        <AppProvider>
          <Routes>
            <Route path="/library/soundscapes/:categoryId/compose" element={<CategoryComposer />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Meteorological')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save composition/i })).toBeInTheDocument()
  })
})
