import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import DashboardPreview from './DashboardPreview.tsx';
import './index.css';

const isPreview = new URLSearchParams(window.location.search).get('preview') === 'dashboards';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPreview ? <DashboardPreview /> : <App />}
  </StrictMode>,
);
