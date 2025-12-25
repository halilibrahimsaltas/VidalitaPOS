import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './i18n'
import './styles/globals.css'

// ✅ Port bilgisini al
const getPort = () => {
  // Önce window.__BACKEND_PORT__ kontrol et (en güncel)
  if (typeof window !== 'undefined' && window.__BACKEND_PORT__) {
    return window.__BACKEND_PORT__;
  }
  // Sonra electronAPI'den al
  if (window.electronAPI && window.electronAPI.getBackendPort) {
    return window.electronAPI.getBackendPort();
  }
  return null; // Port henüz hazır değil
};

// ✅ Backend port hazır olana kadar bekle (GATE)
function waitForBackendPort() {
  return new Promise((resolve) => {
    // Electron ortamında değilse hemen resolve et
    if (!window.electronAPI || !window.electronAPI.isElectron) {
      resolve();
      return;
    }
    
    // Port zaten hazırsa hemen resolve et
    const port = getPort();
    if (port && port !== 3000) {
      console.log('✅ Backend port ready:', port);
      resolve();
      return;
    }
    
    console.log('⏳ Waiting for backend port...');
    
    let resolved = false;
    
    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        window.removeEventListener('backendPortReady', handler);
        if (checkInterval) clearInterval(checkInterval);
        if (timeoutId) clearTimeout(timeoutId);
      }
    };
    
    // Event'i dinle
    const handler = (event) => {
      const eventPort = event.detail.port;
      console.log('🌐 Backend port received from event:', eventPort);
      cleanup();
      resolve();
    };
    
    window.addEventListener('backendPortReady', handler);
    
    // Polling ile kontrol et (her 50ms)
    let checkInterval = setInterval(() => {
      const currentPort = getPort();
      if (currentPort && currentPort !== 3000) {
        console.log('✅ Backend port ready (polling):', currentPort);
        cleanup();
        resolve();
      }
    }, 50);
    
    // Timeout (max 3 saniye)
    let timeoutId = setTimeout(() => {
      cleanup();
      const finalPort = getPort();
      if (finalPort && finalPort !== 3000) {
        console.log('✅ Backend port ready (timeout):', finalPort);
      } else {
        console.warn('⚠️ Port timeout, but continuing anyway');
      }
      resolve();
    }, 3000);
  });
}

// ✅ App'i başlat
async function initApp() {
  try {
    // Electron ortamında port hazır olana kadar bekle
    if (window.electronAPI && window.electronAPI.isElectron) {
      await waitForBackendPort();
      const port = getPort();
      console.log('🌐 Electron detected, backend port:', port || 'unknown');
    }
    
    // App'i render et
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found!');
    }
    
    console.log('🚀 Rendering app...');
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('✅ App rendered successfully!');
  } catch (error) {
    console.error('❌ App initialization error:', error);
    throw error;
  }
}

// App'i başlat
initApp().catch((error) => {
  console.error('❌ App initialization error:', error);
  // Hata durumunda bile app'i render et (fallback)
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: Arial;">
        <h1>⚠️ Application Error</h1>
        <p>Failed to initialize application.</p>
        <p style="color: red;">${error.message}</p>
        <p>Please check the console for details.</p>
      </div>
    `;
  }
});

