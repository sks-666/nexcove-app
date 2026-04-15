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

if (process.platform === 'linux' && !hasLibAtk()) {
  // Treat RN DevTools setup as optional in headless/minimal Linux environments.
  // Non-interactive mode prevents debugger auto-launch from blocking startup.
  env.EXPO_NO_INTERACTIVE = env.EXPO_NO_INTERACTIVE || '1';
  env.CI = env.CI || '1';

  console.warn(
    '[expo-safe] libatk-1.0.so.0 not found; starting Expo in non-interactive mode to avoid optional DevTools launch failures.'
  );
}

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
