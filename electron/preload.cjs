const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('palmierNative', {
  platform: process.platform,
  version: '0.7.6',
  isWindows: process.platform === 'win32',
  mcpPort: 19789
});
