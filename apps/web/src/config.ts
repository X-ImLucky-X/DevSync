/**
 * Environment configuration for DevSync Web client
 */

const getBackendUrls = () => {
  const isProd = import.meta.env.PROD;
  const protocol = window.location.protocol;

  
  // Default development ports
  let api = 'http://localhost:3002';
  let ws = 'ws://localhost:3002';

  // Override using Vite environment variables if provided
  if (import.meta.env.VITE_API_URL) {
    api = import.meta.env.VITE_API_URL;
  } else if (isProd) {
    // If hosted together, use the current page's origin
    api = protocol + '//' + window.location.host;
  }

  if (import.meta.env.VITE_WS_URL) {
    ws = import.meta.env.VITE_WS_URL;
  } else if (isProd) {
    // Map http -> ws, https -> wss
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    ws = wsProtocol + '//' + window.location.host;
  }

  return { api, ws };
};

export const { api: API_URL, ws: WS_URL } = getBackendUrls();
