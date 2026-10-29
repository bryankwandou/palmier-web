const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { fork } = require('node:child_process');

let mainWindow;
let mcpProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: true,
    title: 'Palmier Pro — AI Video Editor (Windows Edition)',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0d0d0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Start internal Palmier Pro MCP Server on 127.0.0.1:19789
  const mcpServerPath = path.join(__dirname, '../server/mcpServer.js');
  try {
    mcpProcess = fork(mcpServerPath, [], { silent: false });
    console.log('[Palmier Pro] Background MCP Server started on port 19789');
  } catch (err) {
    console.error('[Palmier Pro] Failed to start MCP Server:', err);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (mcpProcess) {
    mcpProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
