import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AppDataProvider } from './context/AppDataContext'
import { ThemeProvider } from './context/ThemeContext'
import { LivePricesProvider } from './context/LivePricesContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AppDataProvider>
        <LivePricesProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </LivePricesProvider>
      </AppDataProvider>
    </ThemeProvider>
  </StrictMode>,
)
