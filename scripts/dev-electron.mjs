import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const electronCli = path.join(rootDir, 'node_modules', 'electron', 'cli.js');

const child = spawn(process.execPath, [electronCli, '.'], {
  cwd: rootDir,
  env: {
    ...process.env,
    VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173',
  },
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
