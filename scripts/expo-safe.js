#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const env = { ...process.env };

function hasLibAtk() {
  const candidates = [
    '/usr/lib/x86_64-linux-gnu/libatk-1.0.so.0',
    '/lib/x86_64-linux-gnu/libatk-1.0.so.0',
    '/usr/lib64/libatk-1.0.so.0',
    '/lib64/libatk-1.0.so.0',
  ];

  return candidates.some(file => fs.existsSync(file));
}

function ensureOptionalDevToolsDoesNotBlockStartup() {
  const devToolsBin = path.resolve(
    __dirname,
    '../node_modules/@react-native/debugger-shell/bin/react-native-devtools'
  );
  const backupBin = `${devToolsBin}.real`;

  if (!fs.existsSync(devToolsBin)) {
    return;
  }

  const libAtkPresent = hasLibAtk();

  // If libatk is installed later, restore the original binary automatically.
  if (libAtkPresent && fs.existsSync(backupBin)) {
    fs.renameSync(backupBin, devToolsBin);
    console.log('[expo-safe] Restored original React Native DevTools binary.');
    return;
  }

  // In minimal/headless Linux environments, treat RN DevTools as optional.
  if (!libAtkPresent && process.platform === 'linux') {
    const currentContent = fs.readFileSync(devToolsBin, 'utf8');

    if (!currentContent.includes('expo-safe: skipping react-native-devtools')) {
      fs.copyFileSync(devToolsBin, backupBin);

      fs.writeFileSync(
        devToolsBin,
        '#!/usr/bin/env sh\n' +
          'echo "expo-safe: skipping react-native-devtools (missing libatk-1.0.so.0)"\n' +
          'exit 0\n'
      );

      fs.chmodSync(devToolsBin, 0o755);
      console.warn(
        '[expo-safe] libatk-1.0.so.0 not found; patched React Native DevTools binary to no-op so Expo startup is not blocked.'
      );
    }
  }
}

ensureOptionalDevToolsDoesNotBlockStartup();

// Keep Expo interactive/watch mode by default.
delete env.CI;

const localExpoBin = path.resolve(__dirname, '../node_modules/.bin/expo');
const expoCommand = fs.existsSync(localExpoBin) ? localExpoBin : 'expo';

const child = spawn(expoCommand, args, {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

child.on('exit', code => {
  process.exit(code ?? 1);
});

child.on('error', error => {
  console.error('[expo-safe] Failed to launch Expo CLI:', error.message);
  process.exit(1);
});
