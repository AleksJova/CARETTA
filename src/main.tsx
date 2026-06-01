import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { seedIfEmpty } from './services/seed/seedIfEmpty';
import App from './App.tsx';

// Seed demo data before App loads — the medical store reads the data service at
// module-init time, so seeding must run first to populate the initial state.
seedIfEmpty();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
