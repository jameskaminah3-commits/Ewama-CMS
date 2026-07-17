import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// In production the API lives on its own host/subdomain. Set VITE_API_URL at
// build time (e.g. https://api.ewamaproperties.co.ke) to point the frontend
// there. Left unset during local dev, requests stay relative and Vite proxies
// them to the local API.
const apiBase = import.meta.env.VITE_API_URL as string | undefined;
if (apiBase) {
  setBaseUrl(apiBase.replace(/\/+$/, ''));
}

createRoot(document.getElementById('root')!).render(<App />);
