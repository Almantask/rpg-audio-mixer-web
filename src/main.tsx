import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import { AppRoutes } from './App'

import { CampaignDataProvider } from '@/context/CampaignDataContext'

import { ToastProvider } from '@/components/shared/ToastProvider'

import './index.css'



createRoot(document.getElementById('root')!).render(

  <StrictMode>

    <CampaignDataProvider>

      <ToastProvider>

        <AppRoutes />

      </ToastProvider>

    </CampaignDataProvider>

  </StrictMode>,

)

