const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  playRandomVideo: (callback) => {
    ipcRenderer.on('play-video', (_event, value, main) => {
      callback(value, main);
      console.log("Playing random video " + value);
  });
  }
})