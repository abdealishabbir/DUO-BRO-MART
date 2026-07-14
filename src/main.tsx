import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// Suppress TS error for side-effect CSS import if no declarations are present
// @ts-ignore: Cannot find module or type declarations for side-effect import of './index.css'
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);