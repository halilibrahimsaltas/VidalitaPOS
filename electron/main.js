import { app, BrowserWindow } from 'electron';
import { spawn, execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';
import { createServer } from 'net';
import http from 'http';

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
  // Production build'de backend dosyaları app.asar içinde veya extraResources'ta
  let backendPath;
  let backendDir;
  
  if (isDev) {
    backendPath = join(__dirname, '..', 'backend', 'src', 'server.js');
    backendDir = join(__dirname, '..', 'backend');
  } else {
    // Packaged app'te backend path'ini bul
    // Önce extraResources'ta ara (en güvenilir yol)
    const resourcesBackendPath = join(process.resourcesPath, 'backend', 'src', 'server.js');
    const resourcesBackendDir = join(process.resourcesPath, 'backend');
    
    // Sonra app.asar içinde ara
    const appPathBackend = join(app.getAppPath(), 'backend', 'src', 'server.js');
    const appPathBackendDir = join(app.getAppPath(), 'backend');
    
    // Debug: Tüm olası path'leri logla
    console.log('🔍 Searching for backend files...');
    console.log('   resourcesPath:', process.resourcesPath);
    console.log('   app.getAppPath():', app.getAppPath());
    console.log('   process.execPath:', process.execPath);
    console.log('   Checking resourcesBackendPath:', resourcesBackendPath, existsSync(resourcesBackendPath));
    console.log('   Checking appPathBackend:', appPathBackend, existsSync(appPathBackend));
    
    if (existsSync(resourcesBackendPath)) {
      backendPath = resourcesBackendPath;
      backendDir = resourcesBackendDir;
      console.log('✅ Found backend in extraResources');
    } else if (existsSync(appPathBackend)) {
      backendPath = appPathBackend;
      backendDir = appPathBackendDir;
      console.log('✅ Found backend in app.asar');
    } else {
      // Fallback: executable'ın yanında ara
      const exeDir = dirname(process.execPath);
      const exeBackendPath = join(exeDir, 'resources', 'app.asar', 'backend', 'src', 'server.js');
      const exeBackendDir = join(exeDir, 'resources', 'app.asar', 'backend');
      
      console.log('   Checking exeBackendPath:', exeBackendPath, existsSync(exeBackendPath));
      
      if (existsSync(exeBackendPath)) {
        backendPath = exeBackendPath;
        backendDir = exeBackendDir;
        console.log('✅ Found backend next to executable');
      } else {
        // Son çare: resourcesPath kullan (hata verebilir ama deneyelim)
        backendPath = resourcesBackendPath;
        backendDir = resourcesBackendDir;
        console.warn('⚠️  Backend not found in any location, using resourcesPath as fallback');
      }
    }
  }

  // Node executable'ını bul
  // Paketlenmiş uygulamada sistem PATH'inden node kullan
  let nodeExecutable = 'node';
  
  // Development modunda Electron'un node'unu kullanmayı dene
  if (isDev) {
    // Electron'un node'unu bul (development için)
    const electronNodePath = process.execPath.replace(/electron\.exe$/i, 'node.exe');
    if (existsSync(electronNodePath)) {
      nodeExecutable = electronNodePath;
      console.log('✅ Using Electron bundled Node.js:', nodeExecutable);
    } else {
      console.log('⚠️  Electron Node.js not found, using system Node.js from PATH');
    }
  } else {
    // Production'da sistem PATH'inden node kullan
    // Windows'ta node genellikle PATH'te olmalı
    console.log('✅ Using system Node.js from PATH (production mode)');
  }
  
  // Node'un çalışıp çalışmadığını test et
  try {
    const nodeVersion = execSync(`"${nodeExecutable}" --version`, { 
      encoding: 'utf-8',
      timeout: 5000,
      shell: true 
    }).trim();
    console.log(`✅ Node.js version: ${nodeVersion}`);
  } catch (error) {
    console.error('❌ Node.js test failed:', error.message);
    console.error('   Make sure Node.js is installed and in your PATH');
    throw new Error('Node.js not found or not executable');
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
  
  // Backend .env dosyasını oku (varsa)
  let backendEnvVars = {};
  if (!isDev) {
    // Production build'de .env dosyasını extraResources'tan oku
    const envPath = join(process.resourcesPath, 'backend', '.env');
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
              backendEnvVars[key.trim()] = valueParts.join('=').trim();
            }
          }
        });
        console.log('✅ Loaded backend .env file from:', envPath);
      } catch (error) {
        console.warn('⚠️  Could not read backend .env file:', error.message);
      }
    } else {
      console.warn('⚠️  Backend .env file not found at:', envPath);
      console.warn('   Using default environment variables.');
      console.warn('   NOTE: Make sure to include .env file in the build!');
    }
  } else {
    // Development modunda backend dizininden oku
    const devEnvPath = join(backendDir, '.env');
    if (existsSync(devEnvPath)) {
      try {
        const envContent = readFileSync(devEnvPath, 'utf-8');
        envContent.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
              backendEnvVars[key.trim()] = valueParts.join('=').trim();
            }
          }
        });
        console.log('✅ Loaded backend .env file from:', devEnvPath);
      } catch (error) {
        console.warn('⚠️  Could not read backend .env file:', error.message);
      }
    }
  }
  
  const env = {
    ...process.env,
    ...backendEnvVars, // Backend .env değerlerini önce ekle
    NODE_ENV: isDev ? 'development' : 'production',
    PORT: portString,
    // DATABASE_URL'i backendEnvVars'tan al, yoksa default kullan
    DATABASE_URL: backendEnvVars.DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/vidalita_retail?schema=public',
    // JWT secrets'ları backendEnvVars'tan al, yoksa default kullan
    JWT_SECRET: backendEnvVars.JWT_SECRET || process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
    JWT_REFRESH_SECRET: backendEnvVars.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_production',
    JWT_ACCESS_EXPIRATION: backendEnvVars.JWT_ACCESS_EXPIRATION || process.env.JWT_ACCESS_EXPIRATION || '15m',
    JWT_REFRESH_EXPIRATION: backendEnvVars.JWT_REFRESH_EXPIRATION || process.env.JWT_REFRESH_EXPIRATION || '7d',
    FRONTEND_URL: backendEnvVars.FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
  };

  // backendDir yukarıda zaten set edildi

  // Backend path'ini doğrula
  if (!existsSync(backendPath)) {
    console.error('❌ Backend file not found at:', backendPath);
    console.error('   Please check the build configuration.');
    throw new Error(`Backend file not found: ${backendPath}`);
  }
  
  // Backend directory'yi doğrula
  if (!existsSync(backendDir)) {
    console.error('❌ Backend directory not found at:', backendDir);
    console.error('   Please check the build configuration.');
    throw new Error(`Backend directory not found: ${backendDir}`);
  }
  
  console.log('✅ Starting backend from:', backendPath);
  console.log('✅ Backend directory:', backendDir);
  console.log('✅ Node executable:', nodeExecutable);
  console.log('✅ Using port:', portString);
  if (availablePort !== 3000) {
    console.warn(`⚠️  Port 3000 is in use, using port ${availablePort} instead`);
  }
  
  // Prisma schema path'ini kontrol et
  const prismaSchemaPath = join(backendDir, 'prisma', 'schema.prisma');
  if (!existsSync(prismaSchemaPath)) {
    console.warn('⚠️  Prisma schema not found at:', prismaSchemaPath);
    console.warn('   Database operations may fail.');
  } else {
    console.log('✅ Prisma schema found at:', prismaSchemaPath);
  }
  
  // Prisma client'ın generate edilip edilmediğini kontrol et
  const prismaClientPath = join(backendDir, 'node_modules', '.prisma', 'client', 'index.js');
  if (!existsSync(prismaClientPath)) {
    console.warn('⚠️  Prisma Client not generated. Generating now...');
    try {
      // npx yerine doğrudan node ile prisma'yı çalıştır
      const prismaCliPath = join(backendDir, 'node_modules', '.bin', 'prisma');
      const prismaCmd = process.platform === 'win32' 
        ? `"${prismaCliPath}.cmd" generate`
        : `"${prismaCliPath}" generate`;
      
      console.log('   Running:', prismaCmd);
      execSync(prismaCmd, {
        cwd: backendDir,
        env: { ...env, PATH: process.env.PATH },
        stdio: 'inherit', // Output'u göster
        timeout: 120000, // 120 saniye timeout (Prisma generate uzun sürebilir)
        shell: true
      });
      console.log('✅ Prisma Client generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate Prisma Client:', error.message);
      console.error('   Error details:', error);
      // Prisma generate başarısız olsa bile backend'i başlatmayı dene
      // (belki zaten generate edilmiştir ama path yanlıştır)
    }
  } else {
    console.log('✅ Prisma Client already generated');
  }

  // Backend node_modules'ının varlığını kontrol et
  const backendNodeModules = join(backendDir, 'node_modules');
  if (!existsSync(backendNodeModules)) {
    console.error('❌ Backend node_modules not found at:', backendNodeModules);
    console.error('   Backend dependencies are not installed!');
    throw new Error(`Backend node_modules not found: ${backendNodeModules}`);
  } else {
    console.log('✅ Backend node_modules found');
  }
  
  // Backend'in package.json'ını kontrol et
  const backendPackageJson = join(backendDir, 'package.json');
  if (!existsSync(backendPackageJson)) {
    console.error('❌ Backend package.json not found at:', backendPackageJson);
    throw new Error(`Backend package.json not found: ${backendPackageJson}`);
  } else {
    console.log('✅ Backend package.json found');
  }

  console.log('🚀 Spawning backend process...');
  console.log('   Command:', nodeExecutable, backendPath);
  console.log('   Working directory:', backendDir);
  console.log('   Environment:', {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    DATABASE_URL: env.DATABASE_URL ? '***' : 'NOT SET',
    JWT_SECRET: env.JWT_SECRET ? '***' : 'NOT SET'
  });
  
  try {
    // Windows'ta path'lerde boşluk varsa tırnak içine al
    // shell: true kullanırken, path'i tırnak içine almak gerekir
    if (process.platform === 'win32') {
      // Windows'ta path'i tırnak içine al ve shell: true ile string olarak geçir
      // Path'lerdeki tırnakları escape et
      const escapedBackendPath = backendPath.replace(/"/g, '""');
      const escapedNodeExecutable = nodeExecutable.includes(' ') 
        ? `"${nodeExecutable.replace(/"/g, '""')}"` 
        : nodeExecutable;
      const escapedBackendPathQuoted = `"${escapedBackendPath}"`;
      const command = `${escapedNodeExecutable} ${escapedBackendPathQuoted}`;
      
      console.log('   Executing command (Windows):', command);
      
      // Windows'ta shell: true ile komutu string olarak geçir
      backendProcess = spawn(command, {
        env,
        cwd: backendDir,
        stdio: 'pipe',
        shell: true
      });
    } else {
      // Unix/Linux'ta normal spawn (path'lerde boşluk olsa bile çalışır)
      console.log('   Executing command (Unix):', nodeExecutable, backendPath);
      backendProcess = spawn(nodeExecutable, [backendPath], {
        env,
        cwd: backendDir,
        stdio: 'pipe',
        shell: false
      });
    }
    
    console.log('✅ Backend process spawned, PID:', backendProcess.pid);
    
    // Process'in başlatıldığını doğrula
    if (!backendProcess.pid) {
      throw new Error('Backend process PID is null - process may not have started');
    }
  } catch (error) {
    console.error('❌ Failed to spawn backend process:', error);
    console.error('   Node executable:', nodeExecutable);
    console.error('   Backend path:', backendPath);
    console.error('   Backend directory:', backendDir);
    console.error('   Error details:', error.message);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('backend-error', {
        message: `Failed to spawn backend: ${error.message}`,
        nodeExecutable,
        backendPath,
        backendDir
      });
    }
    throw error;
  }

  // Backend'in başarıyla başladığını kontrol et
  let backendStarted = false;
  let backendOutput = ''; // Backend output'unu biriktir (debug için)
  const backendStartTimeout = setTimeout(() => {
    if (!backendStarted) {
      console.error('❌ Backend did not start within 60 seconds!');
      console.error('   Check the error messages above for details.');
      console.error('   Backend path:', backendPath);
      console.error('   Backend directory:', backendDir);
      console.error('   Node executable:', nodeExecutable);
      console.error('   Environment variables:', {
        NODE_ENV: env.NODE_ENV,
        PORT: env.PORT,
        DATABASE_URL: env.DATABASE_URL ? 'SET' : 'NOT SET',
        JWT_SECRET: env.JWT_SECRET ? 'SET' : 'NOT SET'
      });
      console.error('   Backend output so far:');
      console.error('   ---');
      console.error(backendOutput);
      console.error('   ---');
      
      // Process durumunu kontrol et
      if (backendProcess) {
        console.error('   Process PID:', backendProcess.pid);
        console.error('   Process killed:', backendProcess.killed);
        console.error('   Process exit code:', backendProcess.exitCode);
        console.error('   Process signal:', backendProcess.signalCode);
      }
      
      // Frontend'e hata gönder
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('backend-error', {
          message: 'Backend did not start within 60 seconds',
          type: 'STARTUP_TIMEOUT',
          backendPath,
          backendDir,
          nodeExecutable,
          output: backendOutput
        });
      }
    }
  }, 60000); // 60 saniye timeout (production'da daha uzun sürebilir)

  backendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    backendOutput += output; // Output'u biriktir
    
    // Her satırı ayrı logla (daha okunabilir)
    output.split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`[Backend] ${line}`);
      }
    });
    
    // Frontend'e de log gönder (debug için)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('backend-log', { type: 'stdout', message: output });
    }
    
    // Backend'in gerçek portunu parse et (örnek: "Server running on http://localhost:3011")
    const portMatch = output.match(/localhost:(\d+)/) || output.match(/port\s+(\d+)/i) || output.match(/:(\d+)/);
    if (portMatch && portMatch[1]) {
      const actualPort = parseInt(portMatch[1], 10);
      if (actualPort !== backendPort) {
        console.log(`🔄 Backend using different port: ${actualPort} (expected: ${backendPort})`);
        backendPort = actualPort; // Port'u güncelle
        portString = actualPort.toString();
        
        // Frontend'e gerçek port'u gönder
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('backend-port', actualPort);
          console.log(`✅ Updated frontend with actual backend port: ${actualPort}`);
        }
      }
    }
    
    // Backend başarıyla başladı mı kontrol et
    if (output.includes('Server running on') || output.includes('🚀 Server running')) {
      backendStarted = true;
      clearTimeout(backendStartTimeout);
      console.log('✅ Backend started successfully on port', backendPort);
      
      // Frontend'e backend'in hazır olduğunu bildir (gerçek port ile)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('backend-ready', { port: backendPort });
        // Port'u da güncelle (gerçek port ile)
        mainWindow.webContents.send('backend-port', backendPort);
        
        // Window'a da inject et
        mainWindow.webContents.executeJavaScript(`
          window.__BACKEND_PORT__ = ${backendPort};
          console.log('🔌 Backend port updated to:', ${backendPort});
        `).catch(() => {});
      }
      
      // Backend'in gerçekten çalıştığını doğrula (health check)
      setTimeout(() => {
        const healthCheckUrl = `http://localhost:${portString}/health`;
        const req = http.get(healthCheckUrl, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log('✅ Backend health check passed');
            } else {
              console.warn('⚠️  Backend health check returned status:', res.statusCode);
            }
          });
        });
        
        req.on('error', (err) => {
          console.warn('⚠️  Backend health check failed:', err.message);
          console.warn('   Backend may still be starting up or there may be an issue.');
        });
        
        req.setTimeout(5000, () => {
          req.destroy();
          console.warn('⚠️  Backend health check timeout');
        });
      }, 2000); // 2 saniye bekle
    }
  });

  backendProcess.stderr.on('data', (data) => {
    const errorMsg = data.toString();
    backendOutput += errorMsg; // Error output'unu da biriktir
    
    // Her satırı ayrı logla (daha okunabilir)
    errorMsg.split('\n').forEach(line => {
      if (line.trim()) {
        console.error(`[Backend ERROR] ${line}`);
      }
    });
    
    // Frontend'e de error gönder
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('backend-log', { type: 'stderr', message: errorMsg });
    }
    
    // EADDRINUSE hatası durumunda kullanıcıya bilgi ver
    if (errorMsg.includes('EADDRINUSE')) {
      console.error('⚠️  Port is still in use. Please close the process using this port.');
      console.error('   You can find it with: Get-NetTCPConnection -LocalPort ' + portString);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('backend-error', {
          message: `Port ${portString} is already in use`,
          type: 'EADDRINUSE'
        });
      }
    }
    
    // Database bağlantı hatası
    if (errorMsg.includes('Can\'t reach database server') || 
        errorMsg.includes('P1001') || 
        errorMsg.includes('ECONNREFUSED') ||
        errorMsg.includes('ENOTFOUND') ||
        errorMsg.includes('P1000')) {
      console.error('❌ Database connection error!');
      console.error('   Please ensure PostgreSQL is running and DATABASE_URL is correct.');
      console.error('   DATABASE_URL:', env.DATABASE_URL);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('backend-error', {
          message: 'Database connection failed. Please ensure PostgreSQL is running.',
          type: 'DATABASE_ERROR',
          databaseUrl: env.DATABASE_URL
        });
      }
    }
    
    // Prisma client hatası
    if (errorMsg.includes('PrismaClient') || errorMsg.includes('@prisma/client') || errorMsg.includes('Cannot find module')) {
      console.error('❌ Prisma Client error!');
      console.error('   Run: npx prisma generate in the backend directory');
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('backend-error', {
          message: 'Prisma Client not found. Please run: npx prisma generate',
          type: 'PRISMA_ERROR'
        });
      }
    }
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.error('❌ Backend process crashed with exit code:', code);
      console.error('   Check the error messages above for details.');
      
      // Kullanıcıya hata göster
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('backend-crashed', { exitCode: code });
      }
    }
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Failed to start backend:', error);
    console.error('   Error details:', error.message);
    console.error('   Node executable:', nodeExecutable);
    console.error('   Backend path:', backendPath);
    console.error('   Backend directory:', backendDir);
    
    // Kullanıcıya hata göster
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('backend-error', {
        message: error.message,
        nodeExecutable,
        backendPath,
        backendDir
      });
    }
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
      // DevTools'u açık tut (debug için)
      devTools: true,
    },
    icon: join(__dirname, 'icon.ico'),
    show: false
  });
  
  // DevTools'u otomatik aç (debug için)
  if (isDev || process.env.DEBUG === 'true') {
    mainWindow.webContents.openDevTools();
  }
  
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
  try {
    console.log('🚀 Starting backend...');
    await startBackend();
    console.log('✅ Backend start process completed');
  } catch (error) {
    console.error('❌ Failed to start backend:', error);
    console.error('   Error details:', error.message);
    console.error('   Stack:', error.stack);
  }
  
  // Backend port'unu frontend'e iletmek için biraz bekle
  setTimeout(() => {
    createWindow();
    
    // Eğer backend başlatılamadıysa, frontend'e bildir
    if (!backendProcess || backendProcess.killed) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('backend-error', {
          message: 'Backend failed to start. Check console for details.',
          type: 'STARTUP_ERROR'
        });
      }
    }
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

