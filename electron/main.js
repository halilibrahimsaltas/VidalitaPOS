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
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Port kontrolü - port kullanılıyorsa boş port bul
function checkPort(port, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    if (maxAttempts <= 0) {
      reject(new Error('Could not find available port'));
      return;
    }

    const server = createServer();
    server.listen(port, () => {
      const { port: actualPort } = server.address();
      server.close(() => {
        resolve(actualPort);
      });
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port kullanılıyor, bir sonraki portu dene
        resolve(checkPort(port + 1, maxAttempts - 1));
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
  const availablePort = await checkPort(3000);
  const portString = availablePort.toString();

  // Environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'production',
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
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
      webSecurity: false, // file:// protokolü için gerekli
      allowRunningInsecureContent: true,
    },
    icon: join(__dirname, 'icon.ico'),
    show: false
  });

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Backend başladıktan sonra frontend'i yükle
  setTimeout(() => {
    const frontendDistPath = join(__dirname, '..', 'frontend', 'dist', 'index.html');
    const frontendExists = existsSync(frontendDistPath);
    
    if (isDev) {
      // Development modunda: Önce build'i kontrol et, varsa onu kullan
      if (frontendExists) {
        console.log('Loading frontend from build (dist folder)');
        // file:// protokolü ile tam path kullan
        const fileUrl = `file://${frontendDistPath.replace(/\\/g, '/')}`;
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
        // file:// protokolü ile tam path kullan
        const fileUrl = `file://${frontendDistPath.replace(/\\/g, '/')}`;
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

  // Hata sayfası göster
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    const frontendDistPath = join(__dirname, '..', 'frontend', 'dist', 'index.html');
    
    if (errorCode === -102 || errorCode === -106) {
      // ERR_CONNECTION_REFUSED veya ERR_INTERNET_DISCONNECTED
      setTimeout(() => {
        // Build varsa onu kullan
        if (existsSync(frontendDistPath)) {
          console.log('Retrying with frontend build...');
          const fileUrl = `file://${frontendDistPath.replace(/\\/g, '/')}`;
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

app.whenReady().then(async () => {
  await startBackend();
  createWindow();

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

