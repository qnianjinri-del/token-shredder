const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const appPath = path.join(root, 'release', 'mac-arm64', 'Token Shredder.app');
const asarPath = path.join(appPath, 'Contents', 'Resources', 'app.asar');
const plistPath = path.join(appPath, 'Contents', 'Info.plist');
const asarBin = path.join(root, 'node_modules', '.bin', 'asar');

const run = (command, args, options = {}) => {
  execFileSync(command, args, { stdio: 'inherit', ...options });
};

const fixFrameworkLinks = () => {
  const frameworksPath = path.join(appPath, 'Contents', 'Frameworks');

  for (const entry of fs.readdirSync(frameworksPath)) {
    if (!entry.endsWith('.framework')) {
      continue;
    }

    const frameworkPath = path.join(frameworksPath, entry);
    const binaryName = entry.replace(/\.framework$/, '');
    const relinks = [
      [binaryName, path.join('Versions', 'Current', binaryName)],
      ['Resources', path.join('Versions', 'Current', 'Resources')],
      [path.join('Versions', 'Current'), 'A'],
    ];

    if (entry === 'Electron Framework.framework') {
      relinks.push(
        ['Libraries', path.join('Versions', 'Current', 'Libraries')],
        ['Helpers', path.join('Versions', 'Current', 'Helpers')],
      );
    }

    for (const [linkPath, target] of relinks) {
      const absoluteLinkPath = path.join(frameworkPath, linkPath);
      fs.rmSync(absoluteLinkPath, { recursive: true, force: true });
      fs.symlinkSync(target, absoluteLinkPath);
    }
  }
};

const refreshAsar = () => {
  const tmpDir = path.join(root, 'tmp', 'manual-app-asar');
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  for (const item of ['dist', 'dist-electron']) {
    fs.cpSync(path.join(root, item), path.join(tmpDir, item), { recursive: true });
  }

  for (const item of ['package.json', 'LICENSE']) {
    fs.copyFileSync(path.join(root, item), path.join(tmpDir, item));
  }

  run(asarBin, ['pack', tmpDir, asarPath]);
};

const updateAsarIntegrity = () => {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(asarPath)).digest('hex');
  run('/usr/libexec/PlistBuddy', ['-c', `Set :ElectronAsarIntegrity:Resources/app.asar:hash ${hash}`, plistPath]);
};

const signApp = () => {
  for (const attribute of ['com.apple.quarantine', 'com.apple.provenance']) {
    try {
      run('xattr', ['-dr', attribute, appPath], { stdio: 'ignore' });
    } catch {
      // Some protected provenance attributes cannot be removed on recent macOS.
    }
  }

  run('codesign', ['--force', '--deep', '--sign', '-', appPath]);
  run('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath]);
};

const zipApp = () => {
  const zipPath = path.join(root, 'release', `Token-Shredder-${packageJson.version}-mac-arm64-local.zip`);
  fs.rmSync(zipPath, { force: true });
  run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', appPath, zipPath]);
  console.log(`wrote ${zipPath}`);
};

if (!fs.existsSync(appPath)) {
  throw new Error(`Missing packaged app: ${appPath}`);
}

refreshAsar();
fixFrameworkLinks();
updateAsarIntegrity();
signApp();
zipApp();
