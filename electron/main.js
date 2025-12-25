import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { createServer } from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let backendProcess;
let backendPort = 3000; // Backend port'unu sakla
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// SSL certificate errors'ı suppress et (development için)
// Command line flag'leri ayarla - app.whenReady()'den ÖNCE çağrılmalı
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('ignore-ssl-errors');
app.commandLine.appendSwitch('ignore-certificate-errors-spki-list');
// Chromium'un internal bağlantılarını da suppress et
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');
// Log seviyesini azalt (SSL hatalarını console'dan gizle)
app.commandLine.appendSwitch('log-level', '3'); // 0=verbose, 1=info, 2=warning, 3=error

// Port kontrolü - port kullanılıyorsa boş port bul
function checkPort(port, maxAttempts = 50) {
  return new Promise((resolve, reject) => {
    if (maxAttempts <= 0) {
      reject(new Error(`Could not find available port after 50 attempts (starting from ${port - 50})`));
      return;
    }

    const server = createServer();
    
    // Timeout ekle (5 saniye)
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error(`Port check timeout for port ${port}`));
    }, 5000);
    
    server.listen(port, () => {
      clearTimeout(timeout);
      const { port: actualPort } = server.address();
      server.close(() => {
        resolve(actualPort);
      });
    });
    
    server.on('error', (err) => {
      clearTimeout(timeout);
      if (err.code === 'EADDRINUSE') {
        // Port kullanılıyor, bir sonraki portu dene (recursive)
        checkPort(port + 1, maxAttempts - 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

// Backend'i başlat
async function startBackend() {
  const backendPath = isDev 
    ? join(__dirname, '..', 'backend', 'src', 'server.js')
    : join(process.resourcesPath, 'backend', 'src', 'server.js');

  // Electron'un node.exe'sini kullan
  const nodePath = process.execPath.replace('electron.exe', 'node.exe');
  
  // Eğer node.exe bulunamazsa, sistem PATH'inden node'u kullan
  let nodeExecutable = nodePath;
  if (!existsSync(nodeExecutable)) {
    nodeExecutable = 'node';
  }

  // Port kontrolü - 3000 kullanılıyorsa boş port bul
  let availablePort;
  try {
    availablePort = await checkPort(3000);
    backendPort = availablePort; // Port'u sakla
  } catch (error) {
    console.error('❌ Port kontrolü başarısız:', error.message);
    // Fallback: 3000'i zorla kullan (hata riski var ama çalışabilir)
    console.warn('⚠️  Fallback: Port 3000 kullanılıyor (çakışma riski var)');
    availablePort = 3000;
    backendPort = 3000;
  }
  const portString = availablePort.toString();

  // Environment variables
  // Local development için NODE_ENV'i development yap
  // Production build'de app.isPackaged kontrolü ile otomatik ayarlanır
  const env = {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
    PORT: portString,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/vidalita_retail?schema=public'
  };

  // Backend'in çalışacağı dizin
  const backendDir = isDev
    ? join(__dirname, '..', 'backend')
    : join(process.resourcesPath, 'backend');

  console.log('Starting backend from:', backendPath);
  console.log('Backend directory:', backendDir);
  console.log('Node executable:', nodeExecutable);
  console.log('Using port:', portString);
  if (availablePort !== 3000) {
    console.warn(`⚠️  Port 3000 is in use, using port ${availablePort} instead`);
  }

  backendProcess = spawn(nodeExecutable, [backendPath], {
    env,
    cwd: backendDir,
    stdio: 'pipe',
    shell: true
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    const errorMsg = data.toString();
    console.error(`Backend Error: ${errorMsg}`);
    
    // EADDRINUSE hatası durumunda kullanıcıya bilgi ver
    if (errorMsg.includes('EADDRINUSE')) {
      console.error('⚠️  Port is still in use. Please close the process using this port.');
      console.error('   You can find it with: Get-NetTCPConnection -LocalPort ' + portString);
    }
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.error('Backend process crashed!');
    }
  });

  backendProcess.on('error', (error) => {
    console.error('Failed to start backend:', error);
  });
}

// Frontend'i yükle
function createWindow() {
  const frontendDistPath = join(__dirname, '..', 'frontend', 'dist', 'index.html');
  const frontendExists = existsSync(frontendDistPath);
  // file:// protokolü kullanılacak mı? (build varsa file:// kullan, yoksa http://)
  // Not: Development'ta da build varsa file:// kullanabiliriz
  const useFileProtocol = frontendExists;
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
      // file:// protokolü için webSecurity'yi sadece gerektiğinde kapat
      // http:// kullanırken güvenliği açık tut
      webSecurity: !useFileProtocol, // file:// için false, http:// için true
      allowRunningInsecureContent: useFileProtocol, // Sadece file:// için true
      // SSL hatalarını suppress et
      experimentalFeatures: false,
    },
    icon: join(__dirname, 'icon.ico'),
    show: false
  });
  
  // Port'u window oluşturulduktan hemen sonra inject et
  // (preload script çalışmadan önce, sayfa yüklenmeden önce)
  // did-start-loading çok erken, bu yüzden dom-ready kullanıyoruz
  mainWindow.webContents.once('dom-ready', () => {
    // IPC ile preload script'e port gönder
    mainWindow.webContents.send('backend-port', backendPort);
    
    // Ayrıca hemen window.__BACKEND_PORT__ olarak da set et
    mainWindow.webContents.executeJavaScript(`
      window.__BACKEND_PORT__ = ${backendPort};
      console.log('🔌 Backend port injected (dom-ready, immediate):', ${backendPort});
    `).catch(() => {});
  });

  // Content Security Policy ekle (güvenlik için)
  // Not: file:// protokolü için CSP HTTP header'ları çalışmaz, bu yüzden sadece http:// için ekliyoruz
  if (!useFileProtocol) {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* data: blob:; " +
            "connect-src 'self' http://localhost:* ws://localhost:*; " +
            "img-src 'self' data: blob: http://localhost:*; " +
            "font-src 'self' data:; " +
            "style-src 'self' 'unsafe-inline'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
          ]
        }
      });
    });
  }
  
  // Development modunda güvenlik uyarılarını azalt (production'da görünmez zaten)
  if (isDev && useFileProtocol) {
    console.log('⚠️  Security Note: webSecurity disabled for file:// protocol support');
    console.log('   This is required for loading local files. In production builds,');
    console.log('   these warnings will not appear.');
  }

  // Backend port'unu frontend'e ilet (mümkün olduğunca erken)
  // dom-ready event'inde IPC ile preload script'e gönder
  mainWindow.webContents.once('dom-ready', () => {
    // IPC ile preload script'e port gönder (preload script hazır olduğunda)
    mainWindow.webContents.send('backend-port', backendPort);
    
    // Ayrıca window.__BACKEND_PORT__ olarak da inject et (fallback)
    mainWindow.webContents.executeJavaScript(`
      window.__BACKEND_PORT__ = ${backendPort};
      console.log('🔌 Backend port injected (dom-ready):', ${backendPort});
    `).catch(() => {});
  });
  
  // did-start-loading event'inde de erken inject et (sayfa yüklenmeye başladığında)
  mainWindow.webContents.once('did-start-loading', () => {
    mainWindow.webContents.executeJavaScript(`
      window.__BACKEND_PORT__ = ${backendPort};
      console.log('🔌 Backend port injected (early):', ${backendPort});
    `).catch(() => {});
  });
  
  // did-finish-load event'inde de tekrar inject et (güvenlik için)
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      window.__BACKEND_PORT__ = ${backendPort};
      if (window.electronAPI) {
        window.electronAPI.backendPort = ${backendPort};
      }
      console.log('🔌 Backend port injected (final):', ${backendPort});
      // Port değiştiğinde event dispatch et
      window.dispatchEvent(new CustomEvent('backendPortReady', { detail: { port: ${backendPort} } }));
    `).catch(() => {});
  });
  
  // Console hatalarını logla (debug için)
  mainWindow.webContents.on('console-message', (event, level, message) => {
    if (level >= 2) { // Warning ve Error
      console.log(`[Renderer ${level === 2 ? 'WARN' : 'ERROR'}]`, message);
    }
  });

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Backend başladıktan sonra frontend'i yükle
  setTimeout(() => {
    
    if (isDev) {
      // Development modunda: Önce build'i kontrol et, varsa onu kullan
      if (frontendExists) {
        console.log('Loading frontend from build (dist folder)');
        // file:// protokolü ile tam path kullan (Windows için doğru format)
        // Windows'ta file:///C:/path formatı gerekir
        const normalizedPath = frontendDistPath.replace(/\\/g, '/');
        const fileUrl = process.platform === 'win32' 
          ? `file:///${normalizedPath}` 
          : `file://${normalizedPath}`;
        console.log('Loading from:', fileUrl);
        
        // Port'u frontend yüklenmeden ÖNCE inject et
        // will-navigate event'inde inject et (sayfa yüklenmeye başlamadan önce)
        mainWindow.webContents.once('will-navigate', () => {
          mainWindow.webContents.executeJavaScript(`
            window.__BACKEND_PORT__ = ${backendPort};
            console.log('🔌 Backend port injected (will-navigate):', ${backendPort});
          `).catch(() => {});
        });
        
        mainWindow.loadURL(fileUrl);
        mainWindow.webContents.openDevTools();
      } else {
        // Build yoksa Vite dev server'ı dene
        console.log('Frontend build not found, trying Vite dev server at http://localhost:5173');
        console.log('Note: If this fails, run "npm run build:frontend" first');
        mainWindow.loadURL('http://localhost:5173').catch(() => {
          // Vite dev server çalışmıyorsa kullanıcıya mesaj göster
          mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
            <html>
              <head><title>Frontend Not Available</title></head>
              <body style="font-family: Arial; padding: 40px; text-align: center;">
                <h1>⚠️ Frontend Not Available</h1>
                <p>Frontend build not found and Vite dev server is not running.</p>
                <p><strong>Please run one of the following:</strong></p>
                <ol style="text-align: left; display: inline-block;">
                  <li>Build frontend: <code>cd frontend && npm run build</code></li>
                  <li>Or start Vite dev server: <code>cd frontend && npm run dev</code></li>
                </ol>
                <p style="margin-top: 30px;">Backend is running at: <a href="http://localhost:3000">http://localhost:3000</a></p>
              </body>
            </html>
          `));
        });
        mainWindow.webContents.openDevTools();
      }
    } else {
      // Production modunda: Sadece build'i kullan
      if (frontendExists) {
        // file:// protokolü ile tam path kullan (Windows için doğru format)
        const normalizedPath = frontendDistPath.replace(/\\/g, '/');
        const fileUrl = process.platform === 'win32' 
          ? `file:///${normalizedPath}` 
          : `file://${normalizedPath}`;
        console.log('Loading from:', fileUrl);
        mainWindow.loadURL(fileUrl);
      } else {
        console.error('Frontend build not found!');
        mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
          <html>
            <head><title>Build Error</title></head>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
              <h1>❌ Frontend Build Not Found</h1>
              <p>Please build the frontend before creating the executable:</p>
              <p><code>cd frontend && npm run build</code></p>
            </body>
          </html>
        `));
      }
    }
  }, 3000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Hata sayfası göster ve SSL hatalarını handle et
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    // SSL/TLS related errors - bunları ignore et (sadece debug modunda göster)
    if (errorCode === -107 || errorCode === -200 || errorCode === -101) {
      // SSL handshake errors - suppress et
      if (isDev) {
        console.debug(`SSL Warning (ignored): ${errorDescription}`);
      }
      return; // SSL hatalarını ignore et
    }
    
    // Diğer hatalar için normal handling
    console.error('Failed to load:', errorCode, errorDescription, validatedURL || '');
    const frontendDistPath = join(__dirname, '..', 'frontend', 'dist', 'index.html');
    
    if (errorCode === -102 || errorCode === -106) {
      // ERR_CONNECTION_REFUSED veya ERR_INTERNET_DISCONNECTED
      setTimeout(() => {
        // Build varsa onu kullan
        if (existsSync(frontendDistPath)) {
          console.log('Retrying with frontend build...');
          const normalizedPath = frontendDistPath.replace(/\\/g, '/');
          const fileUrl = process.platform === 'win32' 
            ? `file:///${normalizedPath}` 
            : `file://${normalizedPath}`;
          mainWindow.loadURL(fileUrl);
        } else if (isDev) {
          // Development modunda tekrar dene
          console.log('Retrying Vite dev server...');
          mainWindow.loadURL('http://localhost:5173').catch(() => {
            console.error('Vite dev server still not available');
          });
        }
      }, 2000);
    }
  });
}

// SSL certificate errors'ı suppress et (development için)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // Development modunda veya localhost için certificate hatalarını ignore et
  if (isDev || url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('file://')) {
    event.preventDefault();
    callback(true); // Certificate'i kabul et
  } else {
    callback(false); // Production'da normal validation
  }
});

app.whenReady().then(async () => {
  await startBackend();
  // Backend port'unu frontend'e iletmek için biraz bekle
  setTimeout(() => {
    createWindow();
  }, 500);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Uygulama kapanırken backend'i temizle
process.on('exit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

