import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'));

// Only use StrictMode in production to avoid double rendering in development
if (import.meta.env.PROD) {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  root.render(<App />);
}
