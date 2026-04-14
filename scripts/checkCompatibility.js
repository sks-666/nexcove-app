#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'),
);

const deps = pkg.dependencies || {};

const required = {
  expo: '~55.0.0',
  react: '19.1.0',
  'react-native': '0.85.0',
  '@reduxjs/toolkit': '^2.6.1',
  '@tanstack/react-query': '^5.66.8',
  axios: '^1.8.4',
  'expo-auth-session': '~7.0.8',
};

const removed = ['expo-facebook', 'react-native-fbsdk-next'];

const problems = [];
const warnings = [];

for (const [name, version] of Object.entries(required)) {
  if (!deps[name]) {
    problems.push(`Missing required dependency: ${name}@${version}`);
  }
}

for (const name of removed) {
  if (deps[name]) {
    problems.push(`Deprecated dependency still present: ${name}@${deps[name]}`);
  }
}

const legacyGitPackages = [
  'react-native-drawer',
  'react-native-fluid-slider',
  'react-native-scrollable-tab-view',
];

for (const name of legacyGitPackages) {
  if (deps[name]) {
    warnings.push(
      `Legacy Git dependency still present: ${name}@${deps[name]} (migrate to maintained alternative)`,
    );
  }
}

if (warnings.length) {
  console.warn('Compatibility warnings:');
  warnings.forEach(item => console.warn(`- ${item}`));
}

if (problems.length) {
  console.error('Compatibility check failed:');
  problems.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Compatibility check passed for enforced baseline packages.');
if (!warnings.length) {
  console.log('No legacy package warnings detected.');
}
