import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AvatarSelection from './components/AvatarSelection.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AvatarSelection />
  </StrictMode>,
)
