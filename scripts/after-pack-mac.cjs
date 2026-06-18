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
  console.log(`  • restored original Electron Frameworks for macOS local distribution`);
};
