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
    }
  });
} catch (e) {
  // IPC yoksa default kullan
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

