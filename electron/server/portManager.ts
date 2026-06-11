import { createServer } from 'node:net';

export const DEFAULT_USAGE_HOST = '127.0.0.1';
export const DEFAULT_USAGE_PORT = 17391;
export const MAX_USAGE_PORT = 17400;

export const isPortAvailable = (host: string, port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });

export const findAvailablePort = async (
  host = DEFAULT_USAGE_HOST,
  startPort = DEFAULT_USAGE_PORT,
  endPort = MAX_USAGE_PORT,
): Promise<number | null> => {
  for (let port = startPort; port <= endPort; port += 1) {
    if (await isPortAvailable(host, port)) {
      return port;
    }
  }

  return null;
};
