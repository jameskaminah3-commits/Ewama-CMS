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

// A small signature for the curious who open the browser console.
console.log(
  '%c🧭 Crafted by TBM %c Tembea Bila Matata — travel without worries',
  'background:#F5B800;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:600',
  'background:#1f2937;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0;font-style:italic',
);

createRoot(document.getElementById('root')!).render(<App />);
