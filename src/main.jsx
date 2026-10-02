import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from './lib/analytics.js'
import { initTheme } from './lib/theme.js'
import { startTimeOfDay } from './lib/tod.js'

// Activate the non-blocking font stylesheets from index.html.
document.querySelectorAll('link[data-async-font]').forEach((link) => {
  link.media = 'all'
})

initAnalytics()
startTimeOfDay()
initTheme()

// #root already holds prerendered HTML for search engines (scripts/prerender.js).
// createRoot replaces it instead of hydrating, because the boot screen, clock and
// animations legitimately differ from the build-time snapshot.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
