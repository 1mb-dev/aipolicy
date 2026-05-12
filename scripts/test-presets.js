#!/usr/bin/env node
// Test that all preset template outputs are valid markdown.
// Generates every preset combination, writes to temp dir, runs markdownlint.
// Run: node scripts/test-presets.js

import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { PRESETS, FILE_TYPES } from '../public/lib/templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const tmpDir = join(root, '.tmp-test-presets');

// Extra combinations exercising freeform input + non-preset option values.
const EXTRA_COMBOS = {
  'standard-with-freeform': {
    ...PRESETS.standard,
    code_style: 'Follow airbnb/javascript. Use 2-space indentation.',
    restricted_paths: '.env, secrets/, config/production.yml',
  },
  'strict-with-attribution': {
    ...PRESETS.strict,
    ai_code: 'requires-attribution',
  },
  'open-symlink': {
    ...PRESETS.open,
    claude_handling: 'symlink',
  },
  'strict-prohibited': {
    ...PRESETS.strict,
    ai_usage: 'prohibited',
    ai_cicd: 'prohibited',
  },
};

const ALL = { ...PRESETS, ...EXTRA_COMBOS };

if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });

let fileCount = 0;
for (const [name, opts] of Object.entries(ALL)) {
  for (const ft of FILE_TYPES) {
    // Use staticPath when set: it's what gets served at /presets/<name>/
    // and what curl users download. Tests verify that output.
    const filePath = join(tmpDir, name, ft.staticPath ?? ft.path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, ft.generator(opts));
    fileCount++;
  }
}

console.log(`Generated ${fileCount} files across ${Object.keys(ALL).length} combinations.`);

// Lint all generated files. Glob includes .md (canonical convention files)
// and .mdc (Cursor's rule file format -- also markdown).
const mdlintBin = join(root, 'node_modules', '.bin', 'markdownlint-cli2');
try {
  execFileSync(mdlintBin, [`${tmpDir}/**/*.md`, `${tmpDir}/**/*.mdc`], { stdio: 'inherit' });
  console.log('All generated markdown passes lint.');
} catch (_e) {
  console.error('Markdown lint failures in generated output. Fix templates.');
  rmSync(tmpDir, { recursive: true });
  process.exit(1);
}

rmSync(tmpDir, { recursive: true });
console.log(`Tested ${Object.keys(ALL).length} preset combinations -- all clean.`);
