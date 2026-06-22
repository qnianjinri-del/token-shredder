import { createServer, type Server } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { findAvailablePort } from './portManager';

let occupiedServer: Server | null = null;

const occupyPort = (host: string, port: number) =>
  new Promise<void>((resolve, reject) => {
    occupiedServer = createServer();
    occupiedServer.once('error', reject);
    occupiedServer.listen(port, host, () => resolve());
  });

const canListen = (host: string, port: number) =>
  new Promise<boolean>((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
  });

afterEach(
  () =>
    new Promise<void>((resolve) => {
      if (!occupiedServer) {
        resolve();
        return;
      }

      occupiedServer.close(() => {
        occupiedServer = null;
        resolve();
      });
    }),
);

describe('findAvailablePort', () => {
  it('returns the preferred port when available', async () => {
    if (!(await canListen('127.0.0.1', 18491))) {
      return;
    }

    await expect(findAvailablePort('127.0.0.1', 18491, 18492)).resolves.toBe(18491);
  });

  it('returns the next port when the preferred port is occupied', async () => {
    if (!(await canListen('127.0.0.1', 18493))) {
      return;
    }

    await occupyPort('127.0.0.1', 18493);

    await expect(findAvailablePort('127.0.0.1', 18493, 18494)).resolves.toBe(18494);
  });
});
