import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('tokenShredderDesktop', {
  openSettings: () => ipcRenderer.invoke('token-shredder:open-settings'),
  quit: () => ipcRenderer.invoke('token-shredder:quit'),
  movePetBy: (delta: { x: number; y: number }) => ipcRenderer.invoke('token-shredder:move-pet-by', delta),
  resizePet: (scale: number) => ipcRenderer.invoke('token-shredder:resize-pet', scale),
  openExternal: (url: string) => ipcRenderer.invoke('token-shredder:open-external', url),
  getMonitorInfo: () => ipcRenderer.invoke('token-shredder:get-monitor-info'),
  configureProvider: (config: unknown) => ipcRenderer.invoke('token-shredder:configure-provider', config),
  testProvider: (payload: unknown) => ipcRenderer.invoke('token-shredder:test-provider', payload),
  onUsageEvent: (callback: (event: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, usageEvent: unknown) => callback(usageEvent);
    ipcRenderer.on('token-shredder:usage-event', handler);
    return () => ipcRenderer.removeListener('token-shredder:usage-event', handler);
  },
  onClearMonitoring: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('token-shredder:clear-monitoring', handler);
    return () => ipcRenderer.removeListener('token-shredder:clear-monitoring', handler);
  },
});
