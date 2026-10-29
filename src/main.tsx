import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/figtree';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './index.css';
import App from './App';
import { registerServiceWorker } from './registerServiceWorker';
import { hideSplash } from './splash';
import { initInstallCapture } from './services/install';

initInstallCapture();
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
requestAnimationFrame(hideSplash);
