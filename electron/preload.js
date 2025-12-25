// Preload script - güvenlik için gerekli
// Electron API'lerini renderer process'e güvenli şekilde expose eder
// Not: Preload script'leri CommonJS kullanmalı

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  // Backend port'unu al (window.__BACKEND_PORT__ üzerinden)
  getBackendPort: () => {
    return window.__BACKEND_PORT__ || 3000; // Default 3000, main.js'den inject edilir
  }
});

