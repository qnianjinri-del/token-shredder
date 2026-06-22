const fs = require('node:fs');
const path = require('node:path');

module.exports = async function afterPackMac(context) {
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  const appName = `${context.packager.appInfo.productFilename}.app`;
  const packagedFrameworksPath = path.join(context.appOutDir, appName, 'Contents', 'Frameworks');
  const sourceFrameworksPath = path.join(
    context.packager.projectDir,
    'node_modules',
    'electron',
    'dist',
    'Electron.app',
    'Contents',
    'Frameworks',
  );

  if (!fs.existsSync(sourceFrameworksPath)) {
    throw new Error(`Electron Frameworks not found: ${sourceFrameworksPath}`);
  }

  fs.rmSync(packagedFrameworksPath, { recursive: true, force: true });
  fs.cpSync(sourceFrameworksPath, packagedFrameworksPath, { recursive: true, dereference: false });

  for (const entry of fs.readdirSync(packagedFrameworksPath)) {
    if (!entry.endsWith('.framework')) {
      continue;
    }

    const frameworkPath = path.join(packagedFrameworksPath, entry);
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

  console.log(`  • restored original Electron Frameworks for macOS local distribution`);
};
