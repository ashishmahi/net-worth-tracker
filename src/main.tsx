import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppDataProvider } from './context/AppDataContext'
import { LivePricesProvider } from './context/LivePricesContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDataProvider>
      <LivePricesProvider>
        <App />
      </LivePricesProvider>
    </AppDataProvider>
  </StrictMode>,
)
