// Preload script - güvenlik için gerekli
// Electron API'lerini renderer process'e güvenli şekilde expose eder
// Not: Preload script'leri CommonJS kullanmalı

const { contextBridge } = require('electron');

// Electron API'lerini window objesine ekle
contextBridge.exposeInMainWorld('electronAPI', {
  // Gerekirse API'ler eklenebilir
  platform: process.platform,
  isElectron: true
});

