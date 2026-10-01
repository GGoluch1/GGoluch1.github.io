import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from './lib/analytics.js'

// Activate the non-blocking font stylesheets from index.html.
document.querySelectorAll('link[data-async-font]').forEach((link) => {
  link.media = 'all'
})

initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
