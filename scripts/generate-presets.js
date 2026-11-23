#!/usr/bin/env node
// Generate static preset files for CLI downloads (curl/wget).
// Run: node scripts/generate-presets.js
// Output structure mirrors real placement: paths from FILE_TYPES are
// nested under each preset dir (e.g. presets/standard/.github/copilot-instructions.md).
// Curl users: `curl --create-dirs -O <url>` reproduces the same tree locally.

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PRESETS, FILE_TYPES } from '../public/lib/templates.js';
import { ROOT_OPTS, ROOT_FILES } from './root-policy.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

for (const [name, opts] of Object.entries(PRESETS)) {
  for (const ft of FILE_TYPES) {
    const filePath = join(root, 'public', 'presets', name, ft.staticPath ?? ft.path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, ft.generator(opts));
  }
  console.log(`Generated public/presets/${name}/ (${FILE_TYPES.length} files)`);
}

for (const ft of ROOT_FILES) {
  writeFileSync(join(root, ft.path), ft.generator(ROOT_OPTS));
  console.log(`Generated ${ft.path} (Standard preset)`);
}

console.log('Done.');
