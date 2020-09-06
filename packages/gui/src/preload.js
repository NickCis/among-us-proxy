import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (method, arg) => {
    ipcRenderer.send(method, arg);
  },
  on: (m, f) => {
    ipcRenderer.on(m, f);
  },
  removeListener: (m, f) => {
    ipcRenderer.removeListener(m, f);
  },
});
