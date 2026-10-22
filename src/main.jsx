import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './styles.css'
import App from './App.jsx'
import { CompareProvider } from './lib/CompareProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CompareProvider>
        <App />
      </CompareProvider>
    </BrowserRouter>
  </StrictMode>,
)
