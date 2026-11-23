#!/usr/bin/env node
// Validate that static preset files match current template output.
// Catches drift when templates change but presets aren't regenerated.
// Run: node scripts/validate-presets.js

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PRESETS, FILE_TYPES } from '../public/lib/templates.js';
import { ROOT_OPTS, ROOT_FILES } from './root-policy.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

let drifted = false;
let checked = 0;

for (const [preset, opts] of Object.entries(PRESETS)) {
  for (const ft of FILE_TYPES) {
    const relPath = ft.staticPath ?? ft.path;
    const path = join(publicDir, 'presets', preset, relPath);
    const expected = ft.generator(opts);

    try {
      const actual = readFileSync(path, 'utf8');
      if (actual !== expected) {
        console.error(`DRIFT: public/presets/${preset}/${relPath} does not match template output`);
        drifted = true;
      }
      checked++;
    } catch (_e) {
      console.error(`MISSING: public/presets/${preset}/${relPath}`);
      drifted = true;
    }
  }
}

for (const ft of ROOT_FILES) {
  const expected = ft.generator(ROOT_OPTS);
  try {
    if (readFileSync(join(root, ft.path), 'utf8') !== expected) {
      console.error(`DRIFT: ${ft.path} is generated from the Standard preset: edit public/lib/templates.js, not this file`);
      drifted = true;
    }
    checked++;
  } catch (_e) {
    console.error(`MISSING: ${ft.path}`);
    drifted = true;
  }
}

if (drifted) {
  console.error('\nRun "make generate" to update preset files.');
  process.exit(1);
} else {
  console.log(`All ${checked} preset and root policy files match template output.`);
}
