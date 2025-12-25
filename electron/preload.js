// Preload script - güvenlik için gerekli
// Electron API'lerini renderer process'e güvenli şekilde expose eder
// Not: Preload script'leri CommonJS kullanmalı

const { contextBridge, ipcRenderer } = require('electron');

// Backend port'unu IPC ile main process'ten al
let backendPort = 3000; // Default

// Main process'ten port bilgisini al (eğer gönderilirse)
try {
  // IPC handler ekle (main.js'den port gönderilecek)
  ipcRenderer.on('backend-port', (event, port) => {
    backendPort = port;
    // Global olarak da set et
    if (typeof window !== 'undefined') {
      window.__BACKEND_PORT__ = port;
      console.log('🔌 Backend port received from IPC:', port);
      
      // Custom event dispatch et (main.jsx için)
      window.dispatchEvent(new CustomEvent('backendPortReady', { detail: { port } }));
    }
  });
  
  // Backend başlatma durumunu dinle
  ipcRenderer.on('backend-ready', (event, data) => {
    if (typeof window !== 'undefined') {
      window.__BACKEND_PORT__ = data.port;
      backendPort = data.port;
      console.log('✅ Backend ready on port:', data.port);
      // Custom event dispatch et
      window.dispatchEvent(new CustomEvent('backend-ready', { detail: data }));
    }
  });
  
  // Backend hatalarını dinle
  ipcRenderer.on('backend-error', (event, error) => {
    console.error('❌ Backend error:', error);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend-error', { detail: error }));
    }
  });
  
  // Backend crash durumunu dinle
  ipcRenderer.on('backend-crashed', (event, data) => {
    console.error('❌ Backend crashed with exit code:', data.exitCode);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend-crashed', { detail: data }));
    }
  });
} catch (e) {
  // IPC yoksa default kullan
  console.warn('⚠️ IPC not available:', e);
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  // Backend port'unu al
  getBackendPort: () => {
    // Önce window.__BACKEND_PORT__ kontrol et (main.js'den inject edilir)
    if (typeof window !== 'undefined' && window.__BACKEND_PORT__) {
      return window.__BACKEND_PORT__;
    }
    return backendPort; // IPC'den alınan veya default
  }
});

// Global olarak da expose et
if (typeof window !== 'undefined') {
  window.__BACKEND_PORT__ = backendPort;
}

