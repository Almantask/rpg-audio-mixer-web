import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { CategoryComposerView } from './CategoryComposerView'

describe('CategoryComposerView', () => {
  it('renders 3 intensity levels and save button', () => {
    render(
      <MemoryRouter initialEntries={['/library/soundscapes/cat-weather/compose']}>
        <AppProvider>
          <Routes>
            <Route
              path="/library/soundscapes/:categoryId/compose"
              element={<CategoryComposerView />}
            />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Weather')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save composition/i })).toBeInTheDocument()
    expect(screen.getByText('Level I')).toBeInTheDocument()
    expect(screen.getByText('Level II')).toBeInTheDocument()
    expect(screen.getByText('Level III')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /save composition/i }))
    expect(screen.getByText('Composition saved')).toBeInTheDocument()
  })
})
