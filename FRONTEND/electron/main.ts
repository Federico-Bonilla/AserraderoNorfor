import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { spawn, type ChildProcess } from 'child_process'
import { Socket } from 'node:net'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let backendProcess: ChildProcess | null = null
let isQuitting = false

// T018: inicia el backend empaquetado (extraResources/backend/dist) con el
// runtime de Electron (ELECTRON_RUN_AS_NODE=1 evita depender de Node externo).
// cwd = raiz del backend (donde vive el .env que coloca el instalador/usuario);
// dotenv.config() resuelve .env relativo a process.cwd().
function startBackend(): ChildProcess {
  const backendRoot = path.join(
    process.resourcesPath ?? process.env.APP_ROOT,
    'backend',
  )
  const entryPoint = path.join(backendRoot, 'dist', 'server.js')
  const cwd = backendRoot

  console.log('[Main] Starting backend from:', entryPoint)

  const child = spawn(process.execPath, [entryPoint], {
    cwd,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      NODE_ENV: 'production',
      PORT: '3001',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (data) => {
    console.log('[Backend]', data.toString().trim())
  })

  child.stderr.on('data', (data) => {
    console.error('[Backend ERROR]', data.toString().trim())
  })

  child.on('exit', (code) => {
    console.log(`[Main] Backend exited with code ${code}`)
    if (!isQuitting) {
      console.log('[Main] Backend exited unexpectedly, restarting in 3s...')
      setTimeout(() => {
        backendProcess = startBackend()
      }, 3000)
    }
  })

  return child
}

// Espera hasta que el backend escuche en 127.0.0.1:port (timeout 30s).
function waitForBackend(port: number, timeoutMs = 30000): Promise<void> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      const socket = new Socket()
      socket.setTimeout(1000)
      socket.once('connect', () => {
        socket.destroy()
        resolve()
      })
      socket.once('error', () => {
        socket.destroy()
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Backend did not start in time'))
        } else {
          setTimeout(check, 300)
        }
      })
      socket.connect(port, '127.0.0.1')
    }
    check()
  })
}

function stopBackend(): void {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  isQuitting = true
  stopBackend()
})

app.whenReady().then(async () => {
  // T018: en produccion (sin dev server), iniciar el backend antes de la UI
  // y esperar a que escuche en 127.0.0.1:3001. En dev el backend corre aparte.
  const isDev = !!VITE_DEV_SERVER_URL
  if (!isDev) {
    backendProcess = startBackend()
    try {
      await waitForBackend(3001)
      console.log('[Main] Backend ready on port 3001')
    } catch (err) {
      console.error('[Main] Backend failed to start:', err)
    }
  }
  createWindow()
})