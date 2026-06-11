import { app, BrowserWindow, Menu, ipcMain, screen, session, shell } from 'electron';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildUpstreamUrl,
  extractAssistantText,
  extractUsageEventFromUpstreamResponse,
  normalizeProviderProxyConfig,
  shouldUseConfiguredApiKey,
  type ProviderProxyConfig,
} from './server/openAiProxy.js';
import {
  createCodexLogWatcher,
  type CodexMonitorInfo,
} from './server/codexLogWatcher.js';
import {
  DEFAULT_USAGE_HOST,
  DEFAULT_USAGE_PORT,
  MAX_USAGE_PORT,
  findAvailablePort,
} from './server/portManager.js';
import { normalizeUsagePayload, type UsageEvent } from './server/usageNormalizer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

let petWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let usageServer: Server | null = null;
let providerProxyConfig: ProviderProxyConfig = normalizeProviderProxyConfig(null);
let codexLogWatcher: ReturnType<typeof createCodexLogWatcher> | null = null;

const PET_BASE_WINDOW_WIDTH = 190;
const PET_BASE_WINDOW_HEIGHT = 312;
const PET_WINDOW_MARGIN_X = 32;
const PET_WINDOW_MARGIN_Y = 44;
const PET_SCALE_MIN = 0.5;
const PET_SCALE_MAX = 1.25;
const PET_SCALE_DEFAULT = 0.72;

let currentPetScale = PET_SCALE_DEFAULT;
let usageServerInfo = {
  host: DEFAULT_USAGE_HOST,
  port: null as number | null,
  preferredPort: DEFAULT_USAGE_PORT,
  preferredPortAvailable: false,
  usageUrl: '',
  healthUrl: '',
  status: 'starting' as 'starting' | 'running' | 'error',
  error: undefined as string | undefined,
  receivedUsageEvents: 0,
  codexMonitor: {
    enabled: true,
    status: 'missing',
    sessionsPath: '',
  } as CodexMonitorInfo,
};

const clampPetScale = (scale: number) => {
  if (!Number.isFinite(scale) || Number.isNaN(scale)) {
    return PET_SCALE_DEFAULT;
  }

  return Math.min(PET_SCALE_MAX, Math.max(PET_SCALE_MIN, scale));
};

const getPetWindowSize = (scale = currentPetScale) => ({
  width: Math.round(PET_BASE_WINDOW_WIDTH * clampPetScale(scale)),
  height: Math.round(PET_BASE_WINDOW_HEIGHT * clampPetScale(scale)),
});

const sendJson = (response: ServerResponse, statusCode: number, payload: Record<string, unknown>) => {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
};

const readRequestBody = (request: IncomingMessage, maxBytes = 2_000_000) =>
  new Promise<string>((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > maxBytes) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });

const parseJsonBody = (body: string): unknown => JSON.parse(body || '{}');

const recordUsageEvent = (event: UsageEvent) => {
  broadcastUsageEvent(event);
  usageServerInfo = {
    ...usageServerInfo,
    receivedUsageEvents: usageServerInfo.receivedUsageEvents + 1,
  };
};

const updateCodexMonitorInfo = (codexMonitor: CodexMonitorInfo) => {
  usageServerInfo = {
    ...usageServerInfo,
    codexMonitor,
  };
};

const broadcastUsageEvent = (event: UsageEvent) => {
  for (const window of [petWindow, settingsWindow]) {
    if (window && !window.isDestroyed()) {
      window.webContents.send('token-shredder:usage-event', event);
    }
  }
};

const broadcastClearMonitoring = () => {
  for (const window of [petWindow, settingsWindow]) {
    if (window && !window.isDestroyed()) {
      window.webContents.send('token-shredder:clear-monitoring');
    }
  }
};

const resetLocalDataAndRelaunch = async () => {
  await session.defaultSession.clearCache().catch(() => undefined);
  await session.defaultSession
    .clearStorageData({
      storages: ['localstorage', 'indexdb', 'cachestorage', 'serviceworkers'],
    })
    .catch(() => undefined);
  app.relaunch();
  app.exit(0);
};

const supportedProxyPaths = new Set([
  '/v1/chat/completions',
  '/v1/responses',
  '/v1/completions',
  '/v1/embeddings',
]);

const getHeaderValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const makeProxyBaseUrl = () => {
  if (usageServerInfo.status !== 'running' || !usageServerInfo.port) {
    return '';
  }

  return `http://${usageServerInfo.host}:${usageServerInfo.port}/v1`;
};

const makeProxyHeaders = (contentType = 'application/json; charset=utf-8') => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Content-Type': contentType || 'application/json; charset=utf-8',
});

const getUpstreamErrorMessage = (json: unknown, fallback: string) => {
  if (!json || typeof json !== 'object') {
    return fallback;
  }

  const candidate = json as Record<string, unknown>;
  const error = candidate.error;
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }

  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  const message = candidate.message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return fallback;
};

const forwardOpenAiCompatibleRequest = async ({
  config,
  localPath,
  rawBody,
  requestBody,
  authorizationHeader,
}: {
  config: ProviderProxyConfig;
  localPath: string;
  rawBody: string;
  requestBody: unknown;
  authorizationHeader?: string;
}) => {
  const upstreamUrl = buildUpstreamUrl(config.upstreamBaseUrl, localPath);
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  headers.set(
    'Authorization',
    shouldUseConfiguredApiKey(authorizationHeader)
      ? `Bearer ${config.apiKey}`
      : authorizationHeader ?? `Bearer ${config.apiKey}`,
  );

  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'POST',
    headers,
    body: rawBody,
  });
  const contentType = upstreamResponse.headers.get('content-type') ?? 'application/json; charset=utf-8';
  const isStreaming =
    requestBody &&
    typeof requestBody === 'object' &&
    (requestBody as Record<string, unknown>).stream === true &&
    upstreamResponse.body;

  if (isStreaming) {
    return {
      kind: 'stream' as const,
      status: upstreamResponse.status,
      contentType,
      body: upstreamResponse.body,
    };
  }

  const text = await upstreamResponse.text();
  let json: unknown = null;
  if (contentType.includes('json') || text.trim().startsWith('{')) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = null;
    }
  }

  const usageEvent = extractUsageEventFromUpstreamResponse(json, requestBody, 'local-proxy');
  if (usageEvent) {
    recordUsageEvent(usageEvent);
  }

  return {
    kind: 'text' as const,
    status: upstreamResponse.status,
    contentType,
    text,
    json,
    usageEvent,
  };
};

const handleOpenAiCompatibleProxyRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
) => {
  if (!providerProxyConfig.enabled) {
    sendJson(response, 409, {
      ok: false,
      error: '请先在 Token Shredder 后台填写 API Key、Base URL 和模型/接入点 ID，并启用本机代理。',
    });
    return;
  }

  try {
    const rawBody = await readRequestBody(request);
    const requestBody = parseJsonBody(rawBody);
    const result = await forwardOpenAiCompatibleRequest({
      config: providerProxyConfig,
      localPath: pathname,
      rawBody,
      requestBody,
      authorizationHeader: getHeaderValue(request.headers.authorization),
    });

    if (result.kind === 'stream') {
      response.writeHead(result.status, makeProxyHeaders(result.contentType));
      const reader = result.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            response.write(Buffer.from(value));
          }
        }
      } finally {
        reader.releaseLock();
      }
      response.end();
      return;
    }

    response.writeHead(result.status, makeProxyHeaders(result.contentType));
    response.end(result.text);
  } catch (error) {
    sendJson(response, 502, {
      ok: false,
      error: error instanceof Error ? error.message : '本机代理转发失败。',
    });
  }
};

const testProviderConnection = async (payload: unknown) => {
  const candidate = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const config = normalizeProviderProxyConfig(candidate.config);
  const prompt =
    typeof candidate.prompt === 'string' && candidate.prompt.trim()
      ? candidate.prompt.trim()
      : '用一句话回复：Token Shredder 已连接。';

  if (!config.enabled) {
    return {
      ok: false,
      error: '请填写 API Key、Base URL 和模型/接入点 ID。',
    };
  }

  providerProxyConfig = config;

  try {
    const rawBody = JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
      max_tokens: 48,
    });
    const result = await forwardOpenAiCompatibleRequest({
      config,
      localPath: '/v1/chat/completions',
      rawBody,
      requestBody: JSON.parse(rawBody) as unknown,
      authorizationHeader: 'Bearer token-shredder-local',
    });

    if (result.kind === 'stream') {
      return {
        ok: false,
        error: '测试请求不应返回流式响应，请关闭 stream 后重试。',
      };
    }

    const ok = result.status >= 200 && result.status < 300;
    return {
      ok,
      status: result.status,
      proxyBaseUrl: makeProxyBaseUrl(),
      content: extractAssistantText(result.json),
      usageEvent: result.usageEvent,
      error: ok ? undefined : getUpstreamErrorMessage(result.json, '上游服务返回错误。'),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : '测试连接失败。',
    };
  }
};

const startUsageServer = () => {
  if (usageServer) {
    return Promise.resolve();
  }

  return (async () => {
    const port = await findAvailablePort(DEFAULT_USAGE_HOST, DEFAULT_USAGE_PORT, MAX_USAGE_PORT);

    if (port === null) {
      usageServerInfo = {
        ...usageServerInfo,
        status: 'error',
        error: `端口 ${DEFAULT_USAGE_PORT}-${MAX_USAGE_PORT} 都不可用。`,
      };
      return;
    }

    const usageUrl = `http://${DEFAULT_USAGE_HOST}:${port}/usage`;
    const healthUrl = `http://${DEFAULT_USAGE_HOST}:${port}/health`;

    usageServerInfo = {
      host: DEFAULT_USAGE_HOST,
      port,
      preferredPort: DEFAULT_USAGE_PORT,
      preferredPortAvailable: port === DEFAULT_USAGE_PORT,
      usageUrl,
      healthUrl,
      status: 'running',
      error: undefined,
      receivedUsageEvents: usageServerInfo.receivedUsageEvents,
      codexMonitor: usageServerInfo.codexMonitor,
    };

    usageServer = createServer((request, response) => {
      if (request.method === 'OPTIONS') {
        sendJson(response, 204, {});
        return;
      }

      const url = new URL(request.url ?? '/', `http://${DEFAULT_USAGE_HOST}:${port}`);

      if (request.method === 'GET' && url.pathname === '/health') {
        sendJson(response, 200, {
          ok: true,
          app: 'Token Shredder',
          version: app.getVersion(),
          port,
          sessionActive: usageServerInfo.receivedUsageEvents > 0,
          receivedUsageEvents: usageServerInfo.receivedUsageEvents,
          endpoint: usageUrl,
          proxyBaseUrl: makeProxyBaseUrl(),
          proxyEnabled: providerProxyConfig.enabled,
          codexMonitor: usageServerInfo.codexMonitor,
        });
        return;
      }

      if (request.method === 'DELETE' && url.pathname === '/usage') {
        usageServerInfo = {
          ...usageServerInfo,
          receivedUsageEvents: 0,
        };
        broadcastClearMonitoring();
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method === 'POST' && supportedProxyPaths.has(url.pathname)) {
        void handleOpenAiCompatibleProxyRequest(request, response, url.pathname);
        return;
      }

      if (request.method !== 'POST' || url.pathname !== '/usage') {
        sendJson(response, 404, { ok: false, error: 'Not found' });
        return;
      }

      void (async () => {
        try {
          const body = await readRequestBody(request, 1_000_000);
          const parsed = parseJsonBody(body);
          const event = normalizeUsagePayload(parsed);
          if (!event) {
            sendJson(response, 400, { ok: false, error: 'No token usage or cost found' });
            return;
          }

          recordUsageEvent(event);
          sendJson(response, 200, {
            ok: true,
            accepted: true,
            eventId: event.id,
            event,
          });
        } catch {
          sendJson(response, 400, { ok: false, error: 'Invalid JSON' });
        }
      })();
    });

    await new Promise<void>((resolve, reject) => {
      usageServer?.once('error', reject);
      usageServer?.once('listening', resolve);
      usageServer?.listen(port, DEFAULT_USAGE_HOST);
    }).catch((error: unknown) => {
      console.error('Token Shredder usage server failed:', error);
      usageServerInfo = {
        ...usageServerInfo,
        status: 'error',
        error: error instanceof Error ? error.message : '本地采集服务启动失败。',
      };
      usageServer = null;
    });
  })();
};

const startCodexMonitoring = () => {
  if (codexLogWatcher) {
    return;
  }

  codexLogWatcher = createCodexLogWatcher({
    onUsageEvent: (event) => recordUsageEvent(event),
    onInfo: updateCodexMonitorInfo,
  });
  codexLogWatcher.start();
};

const resizePetWindow = (scale: number) => {
  currentPetScale = clampPetScale(scale);

  if (!petWindow) {
    return;
  }

  const nextSize = getPetWindowSize(currentPetScale);
  const currentBounds = petWindow.getBounds();
  const display = screen.getDisplayMatching(currentBounds);
  const centeredX = currentBounds.x + Math.round((currentBounds.width - nextSize.width) / 2);
  const centeredY = currentBounds.y + Math.round((currentBounds.height - nextSize.height) / 2);
  const nextX = Math.min(
    display.workArea.x + display.workArea.width - nextSize.width,
    Math.max(display.workArea.x, centeredX),
  );
  const nextY = Math.min(
    display.workArea.y + display.workArea.height - nextSize.height,
    Math.max(display.workArea.y, centeredY),
  );

  petWindow.setBounds({ x: nextX, y: nextY, ...nextSize }, false);
};

const resolveRendererUrl = (mode: 'pet' | 'settings') => {
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    return `${process.env.VITE_DEV_SERVER_URL}/?window=${mode}`;
  }

  return `file://${path.join(__dirname, '../dist/index.html')}?window=${mode}`;
};

const createPetWindow = () => {
  const display = screen.getPrimaryDisplay();
  const petWindowSize = getPetWindowSize(currentPetScale);
  petWindow = new BrowserWindow({
    width: petWindowSize.width,
    height: petWindowSize.height,
    x: display.workArea.x + display.workArea.width - petWindowSize.width - PET_WINDOW_MARGIN_X,
    y: display.workArea.y + display.workArea.height - petWindowSize.height - PET_WINDOW_MARGIN_Y,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    title: 'Token Shredder Pet',
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.setAlwaysOnTop(true, 'floating');
  petWindow.loadURL(resolveRendererUrl('pet'));
  petWindow.webContents.on('context-menu', () => {
    Menu.buildFromTemplate([
      { label: '进入后台', click: () => createSettingsWindow() },
      { label: '重置本地配置并重启', click: () => void resetLocalDataAndRelaunch() },
      { type: 'separator' },
      { label: '退出', click: () => app.quit() },
    ]).popup({ window: petWindow ?? undefined });
  });
  petWindow.on('closed', () => {
    petWindow = null;
  });
};

const createSettingsWindow = () => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 980,
    height: 760,
    minWidth: 820,
    minHeight: 640,
    title: 'Token Shredder 后台设置',
    backgroundColor: '#101522',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  settingsWindow.loadURL(resolveRendererUrl('settings'));
  let settingsReloadedOnce = false;
  settingsWindow.webContents.on('did-fail-load', () => {
    if (!settingsWindow || settingsReloadedOnce) {
      return;
    }

    settingsReloadedOnce = true;
    settingsWindow.webContents.reloadIgnoringCache();
  });
  settingsWindow.webContents.on('did-finish-load', () => {
    if (!settingsWindow || settingsReloadedOnce) {
      return;
    }

    void settingsWindow.webContents
      .executeJavaScript('document.body.innerText.trim().length', true)
      .then((textLength: unknown) => {
        if (!settingsWindow || settingsReloadedOnce) {
          return;
        }

        if (typeof textLength !== 'number' || textLength < 20) {
          settingsReloadedOnce = true;
          settingsWindow.webContents.reloadIgnoringCache();
        }
      })
      .catch(() => undefined);
  });
  settingsWindow.webContents.on('render-process-gone', () => {
    settingsWindow = null;
    createSettingsWindow();
  });
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
};

app.whenReady().then(async () => {
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }

  Menu.setApplicationMenu(null);
  await startUsageServer();
  startCodexMonitoring();
  createPetWindow();

  ipcMain.handle('token-shredder:open-settings', () => {
    createSettingsWindow();
  });

  ipcMain.handle('token-shredder:quit', () => {
    app.quit();
  });

  ipcMain.handle('token-shredder:move-pet-by', (_event, delta: { x: number; y: number }) => {
    if (!petWindow || !Number.isFinite(delta.x) || !Number.isFinite(delta.y)) {
      return;
    }

    const [currentX, currentY] = petWindow.getPosition();
    petWindow.setPosition(Math.round(currentX + delta.x), Math.round(currentY + delta.y), false);
  });

  ipcMain.handle('token-shredder:resize-pet', (_event, scale: number) => {
    resizePetWindow(scale);
  });

  ipcMain.handle('token-shredder:open-external', (_event, url: string) => {
    if (url.startsWith('https://')) {
      shell.openExternal(url);
    }
  });

  ipcMain.handle('token-shredder:get-monitor-info', () => usageServerInfo);

  ipcMain.handle('token-shredder:configure-provider', (_event, config: unknown) => {
    providerProxyConfig = normalizeProviderProxyConfig(config);

    if (!providerProxyConfig.enabled) {
      return {
        ok: false,
        error: '请填写 API Key、Base URL 和模型/接入点 ID。',
        proxyBaseUrl: makeProxyBaseUrl(),
      };
    }

    return {
      ok: true,
      proxyBaseUrl: makeProxyBaseUrl(),
    };
  });

  ipcMain.handle('token-shredder:test-provider', (_event, payload: unknown) =>
    testProviderConnection(payload),
  );

  app.on('activate', () => {
    if (!petWindow) {
      createPetWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  codexLogWatcher?.stop();
  codexLogWatcher = null;
  usageServer?.close();
  usageServer = null;
});
